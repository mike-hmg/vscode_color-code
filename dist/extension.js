"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var COLORS = [
  { id: "colormanagement.AnsiColor1", label: "Red", color: "#800000" },
  { id: "colormanagement.AnsiColor2", label: "Green", color: "#008000" },
  { id: "colormanagement.AnsiColor3", label: "Yellow", color: "#808000" },
  { id: "colormanagement.AnsiColor4", label: "Blue", color: "#000080" },
  { id: "colormanagement.AnsiColor5", label: "Purple", color: "#800080" },
  { id: "colormanagement.AnsiColor6", label: "Teal", color: "#008080" },
  { id: "colormanagement.AnsiColor7", label: "Silver", color: "#c0c0c0" },
  { id: "colormanagement.AnsiColor8", label: "Grey", color: "#808080" },
  { id: "colormanagement.AnsiColor9", label: "Light Red", color: "#ff0000" },
  { id: "colormanagement.AnsiColor10", label: "Light Green", color: "#00ff00" },
  { id: "colormanagement.AnsiColor11", label: "Light Yellow", color: "#ffff00" },
  { id: "colormanagement.AnsiColor12", label: "Light Blue", color: "#0000ff" },
  { id: "colormanagement.AnsiColor13", label: "Magenta", color: "#ff00ff" },
  { id: "colormanagement.AnsiColor14", label: "Cyan", color: "#00ffff" },
  { id: "colormanagement.AnsiColor15", label: "White", color: "#ffffff" },
  { id: "colormanagement.AnsiColor16", label: "Orange", color: "#ff8000" }
];
var decorationEmitter = new vscode.EventEmitter();
function getColorItems() {
  const config = vscode.workspace.getConfiguration("colorcode");
  return config.get("items", []) ?? [];
}
async function saveColorItems(items) {
  const config = vscode.workspace.getConfiguration("colorcode");
  await config.update("items", items, vscode.ConfigurationTarget.Workspace);
}
function getPathForResource(resource) {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(resource);
  if (workspaceFolder) {
    return vscode.workspace.asRelativePath(resource, false);
  }
  return resource.fsPath;
}
function getDecorationColor(resource) {
  const path = getPathForResource(resource);
  const match = getColorItems().find((item) => item.path === path);
  if (!match) {
    return void 0;
  }
  if (match.color.startsWith("colormanagement.")) {
    return new vscode.ThemeColor(match.color);
  }
  return match.color;
}
var fileDecorationProvider = {
  onDidChangeFileDecorations: decorationEmitter.event,
  provideFileDecoration(uri) {
    const color = getDecorationColor(uri);
    if (!color) {
      return;
    }
    return {
      tooltip: "ColorCode",
      color
    };
  }
};
async function pickColor() {
  const items = COLORS.map((c) => ({
    label: c.label,
    description: c.color,
    colorId: c.id,
    color: c.color
  }));
  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: "Select a color"
  });
  return selected?.colorId;
}
async function setColor(resource) {
  const color = await pickColor();
  if (!color) {
    return;
  }
  const path = getPathForResource(resource);
  const items = getColorItems();
  const existingIndex = items.findIndex((item) => item.path === path);
  if (existingIndex >= 0) {
    items[existingIndex].color = color;
  } else {
    items.push({ path, color });
  }
  await saveColorItems(items);
  vscode.window.showInformationMessage(`Color set for ${path}`);
  decorationEmitter.fire(resource);
}
async function clearColor(resource) {
  const path = getPathForResource(resource);
  const items = getColorItems();
  const filtered = items.filter((item) => item.path !== path);
  if (filtered.length === items.length) {
    vscode.window.showInformationMessage("No color found to clear");
    return;
  }
  await saveColorItems(filtered);
  vscode.window.showInformationMessage(`Color cleared for ${path}`);
  decorationEmitter.fire(resource);
}
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("colorcode.setFileColor", async (resource) => {
      if (resource) {
        await setColor(resource);
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("colorcode.clearFileColor", async (resource) => {
      if (resource) {
        await clearColor(resource);
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("colorcode.setFolderColor", async (resource) => {
      if (resource) {
        await setColor(resource);
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("colorcode.clearFolderColor", async (resource) => {
      if (resource) {
        await clearColor(resource);
      }
    })
  );
  context.subscriptions.push(vscode.window.registerFileDecorationProvider(fileDecorationProvider));
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("colorcode.items")) {
        decorationEmitter.fire(void 0);
      }
    })
  );
}
function deactivate() {
  decorationEmitter.dispose();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
