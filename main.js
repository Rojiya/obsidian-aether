"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AetherPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var PALETTES = [
  { id: "rice", name: "Rice Paper \u5BA3\u7EB8", icon: "\u{1F4DC}" },
  { id: "glacier", name: "Glacier \u51B0\u5DDD", icon: "\u{1F9CA}" },
  { id: "parchment", name: "Parchment \u7F8A\u76AE", icon: "\u{1F3FA}" },
  { id: "ink", name: "Ink \u58A8\u8272", icon: "\u{1F58B}\uFE0F" },
  { id: "obsidian", name: "Obsidian \u9ED1\u66DC", icon: "\u{1F48E}" }
];
var DEFAULT_SETTINGS = {
  activePalette: "rice",
  sidebarBehavior: "auto",
  leftPinned: false,
  rightPinned: false,
  sidebarEdgeWidth: 20,
  enableFab: true,
  enableReadingMode: true,
  dailyGoal: 1e3
};
var AetherPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.fabContainer = null;
    this.fabOpen = false;
    this.mouseTracker = null;
    this.wordCountEl = null;
    this.ribbonBtn = null;
    this.ribbonBtnL = null;
    this.ribbonBtnR = null;
    this.pinStatusEl = null;
    this.focusStatusEl = null;
    this.readStatusEl = null;
    this.writingHistory = {};
    /* Smart Sidebar: independent left/right pinning */
    this.collapseTimerL = null;
    this.collapseTimerR = null;
  }
  async onload() {
    await this.loadSettings();
    document.body.classList.add("aether-loaded");
    this.applyPalette();
    const initPalette = PALETTES.find((p) => p.id === this.settings.activePalette);
    this.ribbonBtn = this.addRibbonIcon(
      "",
      `Aether: ${initPalette.name}`,
      () => this.cyclePalette()
    );
    this.ribbonBtnL = this.addRibbonIcon(
      "",
      "Pin LEFT sidebar",
      () => this.togglePin("left")
    );
    this.ribbonBtnR = this.addRibbonIcon(
      "",
      "Pin RIGHT sidebar",
      () => this.togglePin("right")
    );
    const ribbonIcons = {
      btn: this.ribbonBtn,
      icon: initPalette.icon,
      btnL: this.ribbonBtnL,
      iconL: this.settings.leftPinned ? "\u{1F512}" : "\u{1F4CD}",
      btnR: this.ribbonBtnR,
      iconR: this.settings.rightPinned ? "\u{1F512}" : "\u{1F4CD}"
    };
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (ribbonIcons.btn) {
          ribbonIcons.btn.empty();
          ribbonIcons.btn.setText(ribbonIcons.icon);
        }
        if (ribbonIcons.btnL) {
          ribbonIcons.btnL.empty();
          ribbonIcons.btnL.setText(ribbonIcons.iconL);
        }
        if (ribbonIcons.btnR) {
          ribbonIcons.btnR.empty();
          ribbonIcons.btnR.setText(ribbonIcons.iconR);
        }
      });
    });
    const pinStatus = this.addStatusBarItem();
    pinStatus.setText("\u{1F4CC}");
    pinStatus.setAttr("aria-label", "Click to pin/unpin sidebars");
    pinStatus.style.cursor = "pointer";
    pinStatus.onClickEvent(() => {
      const both = this.settings.leftPinned && this.settings.rightPinned;
      if (both) {
        this.togglePin("left");
        this.togglePin("right");
      } else {
        this.togglePin("left");
        this.togglePin("right");
      }
    });
    this.pinStatusEl = pinStatus;
    const focusBtn = this.addStatusBarItem();
    focusBtn.setText("\u{1F3AF}");
    focusBtn.setAttr("aria-label", "Focus writing mode");
    focusBtn.style.cursor = "pointer";
    focusBtn.addClass("aether-keep-visible");
    focusBtn.onClickEvent(() => {
      const on = document.body.classList.toggle("aether-focus");
      focusBtn.setText(on ? "\u{1F3AF}" : "\u{1F518}");
    });
    this.focusStatusEl = focusBtn;
    const readBtn = this.addStatusBarItem();
    readBtn.setText("\u{1F319}");
    readBtn.setAttr("aria-label", "Immersive reading mode");
    readBtn.style.cursor = "pointer";
    readBtn.addClass("aether-keep-visible");
    readBtn.onClickEvent(() => {
      const on = document.body.classList.toggle("aether-reading-mode");
      readBtn.setText(on ? "\u{1F319}" : "\u{1F518}");
    });
    this.readStatusEl = readBtn;
    setTimeout(() => {
      const bar = document.querySelector(".status-bar");
      if (bar && focusBtn.parentElement === bar) {
        bar.insertBefore(focusBtn, bar.firstChild);
        bar.insertBefore(readBtn, bar.firstChild);
      }
    }, 200);
    if (this.settings.sidebarBehavior === "auto") {
      this.setupAutoSidebar();
    }
    if (this.settings.enableFab) {
      this.setupFab();
    }
    this.setupWordCount();
    this.addCommand({
      id: "aether-cycle-palette",
      name: "Cycle theme palette",
      callback: () => this.cyclePalette()
    });
    this.addCommand({
      id: "aether-toggle-sidebar",
      name: "Toggle sidebar visibility",
      callback: () => this.toggleSidebar()
    });
    this.addCommand({
      id: "aether-pin-sidebar",
      name: "Pin / unpin sidebar",
      callback: () => this.togglePin("left")
    });
    this.addCommand({
      id: "aether-toggle-reading-mode",
      name: "Toggle immersive reading mode",
      callback: () => this.toggleReadingMode()
    });
    this.addCommand({
      id: "aether-quick-new-note",
      name: "Quick new note",
      callback: () => this.runCmd("file-explorer:new-file")
    });
    this.addCommand({
      id: "aether-open-search",
      name: "Open search",
      callback: () => this.runCmd("global-search:open")
    });
    this.addCommand({
      id: "aether-open-daily-note",
      name: "Open today's daily note",
      callback: () => this.runCmd("daily-notes:goto-today")
    });
    for (const p of PALETTES) {
      this.addCommand({
        id: `aether-palette-${p.id}`,
        name: `Switch to ${p.name}`,
        callback: () => this.setPalette(p.id)
      });
    }
    this.addCommand({
      id: "aether-palette-picker",
      name: "Show palette picker",
      callback: () => this.openPalettePicker()
    });
    this.addCommand({
      id: "aether-focus-mode",
      name: "Toggle focus writing mode",
      callback: () => {
        const on = document.body.classList.toggle("aether-focus");
        new import_obsidian.Notice(on ? "\u{1F3AF} Focus mode on \u2014 current paragraph highlighted" : "Focus mode off");
      }
    });
    this.addCommand({
      id: "aether-dashboard",
      name: "Show writing dashboard",
      callback: () => this.openDashboard()
    });
    this.addSettingTab(new AetherSettingTab(this.app, this));
  }
  onunload() {
    if (this.collapseTimerL)
      clearTimeout(this.collapseTimerL);
    if (this.collapseTimerR)
      clearTimeout(this.collapseTimerR);
    document.body.classList.remove("aether-loaded");
    for (const p of PALETTES) {
      document.body.classList.remove(`aether-${p.id}`);
    }
    document.body.classList.remove("aether-reading-mode");
    this.fabContainer?.remove();
    this.removeMouseTracker();
    this.expandLeft();
    this.expandRight();
  }
  /* Palette Management */
  applyPalette() {
    for (const p of PALETTES) {
      document.body.classList.remove(`aether-${p.id}`);
    }
    document.body.classList.add(`aether-${this.settings.activePalette}`);
  }
  cyclePalette() {
    const idx = PALETTES.findIndex((p2) => p2.id === this.settings.activePalette);
    this.settings.activePalette = PALETTES[(idx + 1) % PALETTES.length].id;
    this.applyPalette();
    this.updateRibbonIcon();
    this.saveSettings();
    const p = PALETTES.find((x) => x.id === this.settings.activePalette);
    new import_obsidian.Notice(`${p.icon} ${p.name}`);
  }
  setPalette(id) {
    this.settings.activePalette = id;
    this.applyPalette();
    this.updateRibbonIcon();
    this.saveSettings();
    const p = PALETTES.find((x) => x.id === id);
    new import_obsidian.Notice(`${p.icon} ${p.name}`);
  }
  updateRibbonIcon() {
    if (!this.ribbonBtn)
      return;
    const p = PALETTES.find((x) => x.id === this.settings.activePalette);
    this.ribbonBtn.setText(p.icon);
    this.ribbonBtn.setAttribute("aria-label", `Aether: ${p.name} (click to switch)`);
  }
  /* Sidebar helpers */
  get leftDock() {
    const s = this.app.workspace.leftSplit;
    return s && "collapse" in s ? s : null;
  }
  get rightDock() {
    const s = this.app.workspace.rightSplit;
    return s && "collapse" in s ? s : null;
  }
  expandLeft() { this.leftDock?.expand(); }
  expandRight() { this.rightDock?.expand(); }
  collapseLeft() { this.leftDock?.collapse(); }
  collapseRight() { this.rightDock?.collapse(); }
  togglePin(side) {
    if (side === "left") {
      this.settings.leftPinned = !this.settings.leftPinned;
      if (this.settings.leftPinned) this.expandLeft();
    } else {
      this.settings.rightPinned = !this.settings.rightPinned;
      if (this.settings.rightPinned) this.expandRight();
    }
    this.saveSettings();
    this.updatePinUI();
  }
  updatePinUI() {
    if (this.ribbonBtnL) this.ribbonBtnL.setText(this.settings.leftPinned ? "\u{1F512}" : "\u{1F4CD}");
    if (this.ribbonBtnR) this.ribbonBtnR.setText(this.settings.rightPinned ? "\u{1F512}" : "\u{1F4CD}");
    const both = this.settings.leftPinned && this.settings.rightPinned;
    const some = this.settings.leftPinned || this.settings.rightPinned;
    if (this.pinStatusEl) this.pinStatusEl.setText(both ? "\u{1F512}\u{1F512}" : some ? "\u{1F512}\u{1F4CD}" : "\u{1F4CD}\u{1F4CD}");
  }
  setupAutoSidebar() {
    const tracker = (e) => {
      const leftEdge = e.clientX <= this.settings.sidebarEdgeWidth;
      const rightEdge = e.clientX >= window.innerWidth - this.settings.sidebarEdgeWidth;
      const overLeft = this.mouseOver(".mod-left-split", e) || this.mouseOver(".workspace-ribbon.mod-left", e);
      const overRight = this.mouseOver(".mod-right-split", e);
      if (leftEdge && !this.settings.leftPinned) this.expandLeft();
      if (rightEdge && !this.settings.rightPinned) this.expandRight();
      if (!this.settings.leftPinned) {
        if (overLeft || leftEdge) {
          if (this.collapseTimerL) { clearTimeout(this.collapseTimerL); this.collapseTimerL = null; }
        } else if (!this.collapseTimerL) {
          this.collapseTimerL = setTimeout(() => { this.collapseLeft(); this.collapseTimerL = null; }, 300);
        }
      }
      if (!this.settings.rightPinned) {
        if (overRight || rightEdge) {
          if (this.collapseTimerR) { clearTimeout(this.collapseTimerR); this.collapseTimerR = null; }
        } else if (!this.collapseTimerR) {
          this.collapseTimerR = setTimeout(() => { this.collapseRight(); this.collapseTimerR = null; }, 300);
        }
      }
    };
    this.mouseTracker = tracker;
    document.addEventListener("mousemove", tracker);
  }
  mouseOver(sel, e) {
    const el = document.querySelector(sel);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  }
  toggleSidebar() {
    if (this.leftDock?.collapsed) { this.expandLeft(); this.expandRight(); new import_obsidian.Notice("Sidebar visible"); }
    else { this.collapseLeft(); this.collapseRight(); new import_obsidian.Notice("Sidebar hidden"); }
  }
  removeMouseTracker() {
    if (this.mouseTracker) { document.removeEventListener("mousemove", this.mouseTracker); this.mouseTracker = null; }
  }
  /* FAB */
  setupFab() {
    this.fabContainer = document.body.createDiv("aether-fab-container");
    const menu = this.fabContainer.createDiv("aether-fab-menu");
    this.makeFabItem(menu, "\u{1F50D}", "Search", () => this.runCmd("global-search:open"));
    this.makeFabItem(menu, "\u{1F4C5}", "Daily", () => this.runCmd("daily-notes:goto-today"));
    this.makeFabItem(menu, "\u{1F4DD}", "New", () => this.runCmd("file-explorer:new-file"));
    this.makeFabItem(menu, "\u{1F3A8}", "Theme", () => this.cyclePalette());
    const btn = this.fabContainer.createDiv("aether-fab-btn");
    btn.textContent = "+";
    btn.addEventListener("click", () => {
      this.fabOpen = !this.fabOpen;
      this.fabContainer?.classList.toggle("aether-fab-open", this.fabOpen);
      btn.textContent = this.fabOpen ? "\u2715" : "+";
    });
    document.addEventListener("click", (e) => {
      if (this.fabOpen && this.fabContainer && !this.fabContainer.contains(e.target)) {
        this.fabOpen = false;
        this.fabContainer.classList.remove("aether-fab-open");
        btn.textContent = "+";
      }
    });
  }
  makeFabItem(p, icon, label, action) {
    const el = p.createDiv("aether-fab-item");
    el.textContent = icon;
    el.addEventListener("click", () => {
      this.fabOpen = false;
      this.fabContainer?.classList.remove("aether-fab-open");
      const b = this.fabContainer?.querySelector(".aether-fab-btn");
      if (b) b.textContent = "+";
      action();
    });
    el.createDiv("aether-fab-tooltip").setText(label);
  }
  toggleReadingMode() {
    const on = document.body.classList.toggle("aether-reading-mode");
    new import_obsidian.Notice(on ? "Reading mode on" : "Reading mode off");
  }
  /* Word Count + Selection */
  setupWordCount() {
    this.loadWritingHistory();
    this.wordCountEl = this.addStatusBarItem();
    this.wordCountEl.addClass("aether-word-count");
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.updateWordCount()));
    this.registerEvent(this.app.vault.on("modify", () => this.updateWordCount()));
    this.registerDomEvent(document, "selectionchange", () => this.updateWordCount());
    this.registerDomEvent(document, "mouseup", () => this.updateWordCount());
    this.updateWordCount();
  }
  loadWritingHistory() {
    try { const d = localStorage.getItem("aether-writing"); if (d) this.writingHistory = JSON.parse(d); }
    catch { this.writingHistory = {}; }
  }
  todayKey() { return (new Date()).toISOString().slice(0, 10); }
  countChars(text) { return (text.match(/[\u4e00-\u9fff]/g) || []).length + (text.match(/[a-zA-Z0-9]+/g) || []).length; }
  getSelectedText() { const sel = window.getSelection(); if (!sel || sel.isCollapsed) return ""; return sel.toString().trim(); }
  async updateWordCount() {
    if (!this.wordCountEl) return;
    const file = this.app.workspace.getActiveFile();
    if (!file) { this.wordCountEl.setText(""); return; }
    try {
      const c = await this.app.vault.read(file);
      const total = this.countChars(c);
      const selText = this.getSelectedText();
      const selChars = selText ? this.countChars(selText) : 0;
      this.wordCountEl.setText(selChars > 0 ? `\u603B${total} \xB7 \u9009${selChars}\u5B57` : `${total}\u5B57`);
    } catch { this.wordCountEl.setText(""); }
  }
  openDashboard() {
    const today = this.todayKey();
    const todayChars = this.writingHistory[today] || 0;
    const pct = Math.round(todayChars / this.settings.dailyGoal * 100);
    const week = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10); const v = this.writingHistory[k] || 0; week.push(`${k.slice(5)} ${String(v).padStart(5)} ${"\u2588".repeat(Math.min(Math.round(v / 100), 20))}`); }
    const msg = [`\u{1F4CA} Daily Writing Dashboard`, ``, `Today: ${todayChars} / ${this.settings.dailyGoal} chars (${pct}%)`, `Goal: ${pct >= 100 ? "\u2705 Done!" : pct >= 50 ? "\u{1F525} On track" : "\u{1F4DD} Keep going"}`, ``, `\u{1F4C5} This week:`, ...week].join("\n");
    new import_obsidian.Notice(msg, 8e3);
  }
  openPalettePicker() { (new PaletteModal(this.app, this)).open(); }
  runCmd(id) { (this.app).commands?.executeCommandById?.(id); }
  async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
  async saveSettings() { await this.saveData(this.settings); }
};
var PaletteModal = class extends require("obsidian").Modal {
  constructor(app, plugin) { super(app); this.plugin = plugin; }
  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.createEl("h2", { text: "Choose Palette" });
    const grid = contentEl.createDiv(); grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px";
    for (const p of PALETTES) {
      const isActive = p.id === this.plugin.settings.activePalette;
      const card = grid.createDiv();
      card.style.cssText = `padding:16px;border-radius:8px;cursor:pointer;text-align:center;border:2px solid ${isActive ? "var(--interactive-accent)" : "var(--background-modifier-border)"};transition:all 150ms ease`;
      card.addEventListener("click", () => { this.plugin.setPalette(p.id); this.close(); });
      card.createEl("div", { text: p.icon, attr: { style: "font-size:28px;margin-bottom:8px" } });
      card.createEl("div", { text: p.name, attr: { style: "font-weight:600;font-size:14px" } });
      if (isActive) card.createEl("div", { text: "\u2713 Active", attr: { style: "font-size:11px;color:var(--interactive-accent);margin-top:4px" } });
    }
  }
  onClose() { (this).contentEl.empty(); }
};
var AetherSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }
  display() {
    const { containerEl } = this; containerEl.empty(); containerEl.createEl("h2", { text: "Aether Settings" });
    new import_obsidian.Setting(containerEl).setName("Active palette").addDropdown((d) => { for (const p of PALETTES) d.addOption(p.id, `${p.icon} ${p.name}`); d.setValue(this.plugin.settings.activePalette).onChange(async (v) => this.plugin.setPalette(v)); return d; });
    new import_obsidian.Setting(containerEl).setName("Sidebar behavior").addDropdown((d) => d.addOption("auto", "Auto-hide").addOption("manual", "Manual toggle only").addOption("always", "Always visible").setValue(this.plugin.settings.sidebarBehavior).onChange(async (v) => { this.plugin.settings.sidebarBehavior = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Edge trigger width").addSlider((s) => s.setLimits(10, 60, 5).setValue(this.plugin.settings.sidebarEdgeWidth).setDynamicTooltip().onChange(async (v) => { this.plugin.settings.sidebarEdgeWidth = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Daily writing goal").addText((t) => t.setValue(String(this.plugin.settings.dailyGoal)).onChange(async (v) => { this.plugin.settings.dailyGoal = parseInt(v) || 1e3; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Floating action button").addToggle((t) => t.setValue(this.plugin.settings.enableFab).onChange(async (v) => { this.plugin.settings.enableFab = v; await this.plugin.saveSettings(); }));
    new import_obsidian.Setting(containerEl).setName("Immersive reading mode").addToggle((t) => t.setValue(this.plugin.settings.enableReadingMode).onChange(async (v) => { this.plugin.settings.enableReadingMode = v; await this.plugin.saveSettings(); }));
  }
};