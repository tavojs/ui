import type { Child } from "@tavojs/core";
import styles from "./CodeBlock.module.scss";
import { cv, cx, sxClassName, type BaseProps } from "@/components/shared";
import { Text } from "@/components/Text";

export type CodeBlockEditorTheme = "auto" | "light" | "dark";

export type CodeBlockProps = BaseProps & {
  code?: string;
  language?: string;
  highlighted?: boolean;
  editorTheme?: CodeBlockEditorTheme;
  wrap?: boolean;
};

type SyntaxToken = {
  value: string;
  className?: keyof typeof styles;
};

const KEYWORDS = new Set([
  "as",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "finally",
  "for",
  "from",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "of",
  "return",
  "switch",
  "throw",
  "try",
  "type",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield"
]);

const LITERALS = new Set(["false", "null", "true", "undefined"]);
const tokenCache = new Map<string, { tokens: SyntaxToken[]; size: number }>();
const TOKEN_CACHE_LIMIT = 64;
const TOKEN_CACHE_MAX_CODE_LENGTH = 4_096;
const TOKEN_CACHE_MAX_TOTAL_LENGTH = 32_768;
let tokenCacheLength = 0;

function languageGroup(language = "") {
  const normalized = language.toLowerCase();
  if (["html", "xml", "tsx", "jsx", "vue", "svelte"].includes(normalized)) {
    return "markup";
  }
  if (["css", "scss", "sass", "less"].includes(normalized)) {
    return "style";
  }
  if (["bash", "shell", "sh", "zsh"].includes(normalized)) {
    return "shell";
  }
  if (["json"].includes(normalized)) {
    return "json";
  }
  return "script";
}

function tokenClass(value: string, group: string): keyof typeof styles | undefined {
  if (/^\/\/.*|^\/\*[\s\S]*?\*\/|^#.*$/.test(value)) return "tokenComment";
  if (/^(['"`])/.test(value)) return "tokenString";
  if (/^-?\d+(?:\.\d+)?/.test(value)) return "tokenNumber";
  if (/^[{}[\]().,;:?]/.test(value)) return "tokenPunctuation";
  if (group === "markup" && /^<\/?[A-Za-z][\w:-]*/.test(value)) return "tokenTag";
  if (group === "markup" && /^[\w:-]+(?=\=)/.test(value)) return "tokenAttribute";
  if (group === "style" && /^[\w-]+(?=\s*:)/.test(value)) return "tokenProperty";
  if (group === "shell" && /^\$[\w-]+/.test(value)) return "tokenVariable";
  if (KEYWORDS.has(value)) return "tokenKeyword";
  if (LITERALS.has(value)) return "tokenLiteral";
  return undefined;
}

function tokenize(code: string, language?: string): SyntaxToken[] {
  const group = languageGroup(language);
  const cacheKey = `${group}\0${code}`;
  if (code.length <= TOKEN_CACHE_MAX_CODE_LENGTH) {
    const cached = tokenCache.get(cacheKey);
    if (cached) {
      tokenCache.delete(cacheKey);
      tokenCache.set(cacheKey, cached);
      return cached.tokens;
    }
  }
  const pattern =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*|`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|<\/?[A-Za-z][\w:-]*|[\w:-]+(?=\=)|[\w-]+(?=\s*:)|\$[\w-]+|-?\d+(?:\.\d+)?|\b[A-Za-z_$][\w$]*\b|[{}[\]().,;:?])/g;
  const tokens: SyntaxToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(code))) {
    if (match.index > lastIndex) {
      tokens.push({ value: code.slice(lastIndex, match.index) });
    }

    const value = match[0];
    tokens.push({ value, className: tokenClass(value, group) });
    lastIndex = match.index + value.length;
  }

  if (lastIndex < code.length) {
    tokens.push({ value: code.slice(lastIndex) });
  }

  if (code.length <= TOKEN_CACHE_MAX_CODE_LENGTH) {
    const size = cacheKey.length;
    while (
      tokenCache.size >= TOKEN_CACHE_LIMIT ||
      tokenCacheLength + size > TOKEN_CACHE_MAX_TOTAL_LENGTH
    ) {
      const oldest = tokenCache.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      tokenCacheLength -= tokenCache.get(oldest)?.size ?? 0;
      tokenCache.delete(oldest);
    }
    tokenCache.set(cacheKey, { tokens, size });
    tokenCacheLength += size;
  }

  return tokens;
}

function renderHighlightedCode(code: string, language?: string): Child {
  return tokenize(code, language).map((token, index) =>
    token.className ? <span className={styles[token.className]} data-token={token.className} key={index}>{token.value}</span> : token.value
  );
}

function normalizeEscapedNewlines(code: string) {
  return code.replace(/\\r\\n|\\n|\\r/g, "\n");
}

export function CodeBlock({
  children,
  className = "",
  code,
  editorTheme = "auto",
  highlighted = true,
  language,
  wrap = false,
  ...props
}: CodeBlockProps) {
  const content = code ?? children;
  const normalizedContent = typeof content === "string"
    ? normalizeEscapedNewlines(content)
    : content;
  const canHighlight = highlighted && typeof normalizedContent === "string";

  return (
    <pre className={sxClassName(props, cx(styles.block, cv(styles, "theme", editorTheme, "auto"), wrap && styles.wrap, className))} data-language={language} {...props}>
      {language ? <Text as="span" variant="span" color="inherit" className={styles.language}>{language}</Text> : null}
      <code className={styles.code}>{canHighlight ? renderHighlightedCode(normalizedContent, language) : normalizedContent}</code>
    </pre>
  );
}
