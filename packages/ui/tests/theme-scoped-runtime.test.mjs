import assert from "node:assert/strict";
import test from "node:test";

const themeRuntime = await import("../dist/theme/runtime.js");

function createDocumentHarness({ prefersDark = false } = {}) {
  let currentPrefersDark = prefersDark;
  const rootAttributes = new Map();
  const storage = new Map();
  const storageCalls = { reads: 0, writes: 0 };
  const animationFrames = new Map();
  const cancelledFrames = [];
  const mediaCalls = { queries: 0, subscriptions: 0, unsubscriptions: 0 };
  const mediaListeners = new Set();
  let nextFrameId = 1;

  const document = {};
  const styleNodes = [];

  function createHost(name) {
    return {
      name,
      ownerDocument: document,
      children: [],
      appendChild(node) {
        node.parentNode = this;
        node.isConnected = true;
        this.children.push(node);
        if (!styleNodes.includes(node)) {
          styleNodes.push(node);
        }
        return node;
      },
      querySelectorAll() {
        return styleNodes.filter((node) => node.parentNode === this);
      },
    };
  }

  const head = createHost("head");
  const styleHost = createHost("style-host");
  head.children.push(styleHost);
  styleHost.parentNode = head;

  const ownerWindow = {
    localStorage: {
      getItem(key) {
        storageCalls.reads += 1;
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storageCalls.writes += 1;
        storage.set(key, value);
      },
    },
    matchMedia(query) {
      mediaCalls.queries += 1;
      return {
        get matches() {
          return query === "(prefers-color-scheme: dark)" && currentPrefersDark;
        },
        addEventListener(type, listener) {
          if (type === "change") {
            mediaCalls.subscriptions += 1;
            mediaListeners.add(listener);
          }
        },
        removeEventListener(type, listener) {
          if (type === "change") {
            mediaCalls.unsubscriptions += 1;
            mediaListeners.delete(listener);
          }
        },
      };
    },
    requestAnimationFrame(callback) {
      const id = nextFrameId++;
      animationFrames.set(id, callback);
      return id;
    },
    cancelAnimationFrame(id) {
      cancelledFrames.push(id);
      animationFrames.delete(id);
    },
  };

  Object.assign(document, {
    defaultView: ownerWindow,
    documentElement: {
      setAttribute(name, value) {
        rootAttributes.set(name, value);
      },
      getAttribute(name) {
        return rootAttributes.get(name) ?? null;
      },
      removeAttribute(name) {
        rootAttributes.delete(name);
      },
    },
    createElement(tagName) {
      assert.equal(tagName, "style");
      const attributes = new Map();
      return {
        ownerDocument: document,
        parentNode: null,
        isConnected: false,
        textContent: "",
        setAttribute(name, value) {
          attributes.set(name, value);
        },
        getAttribute(name) {
          return attributes.get(name) ?? null;
        },
        remove() {
          const parent = this.parentNode;
          if (parent) {
            const childIndex = parent.children.indexOf(this);
            if (childIndex >= 0) parent.children.splice(childIndex, 1);
          }
          const styleIndex = styleNodes.indexOf(this);
          if (styleIndex >= 0) styleNodes.splice(styleIndex, 1);
          this.parentNode = null;
          this.isConnected = false;
        },
      };
    },
    head,
  });

  head.querySelectorAll = () => styleNodes.filter((node) => node.isConnected);

  return {
    document,
    ownerWindow,
    styleHost,
    styleNodes,
    rootAttributes,
    storageCalls,
    mediaCalls,
    animationFrames,
    cancelledFrames,
    setPrefersDark(value) {
      currentPrefersDark = value;
      for (const listener of [...mediaListeners]) {
        listener({ matches: value });
      }
    },
  };
}

function liveConfig(defaultTheme, primary) {
  return {
    defaultTheme,
    color: { light: { primary } },
    scale: { radius: 8 },
  };
}

