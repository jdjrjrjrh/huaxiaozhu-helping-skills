import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const file = join(directory, name);
    return statSync(file).isDirectory() ? walk(file) : [file];
  });
}

const gitDirectory = join(ROOT, ".git") + sep;
const files = walk(ROOT).filter((file) => !file.startsWith(gitDirectory));
const htmlFiles = files.filter((file) => extname(file) === ".html");
const cssFiles = files.filter((file) => extname(file) === ".css");
const projectScripts = files.filter((file) => file.startsWith(join(ROOT, "assets", "js")) && extname(file) === ".js");
const requiredProjectFiles = [
  "README.md",
  "README.en.md",
  "LICENSE",
  "NOTICE.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  join(".github", "workflows", "ci.yml")
];

assert(htmlFiles.length === 17, `expected 17 HTML pages, found ${htmlFiles.length}`);
assert(projectScripts.length === 6, `expected 6 application scripts, found ${projectScripts.length}`);
for (const file of requiredProjectFiles) {
  assert(existsSync(join(ROOT, file)), `missing open-source project file: ${file}`);
}

for (const file of projectScripts) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  assert(result.status === 0, `${relative(ROOT, file)} failed syntax check: ${result.stderr.trim()}`);
}

const localReferencePattern = /(?:src|href)=["']([^"']+)["']/g;
for (const htmlFile of htmlFiles) {
  const source = readFileSync(htmlFile, "utf8");
  assert(/<html\s+lang="zh-CN">/i.test(source), `${relative(ROOT, htmlFile)} is missing lang="zh-CN"`);
  assert(/<meta\s+name="viewport"/i.test(source), `${relative(ROOT, htmlFile)} is missing a viewport declaration`);
  for (const match of source.matchAll(localReferencePattern)) {
    const reference = match[1];
    if (/^(?:#|https?:|mailto:|tel:|javascript:|data:)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!clean) continue;
    const target = resolve(dirname(htmlFile), clean);
    assert(existsSync(target), `${relative(ROOT, htmlFile)} references missing ${clean}`);
  }
}

const cssReferencePattern = /url\(\s*["']?([^"'()]+)["']?\s*\)/g;
for (const cssFile of cssFiles) {
  const source = readFileSync(cssFile, "utf8");
  for (const match of source.matchAll(cssReferencePattern)) {
    const reference = match[1].trim();
    if (/^(?:#|https?:|data:)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    const target = resolve(dirname(cssFile), clean);
    assert(existsSync(target), `${relative(ROOT, cssFile)} references missing ${clean}`);
  }
}

assert(!files.some((file) => /\.(?:eot|otf|ttc|ttf|woff2?)$/i.test(file)), "bundled font file remains");
assert(!files.some((file) => /\.(?:aep|docx?|mp4|pdf|pptx?|psd)$/i.test(file)), "non-technical application material remains");

const runtimeFiles = files.filter((file) => [".css", ".html", ".js", ".svg"].includes(extname(file).toLowerCase()));
const runtimeSources = [];
for (const file of runtimeFiles) {
  if (file.endsWith(join("assets", "vendor", "echarts.min.js"))) continue;
  const source = readFileSync(file, "utf8");
  runtimeSources.push(source);
  assert(!/(?:src|href)=["']https?:\/\//i.test(source), `${relative(ROOT, file)} loads an external runtime resource`);
  assert(!/(?:url\(\s*["']?https?:\/\/|@import\s+(?:url\()?["']?https?:\/\/|fetch\(\s*["']https?:\/\/|new\s+WebSocket\(\s*["']wss?:\/\/)/i.test(source), `${relative(ROOT, file)} makes an external runtime request`);
}

const runtimeCombined = runtimeSources.join("\n");
assert(!/DIN-Medium|font-family\s*:\s*["']?DIN\b/i.test(runtimeCombined), "proprietary DIN font reference remains in runtime files");
assert(!/(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][A-Za-z0-9_./+=-]{12,}["']/i.test(runtimeCombined), "possible hard-coded credential remains");

class FakeClassList {
  add() {}
  remove() {}
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.parentNode = null;
    this.classList = new FakeClassList();
    this.listeners = new Map();
    this.focused = false;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
    child.parentNode = null;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  setAttribute(name, value) {
    this[name] = value;
  }

  set innerHTML(value) {
    this.markup = value;
    this.confirmButton = new FakeElement("button");
    if (value.includes("data-modal-cancel")) this.cancelButton = new FakeElement("button");
  }

  querySelector(selector) {
    if (selector === "[data-modal-confirm]") return this.confirmButton;
    if (selector === "[data-modal-cancel]") return this.cancelButton || null;
    return null;
  }

  querySelectorAll() {
    return [];
  }

  focus() {
    this.focused = true;
  }
}

const documentListeners = new Map();
const windowListeners = new Map();
const modalBody = new FakeElement("body");
const priorFocus = new FakeElement("button");
const modalDocument = {
  activeElement: priorFocus,
  body: modalBody,
  addEventListener(type, listener) {
    if (!documentListeners.has(type)) documentListeners.set(type, new Set());
    documentListeners.get(type).add(listener);
  },
  removeEventListener(type, listener) {
    documentListeners.get(type)?.delete(listener);
  },
  contains(element) {
    return element === priorFocus;
  },
  createElement(tagName) {
    return new FakeElement(tagName);
  },
  querySelector(selector) {
    if (selector === "#app-modal") return modalBody.children.find((item) => item.id === "app-modal") || null;
    return null;
  },
  querySelectorAll() {
    return [];
  }
};
const memory = new Map();
const modalWindow = {
  document: modalDocument,
  history: { length: 1 },
  location: { search: "" },
  localStorage: {
    getItem(key) { return memory.has(key) ? memory.get(key) : null; },
    setItem(key, value) { memory.set(key, value); },
    removeItem(key) { memory.delete(key); }
  },
  addEventListener(type, listener) {
    if (!windowListeners.has(type)) windowListeners.set(type, new Set());
    windowListeners.get(type).add(listener);
  },
  removeEventListener(type, listener) {
    windowListeners.get(type)?.delete(listener);
  },
  clearTimeout() {},
  setTimeout(callback) { callback(); }
};
modalWindow.window = modalWindow;
const modalSandbox = { window: modalWindow, document: modalDocument, console, URLSearchParams };
vm.createContext(modalSandbox);
vm.runInContext(readFileSync(join(ROOT, "assets", "js", "data.js"), "utf8"), modalSandbox);
vm.runInContext(readFileSync(join(ROOT, "assets", "js", "app.js"), "utf8"), modalSandbox);
modalWindow.HXZ.ui.modal({ title: "Test", cancelText: "Cancel" });
assert(documentListeners.get("keydown")?.size === 1, "modal did not register exactly one Escape listener");
modalWindow.HXZ.ui.closeModal();
assert(documentListeners.get("keydown")?.size === 0, "modal Escape listener leaked after close");
assert(priorFocus.focused, "modal did not restore focus after close");

const chartRegistry = new Map();
let chartDisposed = 0;
let observerDisconnected = 0;
modalWindow.echarts = {
  getInstanceByDom(element) {
    return chartRegistry.get(element) || null;
  },
  init(element) {
    const chart = {
      setOption() {},
      resize() {},
      dispose() {
        chartDisposed += 1;
        chartRegistry.delete(element);
      }
    };
    chartRegistry.set(element, chart);
    return chart;
  }
};
modalWindow.ResizeObserver = class {
  observe() {}
  disconnect() { observerDisconnected += 1; }
};
const chartElement = new FakeElement("div");
modalWindow.HXZ.charts.create(chartElement, {});
assert(windowListeners.get("resize")?.size === 1, "chart did not register exactly one resize listener");
modalWindow.HXZ.charts.dispose(chartElement);
assert(windowListeners.get("resize")?.size === 0, "chart resize listener leaked after dispose");
assert(chartDisposed === 1, "chart instance was not disposed");
assert(observerDisconnected === 1, "chart ResizeObserver was not disconnected");

const sandbox = { window: { HXZ: {} }, document: {}, console };
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(readFileSync(join(ROOT, "assets", "js", "data.js"), "utf8"), sandbox);

const HXZ = sandbox.window.HXZ;
HXZ.util = {
  average(values) {
    return values.length ? Math.round(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length) : 0;
  },
  clamp(value, min, max) {
    return Math.min(Math.max(Number(value) || 0, min), max);
  },
  escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },
  getTechnique(id) {
    return HXZ.data.techniques.find((item) => item.id === id) || HXZ.data.techniques[0];
  },
  getCase(id) {
    return HXZ.data.trainingCases.find((item) => item.id === id) || HXZ.data.trainingCases[0];
  }
};
HXZ.pages = {};
HXZ.records = {
  getAll() {
    return [
      { id: "one", score: 80, level: "良好", techniqueId: "restatement", techniqueName: "重述", caseTitle: "示例", date: "2026-01-01" },
      { id: "two", score: 86, level: "优秀", techniqueId: "action-plan", techniqueName: "行动计划", caseTitle: "示例", date: "2026-01-02" }
    ];
  }
};
HXZ.storage = { get() { return null; }, set() {} };
HXZ.navigation = { getQuery() { return null; } };
HXZ.charts = { create() {}, dispose() {} };
vm.runInContext(readFileSync(join(ROOT, "assets", "js", "pages-records.js"), "utf8"), sandbox);

const recordsPage = HXZ.pages.records;
recordsPage.filter = "action-plan";
const recordsMarkup = recordsPage.render();
assert(recordsPage.filter === "all", "records render did not reset its visible filter state");
for (const technique of HXZ.data.techniques) {
  assert(recordsMarkup.includes(`data-record-filter="${technique.id}"`), `records filter is missing ${technique.id}`);
}
recordsPage.filter = "action-plan";
assert(recordsPage.getFiltered().length === 1, "records filter returned an incorrect result");
assert(readFileSync(join(ROOT, "assets", "js", "pages-records.js"), "utf8").includes("HXZ.charts.dispose(chartElement)"), "records chart is not disposed before filter redraw");

vm.runInContext(readFileSync(join(ROOT, "assets", "js", "pages-training.js"), "utf8"), sandbox);
const trainingCase = HXZ.data.trainingCases[0];
const technique = HXZ.data.techniques[0];
const good = HXZ.trainingHelpers.evaluateReply(trainingCase.reference, trainingCase, technique);
const poor = HXZ.trainingHelpers.evaluateReply("你太失败了，你应该别难过。", trainingCase, technique);
assert(good.score > poor.score, "rule-based evaluator does not reward the reference response over a judgmental response");

if (failures.length) {
  console.error(`Static checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Static checks passed: ${htmlFiles.length} pages, ${projectScripts.length} scripts, ${files.length} files.`);
