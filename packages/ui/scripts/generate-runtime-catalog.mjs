import path from "node:path";
import ts from "typescript";
import {
  compoundMembersByComponent,
  nestedUrlPropNames,
  runtimeCatalogAliases,
  runtimeCatalogCanonicalProps,
  runtimeCatalogEvents,
  runtimeCatalogOmittedStructuredProps,
  runtimeCatalogReviewedProps,
  runtimeCatalogReservedProps,
  runtimeCatalogSemanticProps,
  runtimeCatalogSingleRootEntries,
} from "./runtime-catalog-review.mjs";

const nilFlags = ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.Void;
const primitiveFlags =
  ts.TypeFlags.String |
  ts.TypeFlags.StringLiteral |
  ts.TypeFlags.Number |
  ts.TypeFlags.NumberLiteral |
  ts.TypeFlags.Boolean |
  ts.TypeFlags.BooleanLiteral;
const nonSerializableTypeName =
  /(?:^|\W)(?:Child|VNode|Component|ElementDirective|FileList|Blob|File|Event|Node|Element|Window|Document|Date|RegExp|Map|Set|Symbol)(?:$|\W)/;

function sortRecord(value) {
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right)),
  );
}

function nonNilParts(type) {
  return type.isUnion()
    ? type.types.filter((part) => (part.flags & nilFlags) === 0)
    : [type];
}

function hasFlag(type, flag) {
  const parts = nonNilParts(type);
  return parts.length > 0 && parts.every((part) => (part.flags & flag) !== 0);
}

function hasPartWithFlag(type, flag) {
  return nonNilParts(type).some((part) => (part.flags & flag) !== 0);
}

function declarationIsLocal(symbol, root) {
  return (symbol.getDeclarations() ?? []).some((declaration) => {
    const file = declaration.getSourceFile().fileName;
    return file.startsWith(path.join(root, "src") + path.sep);
  });
}

function typeLabel(type, checker) {
  return checker.typeToString(
    type,
    undefined,
    ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope,
  );
}

function containsCallable(type, checker, root, seen = new Set(), depth = 0) {
  if (depth > 8 || seen.has(type)) return false;
  seen.add(type);
  const label = typeLabel(type, checker);
  if (/^(?:Child|VNode)(?:\W|$)/.test(label)) return false;
  if (type.getCallSignatures().length > 0) return true;
  if (type.isUnionOrIntersection()) {
    return type.types.some((part) =>
      containsCallable(part, checker, root, seen, depth + 1),
    );
  }
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    return checker
      .getTypeArguments(type)
      .some((part) => containsCallable(part, checker, root, seen, depth + 1));
  }
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;
  return checker.getPropertiesOfType(type).some((property) => {
    if (!declarationIsLocal(property, root)) return false;
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    return (
      declaration !== undefined &&
      containsCallable(
        checker.getTypeOfSymbolAtLocation(property, declaration),
        checker,
        root,
        seen,
        depth + 1,
      )
    );
  });
}

function containsNestedUrl(type, checker, root, seen = new Set(), depth = 0) {
  if (depth > 8 || seen.has(type)) return false;
  seen.add(type);
  if (type.isUnionOrIntersection()) {
    return type.types.some((part) =>
      containsNestedUrl(part, checker, root, seen, depth + 1),
    );
  }
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    return checker
      .getTypeArguments(type)
      .some((part) => containsNestedUrl(part, checker, root, seen, depth + 1));
  }
  if ((type.flags & ts.TypeFlags.Object) === 0) return false;
  return checker.getPropertiesOfType(type).some((property) => {
    if (!declarationIsLocal(property, root)) return false;
    if (depth >= 1 && nestedUrlPropNames.has(property.getName())) return true;
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    return (
      declaration !== undefined &&
      containsNestedUrl(
        checker.getTypeOfSymbolAtLocation(property, declaration),
        checker,
        root,
        seen,
        depth + 1,
      )
    );
  });
}

