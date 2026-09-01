/* @ds-bundle: {"format":3,"namespace":"PersonioBrandSystemWIP_d13d54","components":[],"sourceHashes":{"deck-stage.js":"522102a1c71e","ui_kits/web-app/components/Nav.jsx":"4558fa2053e5","ui_kits/web-app/components/Screens.jsx":"a41246bddecf","ui_kits/web-app/components/Shared.jsx":"59fb3378f76e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PersonioBrandSystemWIP_d13d54 = window.PersonioBrandSystemWIP_d13d54 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// deck-stage.js
try { (() => {
/**
 * <deck-stage> — reusable web component for HTML decks.
 *
 * Handles:
 *  (a) speaker notes — reads <script type="application/json" id="speaker-notes">
 *      and posts {slideIndexChanged: N} to the parent window on nav.
 *  (b) keyboard navigation — ←/→, PgUp/PgDn, Space, Home/End, number keys.
 *  (c) press R to reset to slide 0 (with a tasteful keyboard hint).
 *  (d) bottom-center overlay showing slide count + hints, fades out on idle.
 *  (e) auto-scaling — inner canvas is a fixed design size (default 1920×1080)
 *      scaled with `transform: scale()` to fit the viewport, letterboxed.
 *      Set the `noscale` attribute to render at authored size (1:1) — the
 *      PPTX exporter sets this so its DOM capture sees unscaled geometry.
 *  (f) print — `@media print` lays every slide out as its own page at the
 *      design size, so the browser's Print → Save as PDF produces a clean
 *      one-page-per-slide PDF with no extra setup.
 *
 * Slides are HIDDEN, not unmounted. Non-active slides stay in the DOM with
 * `visibility: hidden` + `opacity: 0`, so their state (videos, iframes,
 * form inputs, React trees) is preserved across navigation.
 *
 * Lifecycle event — the component dispatches a `slidechange` CustomEvent on
 * itself whenever the active slide changes (including the initial mount).
 * The event bubbles and composes out of shadow DOM, so you can listen on
 * the <deck-stage> element or on document:
 *
 *   document.querySelector('deck-stage').addEventListener('slidechange', (e) => {
 *     e.detail.index         // new 0-based index
 *     e.detail.previousIndex // previous index, or -1 on init
 *     e.detail.total         // total slide count
 *     e.detail.slide         // the new active slide element
 *     e.detail.previousSlide // the prior slide element, or null on init
 *     e.detail.reason        // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
 *   });
 *
 * Persistence: current slide index is saved to localStorage keyed by the
 * document path, so refresh returns you to the same place.
 *
 * Usage:
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const STORAGE_PREFIX = 'deck-stage:slide:';
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const pad2 = n => String(n).padStart(2, '0');
  const stylesheet = `
    :host {
      position: fixed;
      inset: 0;
      display: block;
      background: #000;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      overflow: hidden;
    }

    .stage {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .canvas {
      position: relative;
      transform-origin: center center;
      flex-shrink: 0;
      background: #fff;
      will-change: transform;
    }

    /* Slides live in light DOM (via <slot>) so authored CSS still applies.
       We absolutely position each slotted child to stack them. */
    ::slotted(*) {
      position: absolute !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      box-sizing: border-box !important;
      overflow: hidden;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
    }
    ::slotted([data-deck-active]) {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }

    /* Tap zones for mobile — back/forward thirds like Stories.
       Transparent, no visible UI, don't block the overlay. */
    .tapzones {
      position: fixed;
      inset: 0;
      display: flex;
      z-index: 2147482000;
      pointer-events: none;
    }
    .tapzone {
      flex: 1;
      pointer-events: auto;
      -webkit-tap-highlight-color: transparent;
    }
    /* Only activate tap zones on coarse pointers (touch devices). */
    @media (hover: hover) and (pointer: fine) {
      .tapzones { display: none; }
    }

    .overlay {
      position: fixed;
      left: 50%;
      bottom: 22px;
      transform: translate(-50%, 6px) scale(0.92);
      filter: blur(6px);
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      background: #000;
      color: #fff;
      border-radius: 999px;
      font-size: 12px;
      font-feature-settings: "tnum" 1;
      letter-spacing: 0.01em;
      opacity: 0;
      pointer-events: none;
      transition: opacity 260ms ease, transform 260ms cubic-bezier(.2,.8,.2,1), filter 260ms ease;
      transform-origin: center bottom;
      z-index: 2147483000;
      user-select: none;
    }
    .overlay[data-visible] {
      opacity: 1;
      pointer-events: auto;
      transform: translate(-50%, 0) scale(1);
      filter: blur(0);
    }

    .btn {
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: 0;
      margin: 0;
      padding: 0;
      color: inherit;
      font: inherit;
      cursor: default;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 28px;
      min-width: 28px;
      border-radius: 999px;
      color: rgba(255,255,255,0.72);
      transition: background 140ms ease, color 140ms ease;
      -webkit-tap-highlight-color: transparent;
    }
    .btn:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn:active { background: rgba(255,255,255,0.18); }
    .btn:focus { outline: none; }
    .btn:focus-visible { outline: none; }
    .btn::-moz-focus-inner { border: 0; }
    .btn svg { width: 14px; height: 14px; display: block; }
    .btn.reset {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.02em;
      padding: 0 10px 0 12px;
      gap: 6px;
      color: rgba(255,255,255,0.72);
    }
    .btn.reset .kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      font-size: 10px;
      line-height: 1;
      color: rgba(255,255,255,0.88);
      background: rgba(255,255,255,0.12);
      border-radius: 4px;
    }

    .count {
      font-variant-numeric: tabular-nums;
      color: #fff;
      font-weight: 500;
      padding: 0 8px;
      min-width: 42px;
      text-align: center;
      font-size: 12px;
    }
    .count .sep { color: rgba(255,255,255,0.45); margin: 0 3px; font-weight: 400; }
    .count .total { color: rgba(255,255,255,0.55); }

    .divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.18);
      margin: 0 2px;
    }

    /* ── Print: one page per slide, no chrome ────────────────────────────
       The screen layout stacks every slide at inset:0 inside a scaled
       canvas; for print we want them in document flow at the authored
       design size so the browser paginates one slide per sheet. The
       @page size is set from the width/height attributes via the inline
       <style id="deck-stage-print-page"> that connectedCallback injects
       into <head> (the @page at-rule has no effect inside shadow DOM). */
    @media print {
      :host {
        position: static;
        inset: auto;
        background: none;
        overflow: visible;
        color: inherit;
      }
      .stage { position: static; display: block; }
      .canvas {
        transform: none !important;
        width: auto !important;
        height: auto !important;
        background: none;
        will-change: auto;
      }
      ::slotted(*) {
        position: relative !important;
        inset: auto !important;
        width: var(--deck-design-w) !important;
        height: var(--deck-design-h) !important;
        box-sizing: border-box !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        overflow: hidden;
      }
      ::slotted(*:last-child) {
        break-after: auto;
        page-break-after: auto;
      }
      .overlay, .tapzones { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale'];
    }
    constructor() {
      super();
      this._root = this.attachShadow({
        mode: 'open'
      });
      this._index = 0;
      this._slides = [];
      this._notes = [];
      this._hideTimer = null;
      this._mouseIdleTimer = null;
      this._storageKey = STORAGE_PREFIX + (location.pathname || '/');
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTapBack = this._onTapBack.bind(this);
      this._onTapForward = this._onTapForward.bind(this);
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      // Initial collection + layout happens via slotchange, which fires on mount.
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        this._fit();
        this._syncPrintPageRule();
      }
    }
    _render() {
      const style = document.createElement('style');
      style.textContent = stylesheet;
      const stage = document.createElement('div');
      stage.className = 'stage';
      const canvas = document.createElement('div');
      canvas.className = 'canvas';
      canvas.style.width = this.designWidth + 'px';
      canvas.style.height = this.designHeight + 'px';
      canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
      canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
      const slot = document.createElement('slot');
      slot.addEventListener('slotchange', this._onSlotChange);
      canvas.appendChild(slot);
      stage.appendChild(canvas);

      // Tap zones (mobile): left third = back, right third = forward.
      const tapzones = document.createElement('div');
      tapzones.className = 'tapzones export-hidden';
      tapzones.setAttribute('aria-hidden', 'true');
      const tzBack = document.createElement('div');
      tzBack.className = 'tapzone tapzone--back';
      const tzMid = document.createElement('div');
      tzMid.className = 'tapzone tapzone--mid';
      tzMid.style.pointerEvents = 'none';
      const tzFwd = document.createElement('div');
      tzFwd.className = 'tapzone tapzone--fwd';
      tzBack.addEventListener('click', this._onTapBack);
      tzFwd.addEventListener('click', this._onTapForward);
      tapzones.append(tzBack, tzMid, tzFwd);

      // Overlay: compact, solid black, with clickable controls.
      const overlay = document.createElement('div');
      overlay.className = 'overlay export-hidden';
      overlay.setAttribute('role', 'toolbar');
      overlay.setAttribute('aria-label', 'Deck controls');
      overlay.innerHTML = `
        <button class="btn prev" type="button" aria-label="Previous slide" title="Previous (←)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg>
        </button>
        <span class="count" aria-live="polite"><span class="current">1</span><span class="sep">/</span><span class="total">1</span></span>
        <button class="btn next" type="button" aria-label="Next slide" title="Next (→)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
        </button>
        <span class="divider"></span>
        <button class="btn reset" type="button" aria-label="Reset to first slide" title="Reset (R)">Reset<span class="kbd">R</span></button>
      `;
      overlay.querySelector('.prev').addEventListener('click', () => this._go(this._index - 1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._go(this._index + 1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));
      this._root.append(style, stage, tapzones, overlay);
      this._canvas = canvas;
      this._slot = slot;
      this._overlay = overlay;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');
    }

    /** @page must live in the document stylesheet — it's a no-op inside
     *  shadow DOM. Inject/update a single <head> style tag so the print
     *  sheet matches the design size and Save-as-PDF yields one slide per
     *  page with no margins. */
    _syncPrintPageRule() {
      const id = 'deck-stage-print-page';
      let tag = document.getElementById(id);
      if (!tag) {
        tag = document.createElement('style');
        tag.id = id;
        document.head.appendChild(tag);
      }
      tag.textContent = '@page { size: ' + this.designWidth + 'px ' + this.designHeight + 'px; margin: 0; } ' + '@media print { html, body { margin: 0 !important; padding: 0 !important; background: none !important; overflow: visible !important; height: auto !important; } ' + '* { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }';
    }
    _onSlotChange() {
      this._collectSlides();
      this._restoreIndex();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'init'
      });
      this._fit();
    }
    _collectSlides() {
      const assigned = this._slot.assignedElements({
        flatten: true
      });
      this._slides = assigned.filter(el => {
        // Skip template/style/script nodes even if someone slots them.
        const tag = el.tagName;
        return tag !== 'TEMPLATE' && tag !== 'SCRIPT' && tag !== 'STYLE';
      });
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        // Determine a label for comment flow: prefer explicit data-label,
        // then an existing data-screen-label, then first heading, else "Slide".
        let label = slide.getAttribute('data-label');
        if (!label) {
          const existing = slide.getAttribute('data-screen-label');
          if (existing) {
            // Strip any leading number the author may have included.
            label = existing.replace(/^\s*\d+\s*/, '').trim() || existing;
          }
        }
        if (!label) {
          const h = slide.querySelector('h1, h2, h3, [data-title]');
          if (h) label = (h.textContent || '').trim().slice(0, 40);
        }
        if (!label) label = 'Slide';
        slide.setAttribute('data-screen-label', `${pad2(n)} ${label}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
    }
    _loadNotes() {
      const tag = document.getElementById('speaker-notes');
      if (!tag) {
        this._notes = [];
        return;
      }
      try {
        const parsed = JSON.parse(tag.textContent || '[]');
        if (Array.isArray(parsed)) this._notes = parsed;
      } catch (e) {
        console.warn('[deck-stage] Failed to parse #speaker-notes JSON:', e);
        this._notes = [];
      }
    }
    _restoreIndex() {
      try {
        const raw = localStorage.getItem(this._storageKey);
        if (raw != null) {
          const n = parseInt(raw, 10);
          if (Number.isFinite(n) && n >= 0 && n < this._slides.length) {
            this._index = n;
          }
        }
      } catch (e) {/* ignore */}
    }
    _persistIndex() {
      try {
        localStorage.setItem(this._storageKey, String(this._index));
      } catch (e) {/* ignore */}
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      this._persistIndex();
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr
          }, '*');
        } catch (e) {}

        // (2) In-page CustomEvent on the <deck-stage> element itself.
        //     Bubbles and composes out of shadow DOM so slide code can listen:
        //       document.querySelector('deck-stage').addEventListener('slidechange', e => {
        //         e.detail.index, e.detail.previousIndex, e.detail.total, e.detail.slide, e.detail.reason
        //       });
        const detail = {
          index: curr,
          previousIndex: prev,
          total: this._slides.length,
          slide: this._slides[curr] || null,
          previousSlide: prev >= 0 ? this._slides[prev] || null : null,
          reason: reason // 'init' | 'keyboard' | 'click' | 'tap' | 'api'
        };
        this.dispatchEvent(new CustomEvent('slidechange', {
          detail,
          bubbles: true,
          composed: true
        }));
      }
      this._prevIndex = curr;
      if (showOverlay) this._flashOverlay();
    }
    _flashOverlay() {
      if (!this._overlay) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _fit() {
      if (!this._canvas) return;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        return;
      }
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / this.designWidth, vh / this.designHeight);
      this._canvas.style.transform = `scale(${s})`;
    }
    _onResize() {
      this._fit();
    }
    _onMouseMove() {
      // Keep overlay visible while mouse moves; hide after idle.
      this._flashOverlay();
    }
    _onTapBack(e) {
      e.preventDefault();
      this._go(this._index - 1, 'tap');
    }
    _onTapForward(e) {
      e.preventDefault();
      this._go(this._index + 1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._go(this._index + 1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._go(this._index - 1, 'keyboard');
      } else if (key === 'Home') {
        this._go(0, 'keyboard');
      } else if (key === 'End') {
        this._go(this._slides.length - 1, 'keyboard');
      } else if (key === 'r' || key === 'R') {
        this._go(0, 'keyboard');
      } else if (/^[0-9]$/.test(key)) {
        // 1..9 jump to that slide; 0 jumps to 10.
        const n = key === '0' ? 9 : parseInt(key, 10) - 1;
        if (n < this._slides.length) this._go(n, 'keyboard');
      } else {
        handled = false;
      }
      if (handled) {
        e.preventDefault();
        this._flashOverlay();
      }
    }
    _go(i, reason = 'api') {
      if (!this._slides.length) return;
      const clamped = Math.max(0, Math.min(this._slides.length - 1, i));
      if (clamped === this._index) {
        this._flashOverlay();
        return;
      }
      this._index = clamped;
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason
      });
    }

    // Public API ------------------------------------------------------------

    /** Current slide index (0-based). */
    get index() {
      return this._index;
    }
    /** Total slide count. */
    get length() {
      return this._slides.length;
    }
    /** Programmatically navigate. */
    goTo(i) {
      this._go(i, 'api');
    }
    next() {
      this._go(this._index + 1, 'api');
    }
    prev() {
      this._go(this._index - 1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/web-app/components/Nav.jsx
try { (() => {
// Personio HR Platform — Sidebar + TopBar
// Load with <script type="text/babel" src="components/Nav.jsx">

const NAV_ITEMS = [{
  id: 'home',
  icon: 'home',
  label: 'Home'
}, {
  id: 'people',
  icon: 'users',
  label: 'People'
}, {
  id: 'recruiting',
  icon: 'briefcase',
  label: 'Recruiting'
}, {
  id: 'performance',
  icon: 'star',
  label: 'Performance'
}, {
  id: 'calendar',
  icon: 'calendar',
  label: 'Time & Attendance'
}, {
  id: 'analytics',
  icon: 'chart',
  label: 'Analytics'
}, {
  id: 'inbox',
  icon: 'inbox',
  label: 'Inbox',
  badge: 3
}];
const Sidebar = ({
  active,
  onNav
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: 220,
    flexShrink: 0,
    background: C.darkest,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    padding: '0 0 16px 0'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    padding: '20px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)'
  }
}, /*#__PURE__*/React.createElement("img", {
  src: "../../assets/logomark.svg",
  height: "22",
  alt: "Personio",
  style: {
    filter: 'invert(1)',
    display: 'block'
  }
})), /*#__PURE__*/React.createElement("nav", {
  style: {
    flex: 1,
    padding: '8px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }
}, NAV_ITEMS.map(item => {
  const isActive = active === item.id;
  return /*#__PURE__*/React.createElement("div", {
    key: item.id,
    onClick: () => onNav(item.id),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 7,
      cursor: 'pointer',
      background: isActive ? 'rgba(165,51,204,0.18)' : 'transparent',
      transition: 'background 0.12s'
    },
    onMouseEnter: e => {
      if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
    },
    onMouseLeave: e => {
      if (!isActive) e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: 16,
    color: isActive ? C.accent : 'rgba(255,255,255,0.45)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 13,
      fontWeight: isActive ? 600 : 400,
      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
      flex: 1
    }
  }, item.label), item.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      background: C.accent,
      color: '#fff',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 600,
      padding: '1px 6px',
      fontFamily: FONT
    }
  }, item.badge));
})), /*#__PURE__*/React.createElement("div", {
  style: {
    padding: '0 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    cursor: 'pointer',
    borderRadius: 7
  },
  onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)',
  onMouseLeave: e => e.currentTarget.style.background = 'transparent'
}, /*#__PURE__*/React.createElement(Icon, {
  name: "settings",
  size: 16,
  color: "rgba(255,255,255,0.4)"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)'
  }
}, "Settings")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 10px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: 4
  }
}, /*#__PURE__*/React.createElement(Avatar, {
  initials: "MH",
  bg: "#321a3d",
  color: C.accent,
  size: 28
}), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 500,
    color: '#fff'
  }
}, "Maria H."), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)'
  }
}, "HR Manager")))));
const TopBar = ({
  title,
  subtitle,
  actions
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    height: 56,
    flexShrink: 0,
    background: C.bg,
    borderBottom: `1px solid ${C.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 15,
    fontWeight: 600,
    color: C.fg
  }
}, title), subtitle && /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: C.fg2,
    marginTop: 1
  }
}, subtitle)), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    padding: '6px 12px',
    width: 200
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "search",
  size: 14,
  color: C.fg3
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 13,
    color: C.fg3
  }
}, "Search\u2026")), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative',
    cursor: 'pointer'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "bell",
  size: 18,
  color: C.fg2
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    background: C.accent,
    borderRadius: '50%',
    border: `1.5px solid ${C.bg}`
  }
})), actions, /*#__PURE__*/React.createElement(Avatar, {
  initials: "MH",
  bg: C.accentSubtle,
  color: C.accent,
  size: 30
}));
Object.assign(window, {
  Sidebar,
  TopBar,
  NAV_ITEMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/components/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/components/Screens.jsx
try { (() => {
// Personio HR Platform — Screen components
// Load with <script type="text/babel" src="components/Screens.jsx">

// ── PEOPLE LIST SCREEN ──
const EMPLOYEES = [{
  id: 1,
  name: 'Alex Kim',
  initials: 'AK',
  role: 'Product Designer',
  dept: 'Design',
  status: 'active',
  start: 'Mar 2024',
  bg: '#EDD6F5',
  fg: '#531A66'
}, {
  id: 2,
  name: 'Sara Jensen',
  initials: 'SJ',
  role: 'Software Engineer',
  dept: 'Engineering',
  status: 'onboarding',
  start: 'Jan 2025',
  bg: '#D5F4F6',
  fg: '#09282A'
}, {
  id: 3,
  name: 'Marco Rossi',
  initials: 'MR',
  role: 'People Ops Lead',
  dept: 'HR',
  status: 'active',
  start: 'Aug 2022',
  bg: '#D6F5E4',
  fg: '#1A663C'
}, {
  id: 4,
  name: 'Lena Park',
  initials: 'LP',
  role: 'Account Executive',
  dept: 'Sales',
  status: 'active',
  start: 'Nov 2023',
  bg: '#FFD6CC',
  fg: '#801A00'
}, {
  id: 5,
  name: 'Tom Weber',
  initials: 'TW',
  role: 'Data Analyst',
  dept: 'Analytics',
  status: 'active',
  start: 'Jun 2023',
  bg: '#FFEACC',
  fg: '#804B00'
}, {
  id: 6,
  name: 'Jana Novak',
  initials: 'JN',
  role: 'Payroll Specialist',
  dept: 'Finance',
  status: 'pending',
  start: 'Feb 2025',
  bg: '#FBD0E7',
  fg: '#540730'
}, {
  id: 7,
  name: 'David Osei',
  initials: 'DO',
  role: 'Backend Engineer',
  dept: 'Engineering',
  status: 'active',
  start: 'Apr 2023',
  bg: '#A1BCF7',
  fg: '#061B47'
}, {
  id: 8,
  name: 'Mia Torres',
  initials: 'MT',
  role: 'Marketing Manager',
  dept: 'Marketing',
  status: 'offboarded',
  start: 'Jan 2021',
  bg: '#E6E6E5',
  fg: '#404040'
}];
const PeopleScreen = ({
  onSelect
}) => {
  const [filter, setFilter] = React.useState('all');
  const depts = ['all', 'Engineering', 'HR', 'Design', 'Sales', 'Finance', 'Analytics', 'Marketing'];
  const shown = filter === 'all' ? EMPLOYEES : EMPLOYEES.filter(e => e.dept === filter);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: '20px 24px 0'
    }
  }, [{
    label: 'Total employees',
    val: '247',
    delta: '+12 this month',
    up: true
  }, {
    label: 'Active',
    val: '231',
    delta: '93.5%',
    up: true
  }, {
    label: 'Onboarding',
    val: '8',
    delta: '3 new this week',
    up: null
  }, {
    label: 'Open roles',
    val: '18',
    delta: '5 in final round',
    up: null
  }].map(k => /*#__PURE__*/React.createElement("div", {
    key: k.label,
    style: {
      background: C.bg,
      borderRadius: 10,
      padding: '14px 18px',
      flex: 1,
      boxShadow: '0px 0.751px 5.885px rgba(0,0,0,0.02),0px 1.809px 14.169px rgba(0,0,0,0.026),0px 6px 47px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.03em',
      color: C.fg
    }
  }, k.val), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 11,
      color: C.fg2,
      marginTop: 2
    }
  }, k.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 11,
      fontWeight: 500,
      color: k.up ? '#21834D' : C.fg3,
      marginTop: 4
    }
  }, k.delta)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '16px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flex: 1,
      overflow: 'auto'
    }
  }, depts.map(d => /*#__PURE__*/React.createElement("button", {
    key: d,
    onClick: () => setFilter(d),
    style: {
      border: `1px solid ${filter === d ? C.accent : C.border}`,
      background: filter === d ? C.accentSubtle : C.bg,
      color: filter === d ? C.accent : C.fg2,
      borderRadius: 9999,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 500,
      fontFamily: FONT,
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, d === 'all' ? 'All employees' : d))), /*#__PURE__*/React.createElement(Button, {
    label: "Add employee",
    icon: "plus",
    size: "sm"
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 7,
      padding: '6px 10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "filter",
    size: 13,
    color: C.fg2
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg2
    }
  }, "Filter")), /*#__PURE__*/React.createElement("button", {
    style: {
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 7,
      padding: '6px 10px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "download",
    size: 13,
    color: C.fg2
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg2
    }
  }, "Export"))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 24px',
      background: C.bg,
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      overflow: 'hidden',
      boxShadow: '0px 0.751px 5.885px rgba(0,0,0,0.02),0px 6px 47px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 40px',
      gap: '0 16px',
      padding: '10px 18px',
      borderBottom: `1px solid ${C.border}`,
      background: C.surface
    }
  }, ['Employee', 'Role', 'Department', 'Start date', 'Status', ''].map(h => /*#__PURE__*/React.createElement("span", {
    key: h,
    style: {
      fontFamily: FONT,
      fontSize: 11,
      fontWeight: 500,
      color: C.fg3,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, h))), shown.map((emp, i) => /*#__PURE__*/React.createElement("div", {
    key: emp.id,
    onClick: () => onSelect(emp),
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 40px',
      gap: '0 16px',
      padding: '12px 18px',
      alignItems: 'center',
      cursor: 'pointer',
      borderBottom: i < shown.length - 1 ? `1px solid ${C.border}` : 'none',
      transition: 'background 0.1s'
    },
    onMouseEnter: e => e.currentTarget.style.background = C.surface,
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: emp.initials,
    bg: emp.bg,
    color: emp.fg,
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 13,
      fontWeight: 500,
      color: C.fg
    }
  }, emp.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg2
    }
  }, emp.role), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg2
    }
  }, emp.dept), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg2
    }
  }, emp.start), /*#__PURE__*/React.createElement(Badge, {
    label: emp.status.charAt(0).toUpperCase() + emp.status.slice(1),
    variant: emp.status
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 14,
    color: C.fg3
  })))));
};

