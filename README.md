# Aether — Obsidian UI Theme Engine

Aether 是一个 Obsidian 全功能 UI 主题引擎，包含 5 款差异化配色、智能侧边栏、沉浸写作模式、每日仪表盘等功能。

## Features

### 🎨 5 Distinct Palettes

| Palette | Base | Accent | Feel |
|---|---|---|---|
| 📜 Rice Paper 宣纸 | Warm ivory `#FAF8F5` | Umber `#8B6D52` | Afternoon paper reading |
| 🧊 Glacier 冰川 | Pure white `#FCFDFD` | Electric blue `#3B82F6` | Minimal design studio |
| 🏺 Parchment 羊皮 | Honey amber `#F5E6D3` | Amber `#C2783A` | Candlelit parchment |
| 🖋️ Ink 墨色 | Warm charcoal `#2D2D30` | Bronze `#B8977E` | Late-night fountain pen |
| 💎 Obsidian 黑曜 | Cold near-black `#1C1C24` | Purple `#8B7EC8` | Terminal coding at night |

### 🧭 Smart Sidebar

- Auto-expand on screen edge hover
- Auto-collapse when mouse leaves (300ms grace)
- Independent left/right pinning (📍/🔒)
- Real collapse via Obsidian API (editor resizes)

### 🧹 Zero-Border UI

Based on reverse engineering of Obsidian's `app.css` (600KB). Eliminated 25+ border sources across panels, tabs, headers, metadata containers.

### 🎯 Focus Writing Mode

Paragraph-level highlight — current paragraph stays bright, others dim.

### 🌙 Immersive Reading Mode

Hide all UI chrome. Status bar controls remain clickable to exit.

### 📊 Daily Dashboard

Today's character count, goal percentage, and 7-day writing history.

### Other Features

- FAB floating action menu (bottom-right + button)
- Word count + selection count in status bar
- Chinese typography optimization (15.5px, 1.75 line-height, PingFang SC)
- 5-click palette picker modal

## Installation

### 1. Install the plugin

Copy `main.js` and `manifest.json` to `.obsidian/plugins/obsidian-aether/`. Enable in Settings → Community Plugins.

### 2. Install the CSS snippet

Copy `styles.css` to `.obsidian/snippets/aether.css`. Enable in Settings → Appearance → CSS snippets.

### 3. Restart Obsidian

Close ALL windows and reopen.

## Usage

- **Switch palette**: Click ribbon icon or `Ctrl+P` → "Cycle theme palette"
- **Palette picker**: `Ctrl+P` → "Show palette picker"
- **Toggle sidebar**: `Ctrl+P` → "Toggle sidebar visibility"
- **Pin sidebar**: Click 📍 on ribbon or status bar
- **Focus mode**: `Ctrl+P` → "Toggle focus writing mode" or click 🎯 in status bar
- **Reading mode**: `Ctrl+P` → "Toggle immersive reading mode" or click 🌙 in status bar
- **Dashboard**: `Ctrl+P` → "Show writing dashboard"

## Requirements

- Obsidian ≥ 1.5.0

## License

MIT
