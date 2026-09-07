import assert from "node:assert/strict";
import test from "node:test";
import { requestClientStyleCleanup, retainClientStyle, style } from "../dist/style-runtime.js";
import { responsiveStyleSheet } from "../dist/components/shared.js";

const LAYER_PRELUDE = "@layer tavo-ui.theme,tavo-ui.components,tavo-ui.overrides;";

test("client style registration scans hydrated styles once and deduplicates in O(1)", () => {
  const runtimeKey = Symbol.for("tavo.style.runtime");
  const cacheKey = Symbol.for("tavo.style.client-cache");
  const previousDocument = globalThis.document;
  const previousRuntime = globalThis[runtimeKey];
  const previousCache = globalThis[cacheKey];
  let queryCount = 0;
  const appended = [];
  const hydrated = {
    isConnected: true,
    getAttribute(name) {
      return name === "data-tavo-style" ? "hydrated" : null;
    }
  };
  const document = {
    head: {
      querySelectorAll() {
        queryCount += 1;
        return [hydrated];
      },
      appendChild(node) {
        node.isConnected = true;
        appended.push(node);
      }
    },
    createElement() {
      const attributes = new Map();
      return {
        attributes,
        isConnected: false,
        textContent: "",
        getAttribute(name) {
          return attributes.get(name) ?? null;
        },
        setAttribute(name, value) {
          attributes.set(name, value);
        }
      };
    }
  };

  try {
    delete globalThis[runtimeKey];
    delete globalThis[cacheKey];
    globalThis.document = document;

    style("hydrated", ".hydrated{}");
    style("fresh", ".fresh{}", { attributes: { nonce: "test-nonce" } });
    style("fresh", ".fresh{}");

    assert.equal(queryCount, 1);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].getAttribute("data-tavo-style"), "fresh");
    assert.equal(appended[0].getAttribute("nonce"), "test-nonce");
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousRuntime === undefined) delete globalThis[runtimeKey];
    else globalThis[runtimeKey] = previousRuntime;
    if (previousCache === undefined) delete globalThis[cacheKey];
    else globalThis[cacheKey] = previousCache;
  }
});

test("client registrations bypass the framework global runtime", () => {
  const runtimeKey = Symbol.for("tavo.style.runtime");
  const cacheKey = Symbol.for("tavo.style.client-cache");
  const previousDocument = globalThis.document;
  const previousRuntime = globalThis[runtimeKey];
  const previousCache = globalThis[cacheKey];
  const appended = [];
  let frameworkRegistrations = 0;
  let queryCount = 0;
  const document = {
    head: {
      querySelectorAll() {
        queryCount += 1;
        return [];
      },
      appendChild(node) {
        node.isConnected = true;
        appended.push(node);
      }
    },
    createElement() {
      const attributes = new Map();
      return {
        isConnected: false,
        textContent: "",
        getAttribute(name) {
          return attributes.get(name) ?? null;
        },
        setAttribute(name, value) {
          attributes.set(name, value);
        }
      };
    }
  };

  try {
    globalThis[runtimeKey] = {
      style() {
        frameworkRegistrations += 1;
      }
    };
    delete globalThis[cacheKey];
    globalThis.document = document;

    for (let index = 0; index < 100; index += 1) {
      style("tui.performance-probe", ".probe{}");
    }

    assert.equal(frameworkRegistrations, 0);
    assert.equal(queryCount, 1);
    assert.equal(appended.length, 1);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousRuntime === undefined) delete globalThis[runtimeKey];
    else globalThis[runtimeKey] = previousRuntime;
    if (previousCache === undefined) delete globalThis[cacheKey];
    else globalThis[cacheKey] = previousCache;
  }
});

