# 🚀 Fab.com Quixel Megascans Auto-Claimer — Release `v1.0.0` (Userscript `v6.0.0`)

Automate claiming every free **Quixel Megascans** asset on **Epic Games' Fab.com** in **Brave Browser** without running out of RAM, losing your search filters, or hitting rate limits.

This release includes both the **standalone single-file Windows GUI Launcher (`FabQuixelLauncher.exe`)** and the **v6.0.0 Tampermonkey Userscript (`fab-quixel-auto-claimer.user.js`)**.

---

## 🌟 What's Included in `v1.0.0` / `v6.0.0`

### 🖥️ Standalone Single-File Windows Launcher (`FabQuixelLauncher.exe`)
- **Zero-Dependency Windows Executable (`45.5 KB`)**: Built on native Windows `.NET`—no external runtimes or installers needed.
- **Automated 4-Step Preflight Verification**:
  1. Detects **Brave Browser** installation (`brave.exe`) and active user profile.
  2. Verifies **Tampermonkey** (`dhdgffkkebhmkfjojejmpbldmpobfkfo`) installation, with a 1-click button to install from the Chrome Web Store if missing.
  3. Checks that **`"Allow User Scripts"` / Developer Mode** is enabled in Brave's extension settings, with a direct 1-click shortcut to `brave://extensions/?id=dhdgffkkebhmkfjojejmpbldmpobfkfo`.
  4. Hosts the embedded **v6.0.0 Userscript** on a local background HTTP server (`http://127.0.0.1:18923/fab-quixel-auto-claimer.user.js`) for **1-Click Tampermonkey Installation** (plus a **Copy Script to Clipboard** fallback).
- **1-Click Auto-Run Launch**: Opens `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1&fab_autorun=1` in a new Brave window and starts claiming assets automatically.

### ⚡ Userscript `v6.0.0` Highlights
- **Smart Hover + Click Automation (Filter-Safe)**:
  - Dispatches full React-compatible pointer/mouse hover sequences on `"From Free"` product cards inside `<main>` to reveal the top-right **`⊞+` ("Add to My Library")** button, clicks it, and waits for **`"✔ Saved in My Library"`** confirmation—without ever touching or resetting sidebar/page filters.
- **Live ETA / Remaining Time Calculator**:
  - Automatically parses the remaining asset count from Fab.com's left sidebar (`All products` badge, e.g., `4.6K`) and computes live **Estimated Time Remaining (`~Xh Ym`)**, **Remaining Unclaimed Assets**, and **Claiming Pace (`s/item` & `items/min`)** that dynamically react as you adjust the **Delay Between Items** slider (`300 ms` – `2500 ms`).
- **RAM Guard & Periodic Full-Page Auto-Reload**:
  - **Bitmap Stripping**: Immediately purges decoded thumbnail images (`<img>`, `<picture>`, `<canvas>`) from claimed cards to free GPU/Renderer memory.
  - **Live Tab Memory Monitor**: Tracks estimated tab RAM against a configurable **Memory Limit** (`150 MB` – `1000 MB`, default `400 MB`) with an `85%` warning state and configurable `100%` action (`Reload Page & Continue` or `Stop Script & Warn`).
  - **Batch Auto-Reload**: Performs a hard page reload every `N` claimed items (`5` – `100`, default `30`) so Fab.com clears already-claimed free items from the DOM and keeps Brave memory usage flat for multi-hour runs.
- **HTTP 429 Rate-Limit Protection**:
  - Intercepts `fetch` and `XMLHttpRequest` `429 Too Many Requests` responses, pauses for a 45-second cooldown countdown, and automatically increases inter-item delay (`+150 ms`) to protect your Epic Games session.

---

## 📥 Quick Start

1. Download **`FabQuixelLauncher.exe`** from the **Assets** section below.
2. Make sure you are signed in to [Fab.com](https://www.fab.com) in **Brave Browser**.
3. Run **`FabQuixelLauncher.exe`**, complete any missing green checkmarks using the 1-click buttons, and click **`🚀 Launch Fab.com & Start Auto-Claiming!`**.

*(Prefer manual installation? Download **`fab-quixel-auto-claimer.user.js`** below and import it directly into Tampermonkey.)*

---

## 🔒 Release Asset Checksums (`SHA-256`)

| Asset File | Size | SHA-256 Checksum |
| :--- | :--- | :--- |
| **`FabQuixelLauncher.exe`** | `46,592 bytes` (`45.5 KB`) | `B399D6D72AA381B386601D583E42ED6ACC15547B75CB06474A2566ED029EC53E` |
| **`fab-quixel-auto-claimer.user.js`** | `26,327 bytes` (`25.7 KB`) | `098E0E50B1F308866AB5F5D50B58A3F0713EC3D1D664EE36074E864A162F6C32` |

Verify in Windows PowerShell:
```powershell
Get-FileHash .\FabQuixelLauncher.exe -Algorithm SHA256
```
