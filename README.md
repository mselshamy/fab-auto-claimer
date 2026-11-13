# Fab Quixel Auto Claimer

[![Release](https://img.shields.io/badge/release-v1.0.0-22c55e?style=for-the-badge)](./RELEASE_NOTES.md)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6?style=for-the-badge)](#)
[![Browsers](https://img.shields.io/badge/browsers-Brave%20%7C%20Chrome%20%7C%20Edge-38bdf8?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](./LICENSE)

A complete, memory-safe automation suite for claiming free **Quixel Megascans** assets on **Epic Games' [Fab.com](https://www.fab.com/sellers/Quixel%20Megascans?is_free=1)** in **Brave Browser**, **Google Chrome**, and **Microsoft Edge**.

Ships with both a **standalone Windows GUI Launcher (`FabQuixelLauncher.exe`)**—which detects your installed Chromium browsers, verifies Tampermonkey installation (via the Chrome Web Store or Microsoft Edge Add-ons Store), checks `"Allow User Scripts"`, installs the embedded userscript in 1 click, and auto-runs it in a new browser window—and the standalone **Tampermonkey Userscript (`fab-quixel-auto-claimer.user.js`)** featuring a live **ETA / Remaining Time Calculator**, **RAM Guard**, and **Periodic Full-Page Auto-Reload**.

---

## ✨ Key Features

### 1. 🖥️ Standalone Windows Launcher (`FabQuixelLauncher.exe`)
No Python, Node.js, or external dependencies required.
- **Multi-Browser Support (Brave, Chrome, & Edge)**: Automatically detects installed browsers (**Brave Browser**, **Google Chrome**, and **Microsoft Edge**) and lets you switch between them via a dropdown selector.
- **Tampermonkey Extension Check**: Verifies whether **Tampermonkey** is installed in the selected browser (`dhdgffkkebhmkfjojejmpbldmpobfkfo` for Brave/Chrome or `iikmkjmpaadaobahmlepeloendndfphd` for Microsoft Edge). If missing, provides a 1-click button to open the official [Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=ext_app_menu) or [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd) page.
- **`"Allow User Scripts"` / Developer Mode Verification**: Reads the browser's extension preferences to verify that Manifest V3 user script execution is enabled for Tampermonkey, with a 1-click shortcut to `brave://extensions`, `chrome://extensions`, or `edge://extensions`.
- **1-Click Localhost Userscript Installer**: Runs an embedded background HTTP server (`http://127.0.0.1:18923/fab-quixel-auto-claimer.user.js`) that triggers Tampermonkey's native installation tab with a single click—plus a **Copy Code** clipboard fallback.
- **Auto-Run Launch**: Opens `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1&fab_autorun=1` in a new window of your selected browser and automatically starts claiming assets.

### 2. 🎯 Smart Hover + Click Automation (Filter-Safe)
- **React-Compatible Event Simulation**: Dispatches full pointer and mouse event sequences (`pointerover`, `mouseover`, `pointerenter`, `mouseenter`, `mousemove`) on each `"From Free"` product card to reveal the top-right **`⊞+` ("Add to My Library")** button, clicks it, and waits for **`"✔ Saved in My Library"`** confirmation.
- **Zero Filter Interference**: Strictly scopes clicks to product cards and never touches or resets your active page filters (`is_free=1`, unchecked *"Show products in My Library"*, or sorting).

### 3. ⏱️ Live ETA / Remaining Time Calculator
- **Automatic Sidebar Parsing**: Reads the live remaining asset count directly from Fab.com's left sidebar (`All products` badge, supporting both compact notation like `4.6K` and exact numbers like `4,520`) and decrements it in real time as items are claimed.
- **Dynamic Pace & Remaining Time**: Continuously measures actual hover + click + save overhead and combines it with your **Delay Between Items** slider (`300 ms` – `2500 ms`) and amortized auto-reload time to display:
  - **Estimated Time Remaining** (`~Xh Ym` or `~Xm Ys`)
  - **Remaining Unclaimed Assets** (`~4,580 left`)
  - **Live Claiming Pace** (`~1.6s/item (37.5/min)`)

### 4. 🛡️ RAM Guard & Full Page Auto-Reload
- **Immediate Thumbnail Bitmap Stripping**: As soon as a card is claimed (or confirmed already in your library), its `<img>`, `<video>`, and `<canvas>` elements are replaced with a lightweight `1×1` transparent GIF, freeing GPU/Renderer texture memory immediately.
- **Live Tab Memory Monitor**: Displays a real-time memory usage bar (`MB / Limit MB (%)`), DOM node count, and active image count in the floating bottom-right control panel.
- **Configurable Memory Threshold (`150 MB` – `1000 MB`, default `400 MB`)**:
  - **Warning at 85%**: Highlights the memory bar in amber when approaching your limit.
  - **Threshold Action (`100%`)**: Choose between **Reload Page & Continue** or **Stop Script & Warn**.
- **Periodic Batch Auto-Reload (Every `N` Items, default `30`)**: Performs a hard page reload after claiming `N` items (`10` – `100`) to clear added items from the feed and reset browser RAM back to baseline.

---

## 🚀 Step-by-Step Setup & Usage

### Option A: Automated Setup via `FabQuixelLauncher.exe` (Recommended)

1. Download **`FabQuixelLauncher.exe`** from the [Releases](../../releases) page and double-click it.
2. Select your preferred browser (**Brave Browser**, **Google Chrome**, or **Microsoft Edge**) at the top of the launcher and make sure you are signed in to [Fab.com](https://www.fab.com) in that browser.
3. Follow the 4-step checklist in the launcher:
   - **Step 1 (Browser Installation)**: Verified automatically (`✅ Found`).
   - **Step 2 (Tampermonkey)**: If not yet installed, click **`🌐 Get Tampermonkey`** to install from the Chrome Web Store or Microsoft Edge Add-ons Store.
   - **Step 3 (Allow User Scripts / Developer Mode)**: Click **`⚙️ Instructions / Copy URL`**, paste the copied extensions URL into your browser's address bar, and toggle ON **Developer mode** and **Allow User Scripts**.
   - **Step 4 (Install Script)**: Click **`📦 Install / Update`** and click **`Install`** in the Tampermonkey tab that opens.
4. Click **`🚀 Proceed: Open Fab.com in New Window and Auto Run`**.

### Option B: Manual Tampermonkey Setup

1. Install Tampermonkey for [Chrome / Brave](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd).
2. Open your browser's extensions page (`brave://extensions`, `chrome://extensions`, or `edge://extensions`), enable **Developer mode**, click **Details** on Tampermonkey, and enable **Allow User Scripts**.
3. Copy the contents of [`fab-quixel-auto-claimer.user.js`](./fab-quixel-auto-claimer.user.js) into a new Tampermonkey script and save (`Ctrl+S`).
4. Visit `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1` and click **`▶ Start`** on the bottom-right **Fab Quixel Auto Claimer** panel.

---

## 🎛️ Floating Dashboard Controls

| Control / Metric | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- |
| **X (Top-Right)** | Button | — | Stops the script and closes the floating panel |
| **⏱️ Est. Time Remaining** | Live readout | Auto | Calculated from sidebar `All products` count, average click/save time, delay slider, and reload interval |
| **Est. Tab Memory / Limit** | Live progress bar | Auto | Estimated tab memory usage (`MB`), DOM node count, and active `<img>` count |
| **TOTAL ADDED** | Counter | `0` | Cumulative number of assets added to your library across all page reloads |
| **UNTIL RELOAD** | `X / N` | `0 / 30` | Items claimed in the current page load before the next scheduled auto-reload |
| **Delay Between Items** | `300 ms` – `2500 ms` | `850 ms` | Pause between claiming each asset; dynamically updates the Live ETA readout |
| **Full Page Reload Every** | `10` – `100` items | `30 items` | Performs a hard page reload every `N` claimed items to flush DOM & free RAM |
| **Memory Limit** | `150 MB` – `1000 MB` | `400 MB` | Tab RAM threshold; warns at `85%` and triggers the configured threshold action at `100%` |
| **On Memory Threshold** | `Reload Page & Continue` / `Stop Script & Warn` | `Reload Page & Continue` | Action taken when estimated tab memory reaches `100%` of your Memory Limit |

---

## 🔒 Checksums & Verification

```powershell
Get-FileHash .\FabQuixelLauncher.exe -Algorithm SHA256
```

- **`FabQuixelLauncher.exe`**: `C7F8FA771C460A3A903E471C57B6C89ECE82389E982F6C87522717307531A01E`
- **`fab-quixel-auto-claimer.user.js`**: `E3C26B3535A6A6FBD3F8A9DCB6F1855B5D352FBB819A765CAB9D6EF19F0FF1D1`

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.