function containsNonSerializable(type, checker, seen = new Set(), depth = 0) {
  if (depth > 8 || seen.has(type)) return false;
  seen.add(type);
  if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.ESSymbol)) !== 0) {
    return true;
  }
  if ((type.flags & (primitiveFlags | nilFlags)) !== 0) return false;
  const label = typeLabel(type, checker);
  if (nonSerializableTypeName.test(label)) return true;
  if (type.getCallSignatures().length > 0) return true;
  if (type.isUnionOrIntersection()) {
    return type.types.some((part) =>
      containsNonSerializable(part, checker, seen, depth + 1),
    );
  }
  if (checker.isArrayType(type) || checker.isTupleType(type)) {
    const arguments_ = checker.getTypeArguments(type);
    return arguments_.some((part) =>
      containsNonSerializable(part, checker, seen, depth + 1),
    );
  }
  return false;
}

function literalValues(type) {
  const parts = nonNilParts(type);
  if (parts.length === 0) return undefined;
  const values = [];
  for (const part of parts) {
    if ((part.flags & ts.TypeFlags.StringLiteral) !== 0) values.push(part.value);
    else if ((part.flags & ts.TypeFlags.NumberLiteral) !== 0) values.push(part.value);
    else if ((part.flags & ts.TypeFlags.BooleanLiteral) !== 0) {
      values.push(part.intrinsicName === "true");
    } else return undefined;
  }
  return [...new Set(values)].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );
}

function responsiveValueArgument(type) {
  if (type.aliasSymbol?.getName() === "ResponsiveValue") {
    return type.aliasTypeArguments?.[0];
  }
  if (type.isUnionOrIntersection()) {
    for (const part of type.types) {
      const argument = responsiveValueArgument(part);
      if (argument) return argument;
    }
  }
  return undefined;
}