test("component styles share one component-layer stylesheet", async () => {
  const cacheKey = Symbol.for("tavo.style.client-cache");
  const groupCacheKey = Symbol.for("tavo.style.client-component-group-cache");
  const previousDocument = globalThis.document;
  const previousCache = globalThis[cacheKey];
  const previousGroupCache = globalThis[groupCacheKey];
  const appended = [];
  const document = {
    head: {
      querySelectorAll() {
        return [];
      },
      appendChild(node) {
        node.isConnected = true;
        appended.push(node);
      }
    },
    createElement() {
      const attributes = new Map();
      return {
        isConnected: false,
        textContent: "",
        getAttribute(name) {
          return attributes.get(name) ?? null;
        },
        hasAttribute(name) {
          return attributes.has(name);
        },
        setAttribute(name, value) {
          attributes.set(name, value);
        },
        remove() {
          this.isConnected = false;
        }
      };
    }
  };

  try {
    delete globalThis[cacheKey];
    delete globalThis[groupCacheKey];
    globalThis.document = document;

    for (let index = 0; index < 100; index += 1) {
      style(
        `tui.component-${index}`,
        `${LAYER_PRELUDE}@layer tavo-ui.components{.component-${index}{display:block}}`
      );
    }
    await Promise.resolve();

    assert.equal(appended.length, 1);
    assert.equal(appended[0].getAttribute("data-tavo-style"), "tavo-ui.components");
    assert.equal(
      appended[0].textContent.match(
        /@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;/g
      )?.length,
      1
    );
    assert.equal(
      appended[0].textContent.match(/@layer tavo-ui\.components\{/g)?.length,
      1
    );
    assert.match(appended[0].textContent, /\.component-0\{display:block\}/);
    assert.match(appended[0].textContent, /\.component-99\{display:block\}/);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousCache === undefined) delete globalThis[cacheKey];
    else globalThis[cacheKey] = previousCache;
    if (previousGroupCache === undefined) delete globalThis[groupCacheKey];
    else globalThis[groupCacheKey] = previousGroupCache;
  }
});

test("server rendering still delegates registrations to the framework registry", () => {
  const runtimeKey = Symbol.for("tavo.style.runtime");
  const previousDocument = globalThis.document;
  const previousRuntime = globalThis[runtimeKey];
  const registrations = [];

  try {
    delete globalThis.document;
    globalThis[runtimeKey] = {
      style(id, css, options) {
        registrations.push({ id, css, options });
      }
    };

    style("tui.server-probe", ".server{}", { attributes: { nonce: "server-nonce" } });
    globalThis.document = {};
    globalThis[runtimeKey].getActiveStyleRegistry = () => ({});
    style("tui.browser-registry-probe", ".browser-registry{}");

    assert.deepEqual(registrations, [
      {
        id: "tui.server-probe",
        css: ".server{}",
        options: { attributes: { nonce: "server-nonce" } }
      },
      {
        id: "tui.browser-registry-probe",
        css: ".browser-registry{}",
        options: undefined
      }
    ]);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousRuntime === undefined) delete globalThis[runtimeKey];
    else globalThis[runtimeKey] = previousRuntime;
  }
});