// ── EMPLOYEE PROFILE SCREEN ──
const ProfileScreen = ({
  employee,
  onBack
}) => {
  const [tab, setTab] = React.useState('overview');
  if (!employee) return null;
  const tabs = ['Overview', 'Documents', 'Time off', 'Performance', 'Payroll'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      padding: '24px 24px 0',
      borderBottom: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg3,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginBottom: 16,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 13,
    color: C.fg3,
    style: {
      transform: 'rotate(180deg)'
    }
  }), " Back to People"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 18,
      paddingBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: employee.initials,
    bg: employee.bg,
    color: employee.fg,
    size: 64
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: C.fg
    }
  }, employee.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 13,
      color: C.fg2,
      marginTop: 2
    }
  }, employee.role, " \xB7 ", employee.dept), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: employee.status.charAt(0).toUpperCase() + employee.status.slice(1),
    variant: employee.status
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 11,
      color: C.fg3,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 11,
    color: C.fg3
  }), " Joined ", employee.start))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    label: "Edit profile",
    variant: "secondary",
    size: "sm"
  }), /*#__PURE__*/React.createElement(Button, {
    label: "Actions",
    icon: "chevronDown",
    variant: "secondary",
    size: "sm"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 0
    }
  }, tabs.map(t => {
    const active = tab === t.toLowerCase().replace(/ /g, '');
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => setTab(t.toLowerCase().replace(/ /g, '')),
      style: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: FONT,
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        color: active ? C.fg : C.fg2,
        padding: '8px 16px',
        borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
        transition: 'all 0.15s',
        marginBottom: -1
      }
    }, t);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      borderRadius: 10,
      padding: '18px 20px',
      border: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      fontWeight: 600,
      color: C.fg,
      marginBottom: 14
    }
  }, "Personal info"), [{
    label: 'Email',
    val: `${employee.name.split(' ')[0].toLowerCase()}@personio.de`
  }, {
    label: 'Location',
    val: 'Berlin, Germany'
  }, {
    label: 'Contract',
    val: 'Full-time'
  }, {
    label: 'Manager',
    val: 'Maria Hoffmann'
  }].map(f => /*#__PURE__*/React.createElement("div", {
    key: f.label,
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 10,
      color: C.fg3,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, f.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 13,
      fontWeight: 500,
      color: C.fg,
      marginTop: 2
    }
  }, f.val)))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      borderRadius: 10,
      padding: '18px 20px',
      border: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      fontWeight: 600,
      color: C.fg,
      marginBottom: 14
    }
  }, "Time off balance"), [{
    label: 'Annual leave',
    used: 8,
    total: 25,
    color: C.accent
  }, {
    label: 'Sick days',
    used: 2,
    total: 10,
    color: '#1359EC'
  }, {
    label: 'Remote work',
    used: 12,
    total: 30,
    color: '#33CC7B'
  }].map(t => /*#__PURE__*/React.createElement("div", {
    key: t.label,
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg2
    }
  }, t.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 11,
      color: C.fg3
    }
  }, t.used, "/", t.total, " days")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 9999,
      background: C.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 9999,
      background: t.color,
      width: `${t.used / t.total * 100}%`
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: C.bg,
      borderRadius: 10,
      padding: '18px 20px',
      border: `1px solid ${C.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      fontWeight: 600,
      color: C.fg,
      marginBottom: 14
    }
  }, "Quick actions"), ['Request time off', 'Upload document', 'Schedule 1:1', 'Send message'].map(a => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: `1px solid ${C.border}`,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 12,
      color: C.fg
    }
  }, a), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 13,
    color: C.fg3
  }))))));
};

// ── RECRUITING SCREEN ──
const JOBS = [{
  id: 1,
  title: 'Senior Product Designer',
  dept: 'Design',
  candidates: 14,
  stage: 'Interview',
  days: 12
}, {
  id: 2,
  title: 'Staff Engineer, Backend',
  dept: 'Engineering',
  candidates: 28,
  stage: 'Offer',
  days: 34
}, {
  id: 3,
  title: 'People Operations Manager',
  dept: 'HR',
  candidates: 9,
  stage: 'Screening',
  days: 7
}, {
  id: 4,
  title: 'Enterprise Account Executive',
  dept: 'Sales',
  candidates: 21,
  stage: 'Assessment',
  days: 19
}, {
  id: 5,
  title: 'Data Engineer',
  dept: 'Analytics',
  candidates: 16,
  stage: 'Interview',
  days: 22
}];
const STAGES = ['Sourcing', 'Screening', 'Assessment', 'Interview', 'Offer', 'Hired'];
const RecruitingScreen = () => /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    overflow: 'auto',
    padding: '20px 24px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 10,
    marginBottom: 20
  }
}, [{
  label: 'Open roles',
  val: '18'
}, {
  label: 'Active candidates',
  val: '88'
}, {
  label: 'Avg. time to hire',
  val: '24d'
}, {
  label: 'Offers sent',
  val: '5'
}].map(k => /*#__PURE__*/React.createElement("div", {
  key: k.label,
  style: {
    background: C.bg,
    borderRadius: 10,
    padding: '14px 18px',
    flex: 1,
    border: `1px solid ${C.border}`
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: C.fg
  }
}, k.val), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: C.fg2,
    marginTop: 2
  }
}, k.label)))), /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.bg,
    borderRadius: 12,
    border: `1px solid ${C.border}`,
    overflow: 'hidden'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: `1px solid ${C.border}`,
    background: C.surface
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 600,
    color: C.fg
  }
}, "Open positions"), /*#__PURE__*/React.createElement(Button, {
  label: "New job posting",
  icon: "plus",
  size: "sm"
})), JOBS.map((job, i) => /*#__PURE__*/React.createElement("div", {
  key: job.id,
  style: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 80px 1.5fr 70px 30px',
    gap: '0 16px',
    padding: '14px 18px',
    alignItems: 'center',
    borderBottom: i < JOBS.length - 1 ? `1px solid ${C.border}` : 'none',
    cursor: 'pointer',
    transition: 'background 0.1s'
  },
  onMouseEnter: e => e.currentTarget.style.background = C.surface,
  onMouseLeave: e => e.currentTarget.style.background = 'transparent'
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: 500,
    color: C.fg
  }
}, job.title), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: C.fg3,
    marginTop: 2
  }
}, job.dept)), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "users",
  size: 12,
  color: C.fg3
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    color: C.fg2
  }
}, job.candidates, " candidates")), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: C.fg3
  }
}, job.days, "d open"), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    gap: 3,
    alignItems: 'center'
  }
}, STAGES.map(s => /*#__PURE__*/React.createElement("div", {
  key: s,
  title: s,
  style: {
    flex: 1,
    height: 4,
    borderRadius: 9999,
    background: STAGES.indexOf(s) <= STAGES.indexOf(job.stage) ? C.accent : C.border
  }
}))), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: C.accent,
    fontWeight: 500
  }
}, job.stage), /*#__PURE__*/React.createElement(Icon, {
  name: "chevronRight",
  size: 14,
  color: C.fg3
})))));

// ── HOME / DASHBOARD SCREEN ──
const HomeScreen = ({
  onNav
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    overflow: 'auto',
    padding: '20px 24px'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    marginBottom: 20
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: C.fg
  }
}, "Good morning, Maria \uD83D\uDC4B"), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 13,
    color: C.fg2,
    marginTop: 3
  }
}, "Here's what needs your attention today.")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 340px',
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.bg,
    borderRadius: 12,
    padding: '18px 20px',
    border: `1px solid ${C.border}`
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 600,
    color: C.fg,
    marginBottom: 14,
    display: 'flex',
    justifyContent: 'space-between'
  }
}, /*#__PURE__*/React.createElement("span", null, "Your tasks"), /*#__PURE__*/React.createElement("span", {
  style: {
    color: C.fg3,
    fontWeight: 400
  }
}, "4 remaining")), [{
  done: true,
  text: 'Review Sara Jensen\'s onboarding docs',
  time: 'Done'
}, {
  done: false,
  text: 'Approve 3 time-off requests',
  time: 'Today'
}, {
  done: false,
  text: 'Complete Q1 performance reviews',
  time: 'Due Fri'
}, {
  done: false,
  text: 'Update payroll for March',
  time: 'Due Mon'
}].map((t, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
    cursor: 'pointer'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    width: 16,
    height: 16,
    borderRadius: 4,
    flexShrink: 0,
    border: t.done ? 'none' : `1.5px solid ${C.border}`,
    background: t.done ? C.accent : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}, t.done && /*#__PURE__*/React.createElement(Icon, {
  name: "check",
  size: 10,
  color: "#fff"
})), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 13,
    color: t.done ? C.fg3 : C.fg,
    textDecoration: t.done ? 'line-through' : 'none',
    flex: 1
  }
}, t.text), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: t.done ? C.fg3 : C.accent
  }
}, t.time)))), /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.bg,
    borderRadius: 12,
    padding: '18px 20px',
    border: `1px solid ${C.border}`
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 600,
    color: C.fg,
    marginBottom: 14
  }
}, "Recent activity"), [{
  who: 'AK',
  name: 'Alex Kim',
  bg: '#EDD6F5',
  fg: '#531A66',
  action: 'uploaded a document',
  time: '10m ago'
}, {
  who: 'SJ',
  name: 'Sara Jensen',
  bg: '#D5F4F6',
  fg: '#09282A',
  action: 'completed onboarding step',
  time: '1h ago'
}, {
  who: 'LP',
  name: 'Lena Park',
  bg: '#FFD6CC',
  fg: '#801A00',
  action: 'requested 3 days off',
  time: '2h ago'
}].map((a, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  }
}, /*#__PURE__*/React.createElement(Avatar, {
  initials: a.who,
  bg: a.bg,
  color: a.fg,
  size: 26
}), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 500,
    color: C.fg
  }
}, a.name), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    color: C.fg2
  }
}, " ", a.action)), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 10,
    color: C.fg3
  }
}, a.time))))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.bg,
    borderRadius: 12,
    padding: '18px 20px',
    border: `1px solid ${C.border}`
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 600,
    color: C.fg,
    marginBottom: 14
  }
}, "Headcount by department"), [{
  dept: 'Engineering',
  count: 84,
  pct: 34
}, {
  dept: 'Sales',
  count: 52,
  pct: 21
}, {
  dept: 'Marketing',
  count: 38,
  pct: 15
}, {
  dept: 'HR / People',
  count: 24,
  pct: 10
}, {
  dept: 'Finance',
  count: 20,
  pct: 8
}, {
  dept: 'Design',
  count: 18,
  pct: 7
}, {
  dept: 'Other',
  count: 11,
  pct: 5
}].map((d, i) => {
  const colors = [C.accent, '#1359EC', '#33CC7B', '#FF9500', '#40CFD3', '#FF3700', '#9E9E9C'];
  return /*#__PURE__*/React.createElement("div", {
    key: d.dept,
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 11,
      color: C.fg2
    }
  }, d.dept), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: FONT,
      fontSize: 11,
      color: C.fg3
    }
  }, d.count)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 9999,
      background: C.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 9999,
      background: colors[i],
      width: `${d.pct}%`
    }
  })));
})), /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.bg,
    borderRadius: 12,
    padding: '18px 20px',
    border: `1px solid ${C.border}`
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 600,
    color: C.fg,
    marginBottom: 14
  }
}, "Upcoming"), [{
  date: 'Today',
  event: 'All-hands meeting',
  time: '14:00'
}, {
  date: 'Thu',
  event: 'New hire starts: Sara Jensen',
  time: 'All day'
}, {
  date: 'Fri',
  event: 'Performance reviews due',
  time: 'EOD'
}].map((e, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    display: 'flex',
    gap: 12,
    marginBottom: 10,
    alignItems: 'flex-start'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.accentSubtle,
    borderRadius: 6,
    padding: '4px 8px',
    textAlign: 'center',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 9,
    fontWeight: 600,
    color: C.accent,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }
}, e.date)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 500,
    color: C.fg
  }
}, e.event), /*#__PURE__*/React.createElement("div", {
  style: {
    fontFamily: FONT,
    fontSize: 11,
    color: C.fg3
  }
}, e.time)))))), /*#__PURE__*/React.createElement("div", {
  style: {
    background: C.darkest,
    borderRadius: 12,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    minHeight: 380
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "sparkle",
  size: 14,
  color: C.accent
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff'
  }
}, "Personio AI"), /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 10,
    color: C.accent,
    background: 'rgba(165,51,204,0.2)',
    borderRadius: 4,
    padding: '1px 6px'
  }
}, "Beta")), [{
  role: 'ai',
  text: 'You have 3 pending time-off requests that need approval. Would you like me to summarize them?'
}, {
  role: 'user',
  text: 'Yes, please summarize.'
}, {
  role: 'ai',
  text: 'Lena Park: 3 days (Apr 7–9). Tom Weber: 1 day (Apr 11). Marco Rossi: 5 days (Apr 14–18, annual leave). All have sufficient balance.'
}].map((m, i) => /*#__PURE__*/React.createElement("div", {
  key: i,
  style: {
    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '85%',
    background: m.role === 'ai' ? 'rgba(255,255,255,0.06)' : 'rgba(165,51,204,0.25)',
    borderRadius: m.role === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
    padding: '10px 13px'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    color: m.role === 'ai' ? 'rgba(255,255,255,0.85)' : '#fff',
    lineHeight: 1.45
  }
}, m.text))), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 'auto',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 9999,
    padding: '8px 8px 8px 14px'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: FONT,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    flex: 1
  }
}, "Ask anything\u2026"), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: C.success,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "arrowUp",
  size: 14,
  color: "#fff"
}))))));
Object.assign(window, {
  PeopleScreen,
  ProfileScreen,
  RecruitingScreen,
  HomeScreen,
  EMPLOYEES
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/components/Screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/components/Shared.jsx
try { (() => {
// Personio HR Platform — Shared Components
// Load with <script type="text/babel" src="components/Shared.jsx">

const FONT = `"FT Regola Neue", "Inter", system-ui, sans-serif`;

// ── Color tokens ──
const C = {
  bg: '#FFFFFF',
  surface: '#F5F5F4',
  border: '#E8E8E7',
  fg: '#141414',
  fg2: '#737370',
  fg3: '#9E9E9C',
  dark: '#262626',
  darkest: '#141414',
  accent: '#A533CC',
  accentHover: '#8821AB',
  accentSubtle: '#EDD6F5',
  teal: '#11494B',
  tealLight: '#D5F4F6',
  success: '#33CC7B',
  successSubtle: '#D6F5E4',
  warning: '#FF9500',
  warningSubtle: '#FFEACC',
  error: '#FF3700',
  errorSubtle: '#FFD6CC'
};

// ── Lucide-style SVG icons (stroke-based, 20×20) ──
const Icon = ({
  name,
  size = 16,
  color = 'currentColor',
  style = {}
}) => {
  const paths = {
    users: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "9",
      cy: "7",
      r: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M23 21v-2a4 4 0 0 0-3-3.87"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 3.13a4 4 0 0 1 0 7.75"
    })),
    briefcase: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "2",
      y: "7",
      width: "20",
      height: "14",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
    })),
    chart: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "18",
      y1: "20",
      x2: "18",
      y2: "10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "20",
      x2: "12",
      y2: "4"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "6",
      y1: "20",
      x2: "6",
      y2: "14"
    })),
    calendar: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
      x: "3",
      y: "4",
      width: "18",
      height: "18",
      rx: "2",
      ry: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "16",
      y1: "2",
      x2: "16",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "8",
      y1: "2",
      x2: "8",
      y2: "6"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "3",
      y1: "10",
      x2: "21",
      y2: "10"
    })),
    inbox: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polyline", {
      points: "22 12 16 12 14 15 10 15 8 12 2 12"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
    })),
    settings: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "3"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
    })),
    home: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "9 22 9 12 15 12 15 22"
    })),
    bell: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M13.73 21a2 2 0 0 1-3.46 0"
    })),
    search: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "11",
      cy: "11",
      r: "8"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "21",
      y1: "21",
      x2: "16.65",
      y2: "16.65"
    })),
    plus: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "5",
      x2: "12",
      y2: "19"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "5",
      y1: "12",
      x2: "19",
      y2: "12"
    })),
    chevronRight: /*#__PURE__*/React.createElement("polyline", {
      points: "9 18 15 12 9 6"
    }),
    chevronDown: /*#__PURE__*/React.createElement("polyline", {
      points: "6 9 12 15 18 9"
    }),
    check: /*#__PURE__*/React.createElement("polyline", {
      points: "20 6 9 12 4 9"
    }),
    star: /*#__PURE__*/React.createElement("polygon", {
      points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
    }),
    filter: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("polygon", {
      points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
    })),
    download: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "7 10 12 15 17 10"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "15",
      x2: "12",
      y2: "3"
    })),
    moreH: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
      cx: "12",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "19",
      cy: "12",
      r: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "5",
      cy: "12",
      r: "1"
    })),
    sparkle: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
    })),
    arrowUp: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
      x1: "12",
      y1: "19",
      x2: "12",
      y2: "5"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "5 12 12 5 19 12"
    }))
  };
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      display: 'inline-block',
      flexShrink: 0,
      ...style
    }
  }, paths[name]);
};

// ── Avatar ──
const Avatar = ({
  initials,
  bg = C.accentSubtle,
  color = C.accent,
  size = 30,
  img
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: size,
    height: size,
    borderRadius: '50%',
    background: bg,
    color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.36,
    fontWeight: 600,
    flexShrink: 0,
    fontFamily: FONT,
    overflow: 'hidden'
  }
}, img ? /*#__PURE__*/React.createElement("img", {
  src: img,
  width: size,
  height: size,
  style: {
    objectFit: 'cover'
  }
}) : initials);

// ── Badge ──
const Badge = ({
  label,
  variant = 'neutral'
}) => {
  const styles = {
    active: {
      bg: C.successSubtle,
      color: '#1A663C'
    },
    onboarding: {
      bg: C.warningSubtle,
      color: '#804B00'
    },
    pending: {
      bg: C.warningSubtle,
      color: '#804B00'
    },
    offboarded: {
      bg: C.errorSubtle,
      color: '#801A00'
    },
    neutral: {
      bg: '#E6E6E5',
      color: '#404040'
    },
    accent: {
      bg: C.accentSubtle,
      color: '#531A66'
    },
    info: {
      bg: '#A1BCF7',
      color: '#061B47'
    }
  };
  const s = styles[variant] || styles.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      borderRadius: 6,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 500,
      fontFamily: FONT,
      background: s.bg,
      color: s.color,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: s.color,
      flexShrink: 0
    }
  }), label);
};

// ── Button ──
const Button = ({
  label,
  variant = 'primary',
  icon,
  size = 'md',
  onClick,
  style: extraStyle = {}
}) => {
  const [hovered, setHovered] = React.useState(false);
  const sizes = {
    sm: {
      fs: 12,
      px: 12,
      py: 6
    },
    md: {
      fs: 13,
      px: 16,
      py: 8
    },
    lg: {
      fs: 15,
      px: 20,
      py: 11
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      bg: hovered ? C.accentHover : C.accent,
      color: '#fff',
      border: 'none'
    },
    secondary: {
      bg: hovered ? '#F0F0EF' : C.bg,
      color: C.fg,
      border: `1px solid ${C.border}`
    },
    ghost: {
      bg: 'transparent',
      color: C.accent,
      border: `1px solid ${C.accent}`
    },
    dark: {
      bg: hovered ? '#1a1a1a' : C.darkest,
      color: '#fff',
      border: 'none'
    }
  };
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      background: v.bg,
      color: v.color,
      border: v.border,
      borderRadius: 7,
      padding: `${s.py}px ${s.px}px`,
      fontSize: s.fs,
      fontWeight: 500,
      fontFamily: FONT,
      cursor: 'pointer',
      transition: 'background 0.15s',
      ...extraStyle
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: s.fs + 2,
    color: v.color
  }), label);
};

// Export all to window
Object.assign(window, {
  Icon,
  Avatar,
  Badge,
  Button,
  C,
  FONT
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/components/Shared.jsx", error: String((e && e.message) || e) }); }

})();