function policyForType(type, declaredType, checker, required) {
  const nullable = type.isUnion() && type.types.some((part) => (part.flags & ts.TypeFlags.Null) !== 0);
  const responsiveArgument =
    responsiveValueArgument(declaredType) ?? responsiveValueArgument(type);
  const responsive = responsiveArgument !== undefined;
  const valueType = responsiveArgument ?? type;
  const policy = { semantic: "json" };
  const literals = literalValues(valueType);
  if (hasFlag(valueType, ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) {
    policy.validatorId = "boolean";
  } else if (literals !== undefined) {
    policy.validatorId = "literal-enum";
    policy.allowedValues = literals;
  } else if (hasFlag(valueType, ts.TypeFlags.String | ts.TypeFlags.StringLiteral)) {
    policy.validatorId = "string";
  } else if (hasFlag(valueType, ts.TypeFlags.Number | ts.TypeFlags.NumberLiteral)) {
    policy.validatorId = "finite-number";
  } else if (hasFlag(valueType, ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) {
    policy.validatorId = "boolean";
  } else if (checker.isArrayType(valueType) || checker.isTupleType(valueType)) {
    const itemTypes = checker.getTypeArguments(valueType);
    policy.validatorId =
      itemTypes.length > 0 &&
      itemTypes.every((item) => hasFlag(item, ts.TypeFlags.String | ts.TypeFlags.StringLiteral))
        ? "string-list"
        : "json-array";
  } else if ((valueType.flags & ts.TypeFlags.Object) !== 0) {
    policy.validatorId = valueType.getStringIndexType() ? "json-record" : "json";
  } else if (responsive && hasPartWithFlag(valueType, ts.TypeFlags.StringLike)) {
    // The raw provider format has no scalar-union validator id. Expose the string branch of
    // mixed responsive primitives (for example Flex gap's string | number)
    // instead of broadening the executable surface to arbitrary JSON.
    policy.validatorId = "string";
  } else if (responsive && hasPartWithFlag(valueType, ts.TypeFlags.NumberLike)) {
    policy.validatorId = "finite-number";
  } else if (responsive && hasPartWithFlag(valueType, ts.TypeFlags.BooleanLike)) {
    policy.validatorId = "boolean";
  } else {
    return undefined;
  }
  if (required) policy.required = true;
  if (responsive) policy.responsive = true;
  if (nullable) policy.nullable = true;
  return policy;
}

function propsTypeForComponent(type, checker, name) {
  const signature = type.getCallSignatures()[0];
  const parameter = signature?.parameters[0];
  const declaration = parameter?.valueDeclaration ?? parameter?.declarations?.[0];
  if (!signature || !parameter || !declaration) {
    throw new Error(`Runtime catalog component '${name}' is not a callable public component.`);
  }
  return checker.getTypeOfSymbolAtLocation(parameter, declaration);
}

function entryMetadata(
  name,
  componentType,
  checker,
  root,
  packageVersion,
  matchedOmittedStructuredProps,
) {
  const propsType = propsTypeForComponent(componentType, checker, name);
  const handlerProps = new Set();
  const props = {};
  for (const property of checker.getPropertiesOfType(propsType)) {
    const propName = property.getName();
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(propName)) continue;
    if (propName.startsWith("__")) continue;
    if (runtimeCatalogReservedProps.has(propName)) continue;
    const qualifiedPropName = `${name}.${propName}`;
    if (runtimeCatalogOmittedStructuredProps.has(qualifiedPropName)) {
      matchedOmittedStructuredProps.add(qualifiedPropName);
      continue;
    }
    const declaration = property.valueDeclaration ?? property.declarations?.[0];
    if (!declaration) continue;
    const propType = checker.getTypeOfSymbolAtLocation(property, declaration);
    if (
      nestedUrlPropNames.has(propName) &&
      !Object.hasOwn(runtimeCatalogSemanticProps, `${name}.${propName}`)
    ) {
      throw new Error(
        `Runtime catalog URL-bearing prop '${name}.${propName}' requires an explicit reviewed semantic policy.`,
      );
    }
    if (/^on[A-Z]/.test(propName) || containsCallable(propType, checker, root)) {
      handlerProps.add(propName);
      continue;
    }
    if (containsNestedUrl(propType, checker, root)) continue;
    if (propName === "className") {
      props[propName] = {
        validatorId: "class-name",
        semantic: "class-name",
      };
      continue;
    }
    if (containsNonSerializable(propType, checker)) continue;
    const declaredType = declaration.type
      ? checker.getTypeFromTypeNode(declaration.type)
      : propType;
    const policy = policyForType(
      propType,
      declaredType,
      checker,
      (property.flags & ts.SymbolFlags.Optional) === 0,
    );
    if (policy?.validatorId === "json-array") {
      throw new Error(
        `Runtime catalog structured array prop '${qualifiedPropName}' requires an explicit reviewed omission or item policy.`,
      );
    }
    if (policy) props[propName] = policy;
  }

  const reviewedPropOwner = name.endsWith(".Root")
    ? name.slice(0, -".Root".length)
    : name;
  for (const [propName, policy] of Object.entries(
    runtimeCatalogReviewedProps[reviewedPropOwner] ?? {},
  )) {
    props[propName] = policy;
  }
  for (const [propName, policy] of Object.entries(
    runtimeCatalogCanonicalProps[reviewedPropOwner] ?? {},
  )) {
    props[propName] = policy;
  }

  for (const [semanticKey, semanticPolicy] of Object.entries(runtimeCatalogSemanticProps)) {
    const separator = semanticKey.lastIndexOf(".");
    if (semanticKey.slice(0, separator) !== name) continue;
    const propName = semanticKey.slice(separator + 1);
    props[propName] = semanticPolicy;
  }
  const events = runtimeCatalogEvents[name] ?? {};
  for (const event of Object.values(events)) handlerProps.add(event.prop);
  for (const propName of Object.keys(props)) handlerProps.delete(propName);

  const capabilities = new Set(["bound-props"]);
  if (checker.getPropertyOfType(propsType, "children")) capabilities.add("children");
  if (Object.keys(events).length > 0) capabilities.add("semantic-events");
  if (Object.values(props).some((policy) => policy.responsive)) {
    capabilities.add("responsive-styles");
  }
  if (Object.values(props).some((policy) => policyHasSemantic(policy, "asset"))) {
    capabilities.add("asset-props");
  }
  if (Object.values(props).some((policy) => policyHasSemantic(policy, "url"))) {
    capabilities.add("url-props");
  }

  return {
    name,
    aliases: [...(runtimeCatalogAliases[name] ?? [])].sort(),
    handlerProps: [...handlerProps].sort(),
    events: sortRecord(events),
    props: sortRecord(props),
    instrumentation: runtimeCatalogSingleRootEntries.has(name)
      ? "single-root"
      : "range",
    capabilities: [...capabilities].sort(),
    source: {
      kind: "tavo-ui",
      packageName: "@tavojs/ui",
      packageVersion,
    },
  };
}

function policyHasSemantic(policy, semantic) {
  return (
    policy.semantic === semantic ||
    Object.values(policy.itemProperties ?? {}).some(
      (itemPolicy) => itemPolicy.semantic === semantic,
    )
  );
}

function createProgram(root) {
  const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.json");
  if (!configPath) throw new Error("Unable to find the @tavojs/ui tsconfig.json.");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
  }
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root, {
    noEmit: true,
  }, configPath);
  return ts.createProgram({
    rootNames: [path.join(root, "src", "components", "index.ts")],
    options: parsed.options,
  });
}