test("hydrated sx nodes consolidate into one nonce-preserving stylesheet", async () => {
  const cacheKey = Symbol.for("tavo.style.client-cache");
  const groupCacheKey = Symbol.for("tavo.style.client-sx-group-cache");
  const previousDocument = globalThis.document;
  const previousCache = globalThis[cacheKey];
  const previousGroupCache = globalThis[groupCacheKey];
  const appended = [];
  const hydrated = [];

  function createNode(id, css, nonce, external = false) {
    const attributes = new Map([
      ["data-tavo-style", id],
      ["nonce", nonce]
    ]);
    if (external) {
      attributes.set("data-tavo-style-external", "");
    }
    return {
      isConnected: true,
      textContent: css,
      getAttribute(name) {
        return attributes.get(name) ?? null;
      },
      hasAttribute(name) {
        return attributes.has(name);
      },
      setAttribute(name, value) {
        attributes.set(name, value);
      },
      remove() {
        this.isConnected = false;
      }
    };
  }

  hydrated.push(
    createNode("tavo-ui.sx.hydrated-a", `${LAYER_PRELUDE}.a{color:red}`, "page-nonce"),
    createNode("tavo-ui.sx.hydrated-b", `${LAYER_PRELUDE}.b{color:blue}`, "page-nonce"),
    createNode(
      "tavo-ui.sx.external",
      `${LAYER_PRELUDE}.external{color:green}`,
      "page-nonce",
      true
    )
  );
  const document = {
    head: {
      querySelectorAll() {
        return hydrated;
      },
      appendChild(node) {
        node.isConnected = true;
        appended.push(node);
      }
    },
    createElement() {
      return createNode("", "", "");
    }
  };

  try {
    delete globalThis[cacheKey];
    delete globalThis[groupCacheKey];
    globalThis.document = document;

    style("tavo-ui.sx.hydrated-a", `${LAYER_PRELUDE}.a{color:red}`);
    style("tavo-ui.sx.hydrated-b", `${LAYER_PRELUDE}.b{color:blue}`);
    style("tavo-ui.sx.external", `${LAYER_PRELUDE}.external{color:green}`);
    requestClientStyleCleanup("tavo-ui.sx.external");
    await Promise.resolve();

    assert.equal(appended.length, 1);
    assert.equal(appended[0].getAttribute("data-tavo-style"), "tavo-ui.sx");
    assert.equal(appended[0].getAttribute("nonce"), "page-nonce");
    assert.equal(hydrated[0].isConnected, false);
    assert.equal(hydrated[1].isConnected, false);
    assert.equal(hydrated[2].isConnected, true);
    assert.match(appended[0].textContent, /\.a\{color:red\}/);
    assert.match(appended[0].textContent, /\.b\{color:blue\}/);
    assert.doesNotMatch(appended[0].textContent, /\.external\{/);
    assert.equal(appended[0].textContent.match(/@layer/g)?.length, 2);
    assert.equal(appended[0].textContent.match(/@layer tavo-ui\.overrides\{/g)?.length, 1);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousCache === undefined) delete globalThis[cacheKey];
    else globalThis[cacheKey] = previousCache;
    if (previousGroupCache === undefined) delete globalThis[groupCacheKey];
    else globalThis[groupCacheKey] = previousGroupCache;
  }
});

test("sx styles share one stylesheet and preserve mounted rules through eviction", async () => {
  const cacheKey = Symbol.for("tavo.style.client-cache");
  const groupCacheKey = Symbol.for("tavo.style.client-sx-group-cache");
  const previousDocument = globalThis.document;
  const previousCache = globalThis[cacheKey];
  const previousGroupCache = globalThis[groupCacheKey];
  const appended = [];
  const document = {
    head: {
      querySelectorAll() {
        return [];
      },
      appendChild(node) {
        node.isConnected = true;
        appended.push(node);
      }
    },
    createElement() {
      const attributes = new Map();
      return {
        isConnected: false,
        textContent: "",
        getAttribute(name) {
          return attributes.get(name) ?? null;
        },
        setAttribute(name, value) {
          attributes.set(name, value);
        },
        remove() {
          this.isConnected = false;
        }
      };
    }
  };

  try {
    delete globalThis[cacheKey];
    delete globalThis[groupCacheKey];
    globalThis.document = document;
    const target = responsiveStyleSheet({ "--lifecycle-probe": "target" });
    const targetNode = appended.at(-1);
    const release = retainClientStyle(target.styleId);

    for (let index = 0; index < 300; index += 1) {
      responsiveStyleSheet({ "--lifecycle-probe": `value-${index}` });
    }
    await Promise.resolve();
    await Promise.resolve();

    assert.equal(appended.length, 1);
    assert.equal(targetNode.isConnected, true);
    assert.match(targetNode.textContent, /--lifecycle-probe:target/);
    assert.equal(
      targetNode.textContent.match(/@layer tavo-ui\.theme,tavo-ui\.components,tavo-ui\.overrides;/g)
        ?.length,
      1
    );
    release();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(targetNode.isConnected, true);
    assert.doesNotMatch(targetNode.textContent, /--lifecycle-probe:target/);

    const immediate = responsiveStyleSheet({ "--lifecycle-probe": "immediate" });
    requestClientStyleCleanup(immediate.styleId);
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(appended.length, 1);
    assert.doesNotMatch(targetNode.textContent, /--lifecycle-probe:immediate/);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousCache === undefined) delete globalThis[cacheKey];
    else globalThis[cacheKey] = previousCache;
    if (previousGroupCache === undefined) delete globalThis[groupCacheKey];
    else globalThis[groupCacheKey] = previousGroupCache;
  }
});
