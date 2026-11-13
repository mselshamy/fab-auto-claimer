# Fab.com Quixel Megascans Auto-Claimer (`v1.0.0` / Userscript `v6.0.0`)

[![Release](https://img.shields.io/badge/release-v1.0.0-22c55e?style=for-the-badge)](./RELEASE_NOTES.md)
[![Userscript](https://img.shields.io/badge/userscript-v6.0.0-38bdf8?style=for-the-badge)](./fab-quixel-auto-claimer.user.js)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6?style=for-the-badge)](#)
[![Browser](https://img.shields.io/badge/browser-Brave%20%7C%20Chromium-FB542B?style=for-the-badge)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](./LICENSE)

A complete, memory-safe automation suite for claiming free **Quixel Megascans** assets on **Epic Games' [Fab.com](https://www.fab.com/sellers/Quixel%20Megascans?is_free=1)** in **Brave Browser**.

Ships with both a **zero-dependency standalone Windows GUI Launcher (`FabQuixelLauncher.exe`)**—which handles environment checks, Tampermonkey verification, 1-click userscript installation via an embedded localhost server, and auto-run browser launch—and the standalone **Tampermonkey Userscript (`v6.0.0`)** featuring a live **ETA / Remaining Time Calculator**, **RAM Guard**, **Periodic Full-Page Auto-Reload**, and **HTTP 429 Rate-Limit Protection**.

---

## ✨ Key Features

### 1. 🖥️ Standalone Single-File Windows Launcher (`FabQuixelLauncher.exe`)
No Python, Node.js, or external dependencies required. The 45 KB native `.NET` executable guides you through a 4-step preflight dashboard:
- **Step 1 — Brave Browser Detection**: Automatically locates `brave.exe` across standard Windows installation paths (`Program Files`, `Program Files (x86)`, `%LocalAppData%\BraveSoftware\Brave-Browser\Application`) and inspects your Brave User Data profile.
- **Step 2 — Tampermonkey Extension Check**: Verifies whether **Tampermonkey** (`dhdgffkkebhmkfjojejmpbldmpobfkfo` or Beta `gcalenpjmijncebpfijmoaglllgpjagf`) is installed in your Brave profile. If missing, provides a 1-click button to open the official Chrome Web Store page right inside Brave.
- **Step 3 — `"Allow User Scripts"` / Developer Mode Verification**: Reads Brave's extension preferences to verify that Manifest V3 user script execution (`Allow User Scripts` / Developer Mode) is enabled for Tampermonkey, with a 1-click shortcut directly to `brave://extensions/?id=dhdgffkkebhmkfjojejmpbldmpobfkfo`.
- **Step 4 — 1-Click Localhost Userscript Installer**: Runs an embedded background HTTP server (`http://127.0.0.1:18923/fab-quixel-auto-claimer.user.js`) that triggers Tampermonkey's native installation tab with a single click—plus a **Copy Script to Clipboard** fallback.
- **Auto-Run Launch**: Once ready, clicks **🚀 Launch Fab.com & Start Auto-Claiming!** to open `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1&fab_autorun=1` in a new Brave window and automatically start claiming assets.

### 2. 🎯 Smart Hover + Click Automation (Filter-Safe)
- **React-Compatible Event Simulation**: Dispatches full pointer and mouse event sequences (`pointerover`, `mouseover`, `pointerenter`, `mouseenter`, `mousemove`) on each `"From Free"` product card to trigger Fab.com's React hover state and reveal the top-right **`⊞+` ("Add to My Library")** quick-action button.
- **Zero Filter Interference**: Strictly scopes clicks to product cards inside `<main>` and ignores sidebar/navigation elements, ensuring your active filters (`is_free=1`, category filters, sorting) are **never** accidentally clicked or reset.
- **Verified Library Confirmation**: Waits for the card state or button tooltip/aria-label to transition to **`"✔ Saved in My Library"`** before advancing, and dims claimed cards in the UI so progress is immediately visible.

### 3. ⏱️ Live ETA / Remaining Time Calculator
- **Automatic Sidebar Parsing**: Reads the live remaining asset count directly from Fab.com's left sidebar (`All products` badge, supporting both compact notation like `4.6K` and exact numbers like `4,520`) and decrements it in real time as items are claimed during the session.
- **Dynamic Pace & Remaining Time**: Continuously measures actual hover + click + save overhead and combines it with your **Delay Between Items** slider (`300 ms` – `2500 ms`) and amortized auto-reload time to display:
  - **Estimated Time Remaining** (`~Xh Ym` or `~Xm Ys`)
  - **Remaining Unclaimed Assets** (`~4,580 left`)
  - **Live Claiming Pace** (`~1.8s/item (33.3/min)`)

### 4. 🛡️ RAM Guard & Full Page Auto-Reload
Scrolling through thousands of high-resolution 3D asset cards on Fab.com normally causes Chromium/Brave renderer tabs to balloon past several gigabytes of RAM and crash. Version `6.0.0` solves this completely:
- **Immediate Thumbnail Bitmap Stripping**: As soon as a card is claimed (or confirmed already in your library), its `<img>`, `<picture>`, `<source>`, `<video>`, and `<canvas>` elements are replaced with a lightweight `1×1` transparent GIF and removed from the DOM, freeing GPU/Renderer texture memory immediately.
- **Live Tab Memory Monitor**: Displays a real-time memory usage bar (`MB / Limit MB (%)`), DOM node count, and active image count in the floating bottom-right control panel.
- **Configurable Memory Threshold (`150 MB` – `1000 MB`, default `400 MB`)**:
  - **Warning at 85%**: Highlights the memory bar in amber and logs a console warning when approaching your limit.
  - **Threshold Action (`100%`)**: Choose between **Reload Page & Continue** (performs a clean `window.location.reload()` and automatically resumes claiming) or **Stop Script & Warn** (pauses automation and triggers an audible/visual alert).
- **Periodic Batch Auto-Reload (Every `N` Items, default `30`)**: Automatically performs a hard page reload after claiming `N` items (`5` – `100`). Because Fab.com hides already-claimed items on fresh page loads under the `is_free=1` filter, reloading clears the entire DOM and keeps Brave running indefinitely with minimal RAM usage.

### 5. 🚦 HTTP 429 Rate-Limit Protection
- Hooks both `window.fetch` and `XMLHttpRequest` inside the page context to monitor Epic Games API responses in real time.
- If Fab.com returns **HTTP `429 Too Many Requests`**, the script immediately pauses claiming for a **45-second cooldown countdown**, increments the `429 Hits` counter, and automatically increases your inter-item delay by `+150 ms` (up to `2500 ms`) to prevent further rate limiting.

---

## 📦 Repository Contents

| File | Description |
| :--- | :--- |
| [`FabQuixelLauncher.exe`](./FabQuixelLauncher.exe) | Standalone Windows GUI Launcher (`46,592 bytes`) with embedded v6.0.0 userscript & localhost installer |
| [`fab-quixel-auto-claimer.user.js`](./fab-quixel-auto-claimer.user.js) | Standalone Tampermonkey Userscript (`v6.0.0`) for direct/manual installation |
| [`README.md`](./README.md) | Complete documentation, setup guide, configuration reference, and FAQ |
| [`RELEASE_NOTES.md`](./RELEASE_NOTES.md) | Release notes and SHA-256 verification checksums for `v1.0.0` / `v6.0.0` |
| [`LICENSE`](./LICENSE) | MIT License |

---

## 🚀 Step-by-Step Setup & Usage

### Option A: Automated Setup via `FabQuixelLauncher.exe` (Recommended)

1. **Download & Run**:
   - Download **`FabQuixelLauncher.exe`** from the [Releases](../../releases) page (or directly from this repository) and double-click it.
2. **Sign in to Fab.com in Brave**:
   - Make sure you are signed in to your Epic Games account on [https://www.fab.com](https://www.fab.com) in Brave Browser.
3. **Follow the 4-Step Preflight Checklist in the Launcher**:
   - **Step 1 (Brave Browser)**: Verified automatically (`✔ Brave Browser is installed`).
   - **Step 2 (Tampermonkey)**: If not yet installed, click **`1. Install Tampermonkey in Brave`** to open the Chrome Web Store in Brave and click **Add to Brave**. The launcher polls every 2 seconds and turns green automatically.
   - **Step 3 (Allow User Scripts / Developer Mode)**: Click **`2. Open Tampermonkey Settings in Brave`**. In the Brave tab that opens:
     - Enable the **`Allow User Scripts`** toggle inside Tampermonkey's extension details (and/or enable **Developer mode** in the top-right corner of `brave://extensions`).
     - If your Brave version stores this toggle in memory only, check the manual confirmation box in the launcher once enabled.
   - **Step 4 (Install Auto-Claimer Userscript)**: Click **`3. Install Auto-Claimer Script (1-Click)`**. Tampermonkey will open an installation tab in Brave—click **`Install`** inside Tampermonkey.
4. **Launch & Auto-Claim**:
   - Once all steps are green, a confirmation dialog will appear (or you can click **`🚀 Launch Fab.com & Start Auto-Claiming!`** at the bottom of the launcher).
   - Brave will open a new window at `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1&fab_autorun=1` and the **Fab Auto-Claimer v6** floating dashboard will appear in the bottom-right corner and start claiming immediately!

---

### Option B: Manual Tampermonkey Setup (Any Chromium Browser / Firefox)

If you prefer not to run the `.exe` launcher or are on macOS/Linux:

1. **Install Tampermonkey**:
   - Install the [Tampermonkey extension](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) for Brave, Chrome, or Edge.
2. **Enable User Scripts (Manifest V3 Requirement)**:
   - Open `brave://extensions` (or `chrome://extensions`), turn on **Developer mode** in the top-right corner, click **Details** on Tampermonkey, and enable **Allow User Scripts**.
3. **Install the Userscript**:
   - Open [`fab-quixel-auto-claimer.user.js`](./fab-quixel-auto-claimer.user.js), copy its contents, click the Tampermonkey icon in your browser → **Create a new script...**, paste the code, and press **`Ctrl+S`** (`Cmd+S`) to save.
4. **Open Quixel Megascans on Fab.com**:
   - Navigate to:
     ```text
     https://www.fab.com/sellers/Quixel%20Megascans?is_free=1
     ```
   - Ensure you are logged in, then click **`▶ Start`** on the **Fab Auto-Claimer v6** panel in the bottom-right corner (or append `&fab_autorun=1` to the URL to start automatically).

---

## 🎛️ Floating Dashboard Controls & Settings

All settings are persisted automatically in `localStorage` (`fab_v6_tampermonkey_state`) across page reloads:

| Control / Metric | Range / Options | Default | Description |
| :--- | :--- | :--- | :--- |
| **Estimated Time Remaining** | Live readout | Auto | Calculated from sidebar `All products` count, average click/save time, delay slider, and reload interval |
| **Tab Memory (Est.)** | Live progress bar | Auto | Estimated tab memory usage (`MB`), DOM node count, and active `<img>` count |
| **Total Claimed** | Counter | `0` | Cumulative number of assets added to your library across all page reloads |
| **Batch Progress** | `X / N` | `0 / 30` | Items claimed in the current page load before the next scheduled auto-reload |
| **429 Hits** | Counter | `0` | Number of HTTP `429 Too Many Requests` responses intercepted & cooled down |
| **Delay Between Items** | `300 ms` – `2500 ms` (step `50 ms`) | `850 ms` | Pause between claiming each asset; dynamically updates the Live ETA readout |
| **Auto-Reload Page Every** | `5` – `100` items (step `5`) | `30 items` | Performs a hard page reload every `N` claimed items to flush DOM & free RAM |
| **Memory Limit** | `150 MB` – `1000 MB` (step `25 MB`) | `400 MB` | Tab RAM threshold; warns at `85%` and triggers the configured threshold action at `100%` |
| **On Memory Threshold** | `Reload Page & Continue` / `Stop Script & Warn` | `Reload Page & Continue` | Action taken when estimated tab memory reaches `100%` of your Memory Limit |
| **⏸ Pause / ▶ Start** | Button | Running (with `fab_autorun=1`) | Starts or pauses the claiming loop at any time |
| **🔄 Reload Now** | Button | — | Immediately triggers a clean page reload and resumes claiming if active |

---

## 🛠️ Troubleshooting & FAQ

<details>
<summary><strong>Q: The script is installed in Tampermonkey, but the floating panel doesn't appear on Fab.com.</strong></summary>

1. Make sure **`Allow User Scripts`** is enabled in `brave://extensions/?id=dhdgffkkebhmkfjojejmpbldmpobfkfo` and **Developer mode** is toggled **ON** in the top-right corner of `brave://extensions`. Chromium Manifest V3 blocks Tampermonkey from injecting scripts until this toggle is enabled.
2. Refresh the Fab.com tab (`F5` or `Ctrl+R`) after enabling the toggle.
3. Verify the URL matches `https://www.fab.com/sellers/*` or `https://www.fab.com/search*`.
</details>

<details>
<summary><strong>Q: Why does the page reload every 30 items? Did the script crash?</strong></summary>

No! That is the **Periodic Batch Auto-Reload** feature working as designed. Fab.com is a heavy React single-page app; scrolling through hundreds of cards without reloading eventually exhausts browser tab memory. Moreover, Fab.com hides already-claimed free items when the page reloads with `?is_free=1`. By reloading every 30 items (configurable from `5` to `100`), your claimed items disappear from the feed, memory drops back to baseline, and the script automatically resumes claiming the next batch within ~3 seconds.
</details>

<details>
<summary><strong>Q: Why do card thumbnails turn blank after an item is claimed?</strong></summary>

To prevent GPU/Renderer memory leaks, **RAM Guard** strips decoded image bitmaps (`<img>`, `<picture>`, `<canvas>`) from cards immediately after they are claimed or verified in your library. The card title and `"✔ Saved in My Library"` badge remain visible.
</details>

<details>
<summary><strong>Q: What happens if Epic Games rate-limits my requests (HTTP 429)?</strong></summary>

The script intercepts HTTP `429` responses automatically, pauses claiming for a **45-second cooldown** (displaying a live countdown in the status bar), and bumps your **Delay Between Items** up by `+150 ms` to keep your session safe.
</details>

<details>
<summary><strong>Q: How do I reset the "Total Claimed" counter?</strong></summary>

Open DevTools (`F12` → **Console**) on Fab.com and run:
```javascript
localStorage.removeItem('fab_v6_tampermonkey_state');
location.reload();
```
</details>

---

## 🔒 Checksums & Verification

To verify the integrity of `FabQuixelLauncher.exe` in PowerShell:

```powershell
Get-FileHash .\FabQuixelLauncher.exe -Algorithm SHA256
```

- **File**: `FabQuixelLauncher.exe`
- **Size**: `46,592 bytes` (`45.5 KB`)
- **SHA-256**: `B399D6D72AA381B386601D583E42ED6ACC15547B75CB06474A2566ED029EC53E`

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for full details.