export function buildRuntimeCatalogComponentsSource({ componentEntries }) {
  const mappings = componentEntries.flatMap(({ name }) => [
    [name, `publicComponents.${name}`],
    ...(compoundMembersByComponent[name] ?? []).map((memberName) => [
      `${name}.${memberName}`,
      `publicComponents.${name}.${memberName}`,
    ]),
  ]);
  const entries = mappings
    .map(([name, expression]) => `  ${JSON.stringify(name)}: ${expression},`)
    .join("\n");
  return `/* This file is generated by scripts/generate-package.mjs. */\nimport * as publicComponents from "@/components/index";\n\nexport const generatedTavoUiRuntimeCatalogComponents: Readonly<Record<string, unknown>> = Object.freeze({\n${entries}\n});\n`;
}

export function buildRuntimeCatalogMetadataSource({
  root,
  packageVersion,
  componentEntries,
}) {
  const program = createProgram(root);
  const checker = program.getTypeChecker();
  const sourcePath = path.join(root, "src", "components", "index.ts");
  const source = program.getSourceFile(sourcePath);
  const moduleSymbol = source && checker.getSymbolAtLocation(source);
  if (!source || !moduleSymbol) {
    throw new Error("Unable to inspect the generated component entrypoint.");
  }
  const exportsByName = new Map(
    checker.getExportsOfModule(moduleSymbol).map((symbol) => [symbol.getName(), symbol]),
  );
  const entries = [];
  const matchedOmittedStructuredProps = new Set();
  for (const component of componentEntries) {
    const rootSymbol = exportsByName.get(component.name);
    const declaration = rootSymbol?.valueDeclaration ?? rootSymbol?.declarations?.[0];
    if (!rootSymbol || !declaration) {
      throw new Error(`Runtime catalog root '${component.name}' is not publicly exported.`);
    }
    const rootType = checker.getTypeOfSymbolAtLocation(rootSymbol, declaration);
    entries.push(
      entryMetadata(
        component.name,
        rootType,
        checker,
        root,
        packageVersion,
        matchedOmittedStructuredProps,
      ),
    );
    for (const memberName of compoundMembersByComponent[component.name] ?? []) {
      const member = checker.getPropertyOfType(rootType, memberName);
      const memberDeclaration = member?.valueDeclaration ?? member?.declarations?.[0];
      if (!member || !memberDeclaration) {
        throw new Error(
          `Runtime catalog compound '${component.name}.${memberName}' is not a real public member.`,
        );
      }
      const memberType = checker.getTypeOfSymbolAtLocation(member, memberDeclaration);
      entries.push(
        entryMetadata(
          `${component.name}.${memberName}`,
          memberType,
          checker,
          root,
          packageVersion,
          matchedOmittedStructuredProps,
        ),
      );
    }
  }

  const staleOmissions = [...runtimeCatalogOmittedStructuredProps].filter(
    (qualifiedPropName) => !matchedOmittedStructuredProps.has(qualifiedPropName),
  );
  if (staleOmissions.length > 0) {
    throw new Error(
      `Runtime catalog structured prop omission review is stale: ${staleOmissions.sort().join(", ")}.`,
    );
  }

  const metadata = { formatVersion: 1, entries };
  return `/* This file is generated by scripts/generate-package.mjs. */\nimport type { RuntimeComponentCatalogMetadata } from "./types.ts";\n\nexport const tavoUiRuntimeCatalogPackageVersion = ${JSON.stringify(packageVersion)};\nexport const generatedTavoUiRuntimeCatalogMetadata: RuntimeComponentCatalogMetadata = ${JSON.stringify(metadata, null, 2)};\n`;
}