test("scoped theme controller uses ownerDocument.defaultView and disables persistence completely", async () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const scoped = createDocumentHarness({ prefersDark: true });
  const globalCalls = { media: 0, storage: 0 };

  globalThis.document = {
    getElementById() {
      return null;
    },
    documentElement: {
      setAttribute() {
        throw new Error("global document must not be mutated");
      },
      removeAttribute() {
        throw new Error("global document must not be mutated");
      },
    },
  };
  globalThis.window = {
    localStorage: {
      getItem() {
        globalCalls.storage += 1;
        return "light";
      },
      setItem() {
        globalCalls.storage += 1;
      },
    },
    matchMedia() {
      globalCalls.media += 1;
      return {
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      };
    },
  };

  try {
    const controller = themeRuntime.createThemeController("system", {
      ownerDocument: scoped.document,
      persistence: false,
    });

    assert.equal(controller.store.getState().mode, "system");
    assert.equal(controller.store.getState().resolvedMode, "dark");
    assert.equal(scoped.storageCalls.reads, 0);

    controller.setMode("light");
    assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");
    assert.equal(scoped.storageCalls.writes, 0);

    const unwatch = controller.watchSystem();
    assert.equal(scoped.mediaCalls.subscriptions, 1);
    unwatch();
    assert.equal(scoped.mediaCalls.unsubscriptions, 1);
    assert.deepEqual(globalCalls, { media: 0, storage: 0 });
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test("scoped live controllers have unique styles and dispose only their own document state", async () => {
  const previousDocument = globalThis.document;
  const previousWindow = globalThis.window;
  const scoped = createDocumentHarness();
  const globalAnimationFrames = [];

  globalThis.document = undefined;
  globalThis.window = {
    requestAnimationFrame(callback) {
      globalAnimationFrames.push(callback);
      return globalAnimationFrames.length;
    },
  };

  try {
    const darkController = themeRuntime.createLiveThemeController(
      liveConfig("dark", "#7C5CFF"),
      {
        ownerDocument: scoped.document,
        styleHost: scoped.styleHost,
        persistence: false,
        styleId: "scoped-runtime",
      }
    );
    const lightController = themeRuntime.createLiveThemeController(
      liveConfig("light", "#116A67"),
      {
        ownerDocument: scoped.document,
        styleHost: scoped.styleHost,
        persistence: false,
        styleId: "scoped-runtime",
      }
    );

    darkController.syncDocument();
    lightController.syncDocument();

    assert.equal(scoped.styleHost.children.length, 2);
    assert.equal(scoped.styleNodes.length, 2);
    assert.ok(scoped.styleNodes.every((node) => node.parentNode === scoped.styleHost));
    const [darkStyle, lightStyle] = scoped.styleNodes;
    const darkStyleId = darkStyle.getAttribute("data-tavo-style");
    const lightStyleId = lightStyle.getAttribute("data-tavo-style");
    assert.match(darkStyleId, /^scoped-runtime\.\d+$/);
    assert.match(lightStyleId, /^scoped-runtime\.\d+$/);
    assert.notEqual(darkStyleId, lightStyleId);
    assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");
    assert.equal(scoped.storageCalls.reads, 0);
    assert.equal(scoped.storageCalls.writes, 0);

    darkController.patchConfig({ scale: { radius: 12 } });
    assert.equal(scoped.animationFrames.size, 1);
    assert.equal(globalAnimationFrames.length, 0);

    darkController.dispose();
    assert.deepEqual(scoped.cancelledFrames, [1]);
    assert.equal(scoped.styleNodes.length, 1);
    assert.equal(scoped.styleNodes[0], lightStyle);
    assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");

    lightController.dispose();
    assert.equal(scoped.styleNodes.length, 0);
    assert.equal(scoped.rootAttributes.has("data-tavo-theme"), false);
  } finally {
    globalThis.document = previousDocument;
    globalThis.window = previousWindow;
  }
});

test("lower scoped controllers cannot overwrite the active theme attribute", () => {
  const scoped = createDocumentHarness();
  const lowerController = themeRuntime.createLiveThemeController(
    liveConfig("system", "#7C5CFF"),
    {
      ownerDocument: scoped.document,
      persistence: false,
    }
  );
  const activeController = themeRuntime.createLiveThemeController(
    liveConfig("light", "#116A67"),
    {
      ownerDocument: scoped.document,
      persistence: false,
    }
  );

  lowerController.syncDocument();
  const unwatch = lowerController.watchSystem();
  activeController.syncDocument();
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");

  scoped.setPrefersDark(true);
  assert.equal(lowerController.store.getState().resolvedMode, "dark");
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");

  lowerController.setMode("dark");
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");

  activeController.dispose();
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "dark");

  unwatch();
  lowerController.dispose();
  assert.equal(scoped.rootAttributes.has("data-tavo-theme"), false);
});

test("scoped live disposal restores prior theme ownership and releases tracked listeners", () => {
  const scoped = createDocumentHarness();
  scoped.rootAttributes.set("data-tavo-theme", "dark");
  const controller = themeRuntime.createLiveThemeController(
    liveConfig("light", "#7C5CFF"),
    {
      ownerDocument: scoped.document,
      styleHost: scoped.styleHost,
      persistence: false,
    }
  );

  controller.syncDocument();
  controller.watchSystem();
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "light");
  assert.equal(scoped.mediaCalls.subscriptions, 1);

  controller.dispose();
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "dark");
  assert.equal(scoped.mediaCalls.unsubscriptions, 1);
  assert.equal(scoped.styleNodes.length, 0);

  controller.setMode("light");
  const unwatchDisposed = controller.watchSystem();
  unwatchDisposed();
  assert.equal(scoped.rootAttributes.get("data-tavo-theme"), "dark");
  assert.equal(scoped.mediaCalls.subscriptions, 1);
});
