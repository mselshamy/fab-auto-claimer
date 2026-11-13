# 🚀 Fab Quixel Auto Claimer — Release `v1.0.0`

Automate claiming every free **Quixel Megascans** asset on **Epic Games' Fab.com** in **Brave Browser**, **Google Chrome**, and **Microsoft Edge** without running out of RAM or losing your search filters.

This release includes both the **standalone single-file Windows GUI Launcher (`FabQuixelLauncher.exe`)** and the **Tampermonkey Userscript (`fab-quixel-auto-claimer.user.js`)**.

---

## 🌟 What's Included

### 🖥️ Standalone Windows Launcher (`FabQuixelLauncher.exe`)
- **Multi-Browser Support (`Brave Browser`, `Google Chrome`, & `Microsoft Edge`)**:
  - Automatically detects installed Chromium browsers and lets you pick your preferred browser via a dropdown selector.
  - Supports both the [Chrome Web Store Tampermonkey extension](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=ext_app_menu) and the [Microsoft Edge Add-ons Tampermonkey extension](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd).
  - Verifies `"Allow User Scripts"` / Developer Mode and installs the embedded userscript via a built-in localhost server in 1 click.
  - Opens `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1&fab_autorun=1` in a new browser window and starts claiming automatically.

### ⚡ Fab Quixel Auto Claimer Userscript Highlights
- **Clean, Concise Floating UI with Top-Right `X` Close Button**:
  - Titled **`Fab Quixel Auto Claimer`** with a top-right **`X`** close button and streamlined **`TOTAL ADDED`** and **`UNTIL RELOAD`** counters.
- **Smart Hover + Click Automation (Filter-Safe)**:
  - Simulates React pointer/mouse hover events on `"From Free"` product cards to reveal the top-right **`⊞+` ("Add to My Library")** button, clicks it, and waits for **`"✔ Saved in My Library"`** confirmation without touching your page filters.
- **Live ETA / Remaining Time Calculator**:
  - Parses the remaining asset count from Fab.com's left sidebar (`All products` badge) and computes live **Estimated Time Remaining (`~Xh Ym`)**, **Remaining Unclaimed Assets**, and **Claiming Pace (`s/item` & `items/min`)** that dynamically update as you adjust the **Delay Between Items** slider (`300 ms` – `2500 ms`).
- **RAM Guard & Periodic Full-Page Auto-Reload**:
  - Immediately strips decoded thumbnail images from claimed cards to free GPU/Renderer memory, monitors live tab RAM against a configurable **Memory Limit** (`150 MB` – `1000 MB`), and reloads the page every `N` items (default `30`) so Brave/Chrome/Edge memory stays flat for hours.

---

## 🔒 Release Asset Checksums (`SHA-256`)

| Asset File | SHA-256 Checksum |
| :--- | :--- |
| **`FabQuixelLauncher.exe`** | `C7F8FA771C460A3A903E471C57B6C89ECE82389E982F6C87522717307531A01E` |
| **`fab-quixel-auto-claimer.user.js`** | `E3C26B3535A6A6FBD3F8A9DCB6F1855B5D352FBB819A765CAB9D6EF19F0FF1D1` |
