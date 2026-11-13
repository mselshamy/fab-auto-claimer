// ==UserScript==
// @name         Fab.com Quixel Megascans Auto-Claimer (v6 ETA Calculator + Auto-Reload)
// @namespace    https://www.fab.com/
// @version      6.0.0
// @description  Claims free Quixel Megascans assets without touching page filters, includes Delay slider, Live ETA / Remaining Time Calculator, RAM Guard, and Auto-Reload!
// @match        https://www.fab.com/sellers/*
// @match        https://www.fab.com/*/sellers/*
// @match        https://www.fab.com/search*
// @match        https://www.fab.com/*/search*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(async function fabTampermonkeyAutoClaimerV6() {
  'use strict';

  if (window.__fabV6Loaded) return;
  window.__fabV6Loaded = true;

  const STORAGE_KEY = 'fab_v6_tampermonkey_state';
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  // Check if launched with ?fab_autorun=1 from our Executable Launcher
  const urlParams = new URLSearchParams(window.location.search);
  const isAutoRunParam = urlParams.get('fab_autorun') === '1';

  const state = {
    running: Boolean(saved.running || isAutoRunParam),
    delayMs: saved.delayMs ?? 850,                // Delay between items (ms)
    refreshEveryN: saved.refreshEveryN ?? 30,     // Hard reload page after every N items added
    memLimitMB: saved.memLimitMB ?? 400,          // Memory threshold (MB)
    memAction: saved.memAction || 'reload',       // 'reload' or 'stop' when memory limit reached
    addedSession: 0,                              // Added in current page load
    addedTotal: saved.addedTotal || 0,            // Total added across all reloads
    reloadCount: saved.reloadCount || 0,          // Number of auto-reloads completed
    initialPageRemaining: null,                   // Parsed from sidebar (e.g. "4.6K" -> 4600)
    avgActionOverheadMs: saved.avgActionOverheadMs || 750, // Measured hover+click+save time (ms)
    skippedCount: 0,
    rateLimitHits: 0,
    cooldownUntil: 0,
    emptyScrolls: 0
  };

  function saveState() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        running: state.running,
        delayMs: state.delayMs,
        refreshEveryN: state.refreshEveryN,
        memLimitMB: state.memLimitMB,
        memAction: state.memAction,
        addedTotal: state.addedTotal,
        reloadCount: state.reloadCount,
        avgActionOverheadMs: Math.round(state.avgActionOverheadMs)
      })
    );
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // --- 1. Parse Remaining Asset Count from Page Sidebar ("All products 4.6K") ---
  function parseCompactCount(str) {
    if (!str) return null;
    const cleaned = str.trim().replace(/,/g, '').toUpperCase();
    const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*([KM])?$/);
    if (!match) return null;
    const num = parseFloat(match[1]);
    const suffix = match[2];
    if (suffix === 'K') return Math.round(num * 1000);
    if (suffix === 'M') return Math.round(num * 1000000);
    return Math.round(num);
  }

  function detectRemainingAssetsCount() {
    // Look for "All products" in the left sidebar and read its numeric badge
    const elements = Array.from(document.querySelectorAll('a, button, div, li'));
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.left > 350 || rect.width === 0) continue; // Only check left sidebar
      const text = (el.innerText || '').trim();
      // Matches e.g. "All products\n4.6K" or "All products 4,520"
      const m = text.match(/all\s+products[\s\n]+(\d+(?:[.,]\d+)?\s*[KMkm]?)/i);
      if (m && m[1]) {
        const parsed = parseCompactCount(m[1]);
        if (parsed !== null && parsed > 0) {
          return parsed;
        }
      }
    }
    return null;
  }

  function getEstimatedRemainingAssets() {
    if (state.initialPageRemaining === null) {
      const detected = detectRemainingAssetsCount();
      if (detected !== null) {
        state.initialPageRemaining = detected;
      }
    }
    if (state.initialPageRemaining === null) return null;
    return Math.max(0, state.initialPageRemaining - state.addedSession);
  }

  // --- 2. Time Remaining (ETA) Calculator ---
  function formatDuration(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0s';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }

  function getETADetails() {
    const remaining = getEstimatedRemainingAssets();
    // Effective time per item = user delayMs + measured hover/click/verify overhead + amortized page reload time (~4s every N items)
    const reloadAmortizedMs = Math.round(4500 / Math.max(1, state.refreshEveryN));
    const msPerItem = state.delayMs + state.avgActionOverheadMs + reloadAmortizedMs;
    const secPerItem = (msPerItem / 1000).toFixed(1);
    const itemsPerMin = (60000 / msPerItem).toFixed(1);

    if (remaining === null) {
      return {
        remainingText: 'Scanning...',
        etaText: 'Calculating...',
        rateText: `~${secPerItem}s/item (${itemsPerMin}/min)`
      };
    }

    const totalSecRemaining = (remaining * msPerItem) / 1000;
    return {
      remainingText: `~${remaining.toLocaleString()} left`,
      etaText: `~${formatDuration(totalSecRemaining)}`,
      rateText: `~${secPerItem}s/item (${itemsPerMin}/min)`
    };
  }

  // --- 3. Live Memory Usage Monitor ---
  function getMemoryStats() {
    let heapMB = null;
    if (window.performance && window.performance.memory) {
      heapMB = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
    }
    const domNodes = document.getElementsByTagName('*').length;
    const activeImages = document.querySelectorAll('img[src]:not([src^="data:"])').length;

    const estimatedTabMB = heapMB !== null
      ? Math.round(heapMB + activeImages * 1.8 + domNodes * 0.015)
      : Math.round(80 + activeImages * 2.2 + domNodes * 0.02);

    return { heapMB, domNodes, activeImages, estimatedTabMB };
  }

  function checkMemoryThreshold() {
    const mem = getMemoryStats();
    const currentMB = mem.estimatedTabMB;
    const warnThreshold = Math.round(state.memLimitMB * 0.85);

    if (currentMB >= state.memLimitMB) {
      if (state.memAction === 'reload') {
        updateUI(`🔄 Memory (${currentMB} MB) hit limit! Reloading page...`);
        triggerHardPageReload();
        return 'RELOAD';
      } else {
        state.running = false;
        saveState();
        updateUI(`🛑 STOPPED! Memory (${currentMB} MB) hit ${state.memLimitMB} MB limit!`);
        elMemBar.style.background = '#ef4444';
        elStatus.style.background = '#7f1d1d';
        elStatus.style.color = '#fecaca';
        return 'STOP';
      }
    }

    if (currentMB >= warnThreshold) {
      elMemBar.style.background = '#f59e0b';
      return 'WARN';
    }

    elMemBar.style.background = '#22c55e';
    elStatus.style.background = '#1f2937';
    elStatus.style.color = '#e5e7eb';
    return 'OK';
  }

  // --- 4. Strip Thumbnail Bitmaps Immediately After Claiming ---
  function stripCardMemory(card) {
    if (!card) return;
    card.querySelectorAll('img, video, canvas').forEach((media) => {
      if (media.tagName === 'IMG') {
        media.removeAttribute('srcset');
        media.removeAttribute('sizes');
        media.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      } else {
        media.remove();
      }
    });
  }

  // --- 5. Real Page Reload (Tampermonkey Auto-Resumes After Reload!) ---
  function triggerHardPageReload() {
    state.reloadCount++;
    saveState();
    updateUI(`🔄 Reloading page (#${state.reloadCount}) to free RAM...`);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }

  // --- 6. Watch for HTTP 429 Rate Limits ---
  if (!window.__fabV6NetWrapped) {
    window.__fabV6NetWrapped = true;
    const origFetch = window.fetch;
    window.fetch = async function (...args) {
      const res = await origFetch.apply(this, args);
      if (res.status === 429) {
        state.rateLimitHits++;
        const waitSec = parseInt(res.headers?.get('Retry-After') || '30', 10) || 30;
        state.cooldownUntil = Math.max(state.cooldownUntil, Date.now() + waitSec * 1000);
        state.delayMs = Math.min(2500, state.delayMs + 100);
        saveState();
        updateUI(`⏳ Epic 429 Rate Limit! Cooling down ${waitSec}s...`);
      }
      return res;
    };
  }

  // --- 7. Card & Button Detection (Does NOT touch page filters!) ---
  function getProductCards() {
    const links = Array.from(document.querySelectorAll('a[href*="/listings/"]'));
    const cards = [];
    const seen = new Set();

    for (const link of links) {
      let el = link;
      let cardCandidate = null;

      for (let i = 0; i < 7; i++) {
        if (!el.parentElement) break;
        el = el.parentElement;

        const listingLinks = el.querySelectorAll('a[href*="/listings/"]');
        const uniqueHrefs = new Set(Array.from(listingLinks).map((a) => a.getAttribute('href')));

        if (uniqueHrefs.size === 1) {
          cardCandidate = el;
        } else if (uniqueHrefs.size > 1) {
          break;
        }
      }

      if (cardCandidate && !seen.has(cardCandidate)) {
        seen.add(cardCandidate);
        cards.push(cardCandidate);
      }
    }
    return cards;
  }

  function isCardSavedInLibrary(card) {
    const txt = (card.innerText || '').toLowerCase();
    return txt.includes('saved in my library') || txt.includes('in my library');
  }

  function simulateReactHover(card) {
    const targets = [
      card,
      card.firstElementChild,
      card.querySelector('a[href*="/listings/"]'),
      card.querySelector('img')
    ].filter(Boolean);

    for (const el of targets) {
      const rect = el.getBoundingClientRect();
      const eventInit = {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 3
      };
      el.dispatchEvent(new PointerEvent('pointerover', eventInit));
      el.dispatchEvent(new PointerEvent('pointerenter', { ...eventInit, bubbles: false }));
      el.dispatchEvent(new MouseEvent('mouseover', eventInit));
      el.dispatchEvent(new MouseEvent('mouseenter', { ...eventInit, bubbles: false }));
      el.dispatchEvent(new PointerEvent('pointermove', eventInit));
      el.dispatchEvent(new MouseEvent('mousemove', eventInit));
    }
  }

  function findAddToLibraryButtonInCard(card) {
    const buttons = Array.from(card.querySelectorAll('button'));
    if (buttons.length === 0) return null;

    const explicit = buttons.find((b) => {
      const lbl = ((b.getAttribute('aria-label') || '') + ' ' + (b.getAttribute('title') || '') + ' ' + (b.innerText || '')).toLowerCase();
      return lbl.includes('add to my library') || lbl.includes('add to library');
    });
    if (explicit) return explicit;

    const candidates = buttons.filter((b) => {
      if (b.disabled) return false;
      const t = (b.innerText || '').trim();
      if (/^\+\d+$/.test(t)) return false;
      return true;
    });

    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    const cardRect = card.getBoundingClientRect();
    candidates.sort((a, b) => {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      const scoreA = (ra.right - cardRect.left) - (ra.top - cardRect.top);
      const scoreB = (rb.right - cardRect.left) - (rb.top - cardRect.top);
      return scoreB - scoreA;
    });

    return candidates[0];
  }

  async function waitForCardSaved(card, timeoutMs = 4000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (isCardSavedInLibrary(card)) return true;
      if (Date.now() < state.cooldownUntil) return false;
      await sleep(120);
    }
    return isCardSavedInLibrary(card);
  }

  // --- Main Loop (Leaves filters untouched!) ---
  async function runLoop() {
    updateUI('⏳ Waiting for page cards to load...');

    for (let i = 0; i < 16; i++) {
      if (getProductCards().length > 0) break;
      await sleep(500);
    }

    // Detect initial remaining count from sidebar once cards load
    const detectedCount = detectRemainingAssetsCount();
    if (detectedCount !== null) {
      state.initialPageRemaining = detectedCount;
    }

    if (!state.running) return;

    updateUI('🚀 Claiming assets...');

    while (state.running) {
      const memStatus = checkMemoryThreshold();
      if (memStatus === 'STOP' || memStatus === 'RELOAD') return;

      if (state.addedSession >= state.refreshEveryN) {
        triggerHardPageReload();
        return;
      }

      while (state.running && Date.now() < state.cooldownUntil) {
        const rem = Math.ceil((state.cooldownUntil - Date.now()) / 1000);
        updateUI(`⏳ 429 Cooldown: waiting ${rem}s...`);
        await sleep(1000);
      }
      if (!state.running) break;

      const allCards = getProductCards();
      let processedAnyNewCard = false;

      for (const card of allCards) {
        if (!state.running) break;

        const mStat = checkMemoryThreshold();
        if (mStat === 'STOP' || mStat === 'RELOAD') return;

        if (card.dataset.fabV6Done === 'true') continue;

        if (isCardSavedInLibrary(card)) {
          card.dataset.fabV6Done = 'true';
          stripCardMemory(card);
          card.style.outline = '1px solid rgba(34, 197, 94, 0.35)';
          state.skippedCount++;
          updateUI('⏩ Skipping already saved item...');
          continue;
        }

        processedAnyNewCard = true;
        state.emptyScrolls = 0;

        const actionStart = Date.now();

        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await sleep(150);

        simulateReactHover(card);
        await sleep(180);

        let btn = findAddToLibraryButtonInCard(card);
        if (!btn) {
          simulateReactHover(card);
          await sleep(250);
          btn = findAddToLibraryButtonInCard(card);
        }

        if (btn) {
          btn.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
          btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          await sleep(50);
          btn.click();

          updateUI('⏳ Waiting for "Saved in My Library"...');
          const savedOk = await waitForCardSaved(card, 4000);

          if (savedOk) {
            // Update moving average of action overhead (hover + click + server response)
            const actionElapsed = Date.now() - actionStart;
            state.avgActionOverheadMs = state.avgActionOverheadMs * 0.8 + actionElapsed * 0.2;

            card.dataset.fabV6Done = 'true';
            card.style.outline = '2px solid #22c55e';
            stripCardMemory(card);

            state.addedSession++;
            state.addedTotal++;
            saveState();
            updateUI(`✅ Added! (${state.addedSession}/${state.refreshEveryN} before reload)`);

            if (state.addedSession >= state.refreshEveryN) {
              triggerHardPageReload();
              return;
            }
          } else if (Date.now() < state.cooldownUntil) {
            updateUI('⏳ Rate-limited, will retry item after cooldown...');
            break;
          } else {
            card.dataset.fabV6Done = 'true';
            stripCardMemory(card);
          }

          await sleep(state.delayMs);
        } else {
          card.dataset.fabV6Done = 'true';
        }
      }

      if (!state.running) break;

      if (!processedAnyNewCard && state.addedSession < state.refreshEveryN) {
        state.emptyScrolls++;
        updateUI(`📜 Scrolling down (${state.emptyScrolls}/8)...`);
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        await sleep(1800);

        if (state.emptyScrolls >= 8) {
          if (state.addedSession > 0) {
            triggerHardPageReload();
            return;
          } else {
            state.running = false;
            saveState();
            updateUI('🎉 Finished! All free assets are in your library.');
            break;
          }
        }
      }
    }
  }

  // --- Floating UI Panel ---
  const panel = document.createElement('div');
  panel.id = 'fab-v6-panel';
  panel.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 999999; width: 355px;
    background: #111827; color: #f9fafb; border: 1px solid #22c55e; border-radius: 12px;
    padding: 14px 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 13px;
    box-shadow: 0 16px 40px rgba(0,0,0,0.85); user-select: none;
  `;

  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #1f2937;padding-bottom:8px;">
      <div>
        <strong style="font-size:14px;color:#4ade80;">🛡️ Fab Auto-Claimer v6</strong>
        <span style="font-size:10px;background:#16a34a;color:#fff;padding:2px 5px;border-radius:4px;margin-left:6px;">ETA + RAM</span>
      </div>
      <span style="font-size:11px;color:#9ca3af;">Reloads: <b id="fab-v6-reloads" style="color:#38bdf8;">${state.reloadCount}</b></span>
    </div>

    <div id="fab-v6-status" style="margin-bottom:8px;padding:7px 9px;background:#1f2937;border-radius:6px;color:#e5e7eb;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
      ${state.running ? '🚀 Auto-resuming...' : 'Ready — Click Start below'}
    </div>

    <!-- ETA / Time Remaining Calculator Box -->
    <div style="margin-bottom:8px;background:#030712;padding:8px 10px;border-radius:8px;border:1px solid #1e293b;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
        <span style="font-size:11px;color:#9ca3af;">⏱️ Est. Time Remaining:</span>
        <span id="fab-v6-eta" style="font-size:13px;font-weight:700;color:#38bdf8;">Calculating...</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:#64748b;">
        <span id="fab-v6-rem-assets">Remaining: Scanning...</span>
        <span id="fab-v6-pace">Pace: --</span>
      </div>
    </div>

    <!-- Live Memory Meter -->
    <div style="margin-bottom:10px;background:#030712;padding:8px 10px;border-radius:8px;border:1px solid #1f2937;">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
        <span style="color:#9ca3af;">Est. Tab Memory / Limit:</span>
        <span id="fab-v6-mem-text" style="font-weight:700;color:#4ade80;">-- MB / ${state.memLimitMB} MB</span>
      </div>
      <div style="width:100%;height:6px;background:#1f2937;border-radius:3px;overflow:hidden;">
        <div id="fab-v6-mem-bar" style="width:20%;height:100%;background:#22c55e;transition:width 0.3s;"></div>
      </div>
      <div id="fab-v6-dom-text" style="font-size:10px;color:#6b7280;margin-top:4px;display:flex;justify-content:space-between;">
        <span>DOM Nodes: --</span>
        <span>Active Images: --</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:6px;margin-bottom:10px;text-align:center;">
      <div style="background:#030712;padding:6px;border-radius:6px;">
        <div style="font-size:9px;color:#9ca3af;">TOTAL ADDED</div>
        <div id="fab-v6-added" style="font-size:15px;font-weight:700;color:#4ade80;">${state.addedTotal}</div>
      </div>
      <div style="background:#030712;padding:6px;border-radius:6px;">
        <div style="font-size:9px;color:#9ca3af;">UNTIL RELOAD</div>
        <div id="fab-v6-batch" style="font-size:15px;font-weight:700;color:#38bdf8;">0 / ${state.refreshEveryN}</div>
      </div>
      <div style="background:#030712;padding:6px;border-radius:6px;">
        <div style="font-size:9px;color:#9ca3af;">429 WAITS</div>
        <div id="fab-v6-429" style="font-size:15px;font-weight:700;color:#f59e0b;">0</div>
      </div>
    </div>

    <!-- Restored Delay Between Items Slider -->
    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
        <span>Delay Between Items:</span>
        <span id="fab-v6-delay-val" style="color:#4ade80;font-weight:600;">${state.delayMs} ms</span>
      </div>
      <input id="fab-v6-delay" type="range" min="300" max="2500" step="50" value="${state.delayMs}" style="width:100%;cursor:pointer;" />
    </div>

    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
        <span>Full Page Reload Every:</span>
        <span id="fab-v6-ref-val" style="color:#38bdf8;font-weight:600;">${state.refreshEveryN} items</span>
      </div>
      <input id="fab-v6-ref" type="range" min="10" max="100" step="5" value="${state.refreshEveryN}" style="width:100%;cursor:pointer;" />
    </div>

    <div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
        <span>Memory Limit:</span>
        <span id="fab-v6-lim-val" style="color:#f59e0b;font-weight:600;">${state.memLimitMB} MB</span>
      </div>
      <input id="fab-v6-lim" type="range" min="150" max="1000" step="25" value="${state.memLimitMB}" style="width:100%;cursor:pointer;" />
    </div>

    <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;font-size:11px;color:#cbd5e1;">
      <span>On Memory Threshold:</span>
      <select id="fab-v6-mem-act" style="background:#1f2937;color:#fff;border:1px solid #374151;border-radius:4px;padding:2px 6px;font-size:11px;">
        <option value="reload" ${state.memAction === 'reload' ? 'selected' : ''}>Reload Page & Continue</option>
        <option value="stop" ${state.memAction === 'stop' ? 'selected' : ''}>Stop Script & Warn</option>
      </select>
    </div>

    <div style="display:flex;gap:6px;">
      <button id="fab-v6-toggle" style="flex:1;padding:9px 10px;border:none;border-radius:6px;background:#22c55e;color:#052e16;font-weight:700;cursor:pointer;font-size:13px;">
        ${state.running ? '⏸ Pause' : '▶ Start'}
      </button>
      <button id="fab-v6-reload-now" title="Reload page now and auto-resume" style="padding:9px 10px;border:1px solid #374151;border-radius:6px;background:#1f2937;color:#e5e7eb;cursor:pointer;font-size:12px;">
        🔄 Reload Now
      </button>
    </div>
  `;

  document.body.appendChild(panel);

  const elStatus = document.getElementById('fab-v6-status');
  const elReloads = document.getElementById('fab-v6-reloads');
  const elEta = document.getElementById('fab-v6-eta');
  const elRemAssets = document.getElementById('fab-v6-rem-assets');
  const elPace = document.getElementById('fab-v6-pace');
  const elMemText = document.getElementById('fab-v6-mem-text');
  const elMemBar = document.getElementById('fab-v6-mem-bar');
  const elDomText = document.getElementById('fab-v6-dom-text');
  const elAdded = document.getElementById('fab-v6-added');
  const elBatch = document.getElementById('fab-v6-batch');
  const el429 = document.getElementById('fab-v6-429');
  const elDelay = document.getElementById('fab-v6-delay');
  const elDelayVal = document.getElementById('fab-v6-delay-val');
  const elRef = document.getElementById('fab-v6-ref');
  const elRefVal = document.getElementById('fab-v6-ref-val');
  const elLim = document.getElementById('fab-v6-lim');
  const elLimVal = document.getElementById('fab-v6-lim-val');
  const elMemAct = document.getElementById('fab-v6-mem-act');
  const btnToggle = document.getElementById('fab-v6-toggle');
  const btnReloadNow = document.getElementById('fab-v6-reload-now');

  function updateUI(msg) {
    if (msg) elStatus.textContent = msg;
    elReloads.textContent = state.reloadCount;
    elAdded.textContent = state.addedTotal;
    elBatch.textContent = `${state.addedSession} / ${state.refreshEveryN}`;
    el429.textContent = state.rateLimitHits;
    elDelay.value = state.delayMs;
    elDelayVal.textContent = `${state.delayMs} ms`;

    // Update ETA Calculator
    const eta = getETADetails();
    elEta.textContent = eta.etaText;
    elRemAssets.textContent = `Remaining: ${eta.remainingText}`;
    elPace.textContent = eta.rateText;

    // Update Memory Bar
    const mem = getMemoryStats();
    const pct = Math.min(100, Math.round((mem.estimatedTabMB / state.memLimitMB) * 100));
    elMemText.textContent = `${mem.estimatedTabMB} MB / ${state.memLimitMB} MB (${pct}%)`;
    elMemBar.style.width = `${pct}%`;
    elDomText.innerHTML = `<span>DOM Nodes: ${mem.domNodes}</span><span>Active Images: ${mem.activeImages}</span>`;

    btnToggle.textContent = state.running ? '⏸ Pause' : '▶ Start';
    btnToggle.style.background = state.running ? '#f59e0b' : '#22c55e';
    btnToggle.style.color = state.running ? '#451a03' : '#052e16';
  }

  setInterval(updateUI, 2000);

  elDelay.addEventListener('input', (e) => {
    state.delayMs = Number(e.target.value);
    elDelayVal.textContent = `${state.delayMs} ms`;
    saveState();
    updateUI();
  });

  elRef.addEventListener('input', (e) => {
    state.refreshEveryN = Number(e.target.value);
    elRefVal.textContent = `${state.refreshEveryN} items`;
    saveState();
    updateUI();
  });

  elLim.addEventListener('input', (e) => {
    state.memLimitMB = Number(e.target.value);
    elLimVal.textContent = `${state.memLimitMB} MB`;
    saveState();
    updateUI();
  });

  elMemAct.addEventListener('change', (e) => {
    state.memAction = e.target.value;
    saveState();
  });

  btnToggle.addEventListener('click', () => {
    state.running = !state.running;
    saveState();
    updateUI(state.running ? '🚀 Starting...' : '⏸ Paused');
    if (state.running) {
      state.emptyScrolls = 0;
      runLoop();
    }
  });

  btnReloadNow.addEventListener('click', () => {
    triggerHardPageReload();
  });

  updateUI();

  if (state.running) {
    runLoop();
  }
})();
