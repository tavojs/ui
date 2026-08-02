import assert from "node:assert/strict";
import test from "node:test";
import { requestClientStyleCleanup, retainClientStyle, style } from "../dist/style-runtime.js";
import { responsiveStyleSheet } from "../dist/components/shared.js";

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

test("evicted sx styles stay alive while mounted and are removed after cleanup", async () => {
  const cacheKey = Symbol.for("tavo.style.client-cache");
  const previousDocument = globalThis.document;
  const previousCache = globalThis[cacheKey];
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
    globalThis.document = document;
    const target = responsiveStyleSheet({ "--lifecycle-probe": "target" });
    const targetNode = appended.at(-1);
    const release = retainClientStyle(target.styleId);

    for (let index = 0; index < 300; index += 1) {
      responsiveStyleSheet({ "--lifecycle-probe": `value-${index}` });
    }
    await Promise.resolve();

    assert.equal(targetNode.isConnected, true);
    release();
    assert.equal(targetNode.isConnected, false);

    const immediate = responsiveStyleSheet({ "--lifecycle-probe": "immediate" });
    const immediateNode = appended.at(-1);
    requestClientStyleCleanup(immediate.styleId);
    await Promise.resolve();
    assert.equal(immediateNode.isConnected, false);
  } finally {
    if (previousDocument === undefined) delete globalThis.document;
    else globalThis.document = previousDocument;
    if (previousCache === undefined) delete globalThis[cacheKey];
    else globalThis[cacheKey] = previousCache;
  }
});
