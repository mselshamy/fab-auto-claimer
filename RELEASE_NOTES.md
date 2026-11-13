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
  - Features an embedded multi-resolution Windows icon (Material Symbols Rounded `view_in_ar`, `#e3e3e3`) and native Windows titlebar controls.
  - Opens `https://www.fab.com/sellers/Quixel%20Megascans?is_free=1&fab_autorun=1` in a new browser window and starts claiming automatically when signed in.

### ⚡ Fab Quixel Auto Claimer Userscript Highlights
- **Clean, Concise Floating UI with Top-Right `X` Close Button**:
  - Titled **`Fab Quixel Auto Claimer`** with a top-right **`X`** close button and streamlined **`TOTAL ADDED`** and **`UNTIL RELOAD`** counters.
- **Automatic Fab.com Login Verification**:
  - Checks if you are logged into Fab.com when the page opens (and when clicking **`▶ Start`**). If not signed in, it pauses auto-run and warns `⚠️ Not logged in! Please sign in to Fab.com first.`.
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
| **`FabQuixelLauncher.exe`** | `948D4DD2D2D8DE96847E39C28AAB0F4E1546EB0D28E418E1A8C27C89DF4E0F84` |
| **`fab-quixel-auto-claimer.user.js`** | `FD0ECE06810D2F3D41996C29FD3BC1999E29FCDFA38862F49F689F73238D47B9` |
