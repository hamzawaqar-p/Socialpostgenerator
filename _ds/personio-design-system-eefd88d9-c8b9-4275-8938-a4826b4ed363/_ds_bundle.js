/* @ds-bundle: {"format":4,"namespace":"PersonioDesignSystem_eefd88","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"AvatarStack","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"ICON_NAMES","sourcePath":"components/core/Icon.jsx"},{"name":"KpiCard","sourcePath":"components/core/KpiCard.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Field","sourcePath":"components/forms/Input.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"}],"sourceHashes":{"brand/deck-stage.js":"522102a1c71e","components/core/Avatar.jsx":"961b94901e28","components/core/Badge.jsx":"03e41255bd73","components/core/Button.jsx":"b296f1427e91","components/core/Card.jsx":"6138fbcdef6c","components/core/Icon.jsx":"1c751d9ec041","components/core/KpiCard.jsx":"32e1069ed45c","components/core/Tag.jsx":"fe5f43459629","components/forms/Input.jsx":"99c8d5a3d6d4","components/forms/Select.jsx":"b0437f74b028","components/forms/Switch.jsx":"6ce320685db4","components/forms/Textarea.jsx":"7d734f0581ad","ui_kits/web-app/Chrome.jsx":"89bf208b8d2d","ui_kits/web-app/HomeScreen.jsx":"75d468518402","ui_kits/web-app/LoginScreen.jsx":"8c3eef9a9b8f","ui_kits/web-app/PeopleScreen.jsx":"884286f44c19","ui_kits/web-app/ProfileScreen.jsx":"bea1cf9cacac","ui_kits/web-app/RecruitingScreen.jsx":"59fe9fe0b67a","ui_kits/web-app/data.jsx":"e588004904df"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PersonioDesignSystem_eefd88 = window.PersonioDesignSystem_eefd88 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// brand/deck-stage.js
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
})(); } catch (e) { __ds_ns.__errors.push({ path: "brand/deck-stage.js", error: String((e && e.message) || e) }); }

// components/core/Avatar.jsx
try { (() => {
const TINTS = [{
  background: 'var(--lavender-10)',
  color: 'var(--lavender-80)'
}, {
  background: 'var(--water-10)',
  color: 'var(--water-90)'
}, {
  background: 'var(--forest-10)',
  color: 'var(--forest-80)'
}, {
  background: 'var(--flame-10)',
  color: 'var(--flame-80)'
}, {
  background: 'var(--marigold-10)',
  color: 'var(--marigold-80)'
}, {
  background: 'var(--grey-10)',
  color: 'var(--grey-80)'
}];
function Avatar({
  initials = '',
  src,
  size = 32,
  tone,
  style
}) {
  const idx = tone != null ? tone % TINTS.length : initials.charCodeAt(0) % TINTS.length || 0;
  const t = TINTS[Number.isNaN(idx) ? 5 : idx];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
      fontSize: Math.round(size * 0.38),
      fontWeight: 600,
      background: t.background,
      color: t.color,
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    width: size,
    height: size,
    style: {
      objectFit: 'cover'
    }
  }) : initials);
}
function AvatarStack({
  people = [],
  size = 32,
  max = 4,
  style
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      ...style
    }
  }, shown.map((p, i) => /*#__PURE__*/React.createElement(Avatar, {
    key: i,
    initials: p.initials,
    src: p.src,
    size: size,
    tone: i,
    style: {
      marginLeft: i === 0 ? 0 : -size * 0.25,
      border: '2px solid var(--color-bg)'
    }
  })), rest > 0 && /*#__PURE__*/React.createElement(Avatar, {
    initials: `+${rest}`,
    size: size,
    tone: 5,
    style: {
      marginLeft: -size * 0.25,
      border: '2px solid var(--color-bg)'
    }
  }));
}
Object.assign(__ds_scope, { Avatar, AvatarStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const TONES = {
  neutral: {
    background: 'var(--grey-10)',
    color: 'var(--grey-80)',
    dot: 'var(--grey-50)'
  },
  accent: {
    background: 'var(--color-accent-subtle)',
    color: 'var(--color-accent-deep)',
    dot: 'var(--color-accent)'
  },
  success: {
    background: 'var(--color-success-subtle)',
    color: 'var(--color-success-fg)',
    dot: 'var(--color-success)'
  },
  warning: {
    background: 'var(--color-warning-subtle)',
    color: 'var(--color-warning-fg)',
    dot: 'var(--color-warning)'
  },
  error: {
    background: 'var(--color-error-subtle)',
    color: 'var(--color-error-fg)',
    dot: 'var(--color-error)'
  },
  info: {
    background: 'var(--color-info-subtle)',
    color: 'var(--color-info-fg)',
    dot: 'var(--color-info)'
  }
};
function Badge({
  children,
  tone = 'neutral',
  dot = false,
  style
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      borderRadius: 6,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 500,
      background: t.background,
      color: t.color,
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: t.dot,
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
const TONES = {
  white: {
    background: 'var(--color-bg)',
    color: 'var(--color-fg)',
    shadow: 'var(--shadow-sm)'
  },
  subtle: {
    background: 'var(--color-bg-subtle)',
    color: 'var(--color-fg)',
    shadow: 'none'
  },
  accent: {
    background: 'var(--color-bg-lavender)',
    color: 'var(--color-accent-deep)',
    shadow: 'none'
  },
  teal: {
    background: 'var(--color-bg-teal)',
    color: 'var(--water-90)',
    shadow: 'none'
  },
  dark: {
    background: 'var(--color-bg-dark)',
    color: 'var(--color-fg-inverted)',
    shadow: 'none'
  }
};
function Card({
  children,
  tone = 'white',
  radius = 12,
  padding = '18px 20px',
  bordered = false,
  style
}) {
  const t = TONES[tone] || TONES.white;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: t.background,
      color: t.color,
      borderRadius: radius,
      padding,
      boxShadow: t.shadow,
      border: bordered ? '1px solid var(--color-border)' : 'none',
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const PATHS = {
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
  chevronLeft: /*#__PURE__*/React.createElement("polyline", {
    points: "15 18 9 12 15 6"
  }),
  check: /*#__PURE__*/React.createElement("polyline", {
    points: "20 6 9 17 4 12"
  }),
  x: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "18",
    y1: "6",
    x2: "6",
    y2: "18"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "6",
    y1: "6",
    x2: "18",
    y2: "18"
  })),
  star: /*#__PURE__*/React.createElement("polygon", {
    points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
  }),
  filter: /*#__PURE__*/React.createElement("polygon", {
    points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
  }),
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
  sparkle: /*#__PURE__*/React.createElement("path", {
    d: "M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
  }),
  arrowUp: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "12",
    y1: "19",
    x2: "12",
    y2: "5"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "5 12 12 5 19 12"
  })),
  arrowRight: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("line", {
    x1: "5",
    y1: "12",
    x2: "19",
    y2: "12"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 5 19 12 12 19"
  })),
  mail: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "4",
    width: "20",
    height: "16",
    rx: "2"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "22 6 12 13 2 6"
  })),
  clock: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "12 7 12 12 16 14"
  })),
  file: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
    d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
  }), /*#__PURE__*/React.createElement("polyline", {
    points: "14 2 14 8 20 8"
  }))
};
function Icon({
  name,
  size = 16,
  color = 'currentColor',
  strokeWidth = 1.8,
  style
}) {
  const fill = name === 'star' || name === 'filter' || name === 'sparkle' ? color : 'none';
  return /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: fill,
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: 'inline-block',
      flexShrink: 0,
      ...style
    }
  }, PATHS[name] || null);
}
const ICON_NAMES = Object.keys(PATHS);
Object.assign(__ds_scope, { Icon, ICON_NAMES });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const SIZES = {
  sm: {
    fs: 12,
    px: 12,
    py: 6,
    r: 6
  },
  md: {
    fs: 14,
    px: 18,
    py: 10,
    r: 8
  },
  lg: {
    fs: 16,
    px: 24,
    py: 14,
    r: 10
  }
};
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  pill = false,
  disabled = false,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const variants = {
    primary: {
      background: hover ? 'var(--color-accent-hover)' : 'var(--color-accent)',
      color: 'var(--color-fg-on-accent)',
      border: '1px solid transparent'
    },
    secondary: {
      background: hover ? '#F0F0EF' : 'var(--color-bg)',
      color: 'var(--color-fg)',
      border: '1px solid var(--color-border)'
    },
    ghost: {
      background: hover ? 'var(--color-accent-subtle)' : 'transparent',
      color: 'var(--color-accent)',
      border: '1px solid var(--color-accent)'
    },
    dark: {
      background: hover ? '#262626' : 'var(--color-bg-darkest)',
      color: 'var(--color-fg-inverted)',
      border: '1px solid transparent'
    },
    danger: {
      background: hover ? '#FFC2B3' : 'var(--color-error-subtle)',
      color: 'var(--color-error-fg)',
      border: '1px solid transparent'
    }
  };
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      fontFamily: 'var(--font-sans)',
      fontWeight: 500,
      fontSize: s.fs,
      padding: `${s.py}px ${s.px}px`,
      borderRadius: pill ? 9999 : s.r,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--duration-base) var(--ease-standard)',
      ...v,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.fs + 2,
    color: v.color
  }), children, iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.fs + 2,
    color: v.color
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/KpiCard.jsx
try { (() => {
const FG = {
  white: {
    label: 'var(--color-fg-secondary)',
    value: 'var(--color-fg)'
  },
  subtle: {
    label: 'var(--color-fg-secondary)',
    value: 'var(--color-fg)'
  },
  accent: {
    label: 'var(--lavender-70)',
    value: 'var(--lavender-80)'
  },
  teal: {
    label: 'var(--water-70)',
    value: 'var(--water-90)'
  },
  dark: {
    label: 'rgba(255,255,255,0.5)',
    value: 'var(--color-fg-inverted)'
  }
};
function KpiCard({
  value,
  label,
  delta,
  direction = 'flat',
  tone = 'white',
  style
}) {
  const fg = FG[tone] || FG.white;
  const deltaColor = direction === 'up' ? tone === 'dark' ? 'var(--color-success)' : 'var(--forest-70)' : direction === 'down' ? 'var(--flame-80)' : fg.label;
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    tone: tone,
    radius: 12,
    style: {
      minWidth: 130,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1,
      marginBottom: 4,
      color: fg.value
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: fg.label
    }
  }, label), delta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      marginTop: 6,
      color: deltaColor
    }
  }, direction === 'up' ? '↑ ' : direction === 'down' ? '↓ ' : '', delta));
}
Object.assign(__ds_scope, { KpiCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/KpiCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
const TONES = {
  lavender: {
    background: 'var(--lavender-10)',
    color: 'var(--lavender-80)'
  },
  water: {
    background: 'var(--water-10)',
    color: 'var(--water-90)'
  },
  marigold: {
    background: 'var(--marigold-10)',
    color: 'var(--marigold-80)'
  },
  forest: {
    background: 'var(--forest-10)',
    color: 'var(--forest-80)'
  },
  terracotta: {
    background: 'var(--terracotta-10)',
    color: 'var(--terracotta-70)'
  },
  grey: {
    background: 'var(--grey-10)',
    color: 'var(--grey-80)'
  }
};
function Tag({
  children,
  tone = 'grey',
  style
}) {
  const t = TONES[tone] || TONES.grey;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      borderRadius: 9999,
      padding: '4px 10px',
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 500,
      background: t.background,
      color: t.color,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
const base = {
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  padding: '9px 12px',
  fontFamily: 'var(--font-sans)',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--color-fg)',
  outline: 'none',
  transition: 'border-color var(--duration-base) var(--ease-standard)'
};
function Field({
  label,
  hint,
  error,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--grey-70)'
    }
  }, label), children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      color: 'var(--flame-60)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      color: 'var(--color-fg-tertiary)'
    }
  }, hint) : null);
}
function Input({
  label,
  hint,
  error,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  width = 180,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  const bad = Boolean(error);
  return /*#__PURE__*/React.createElement(Field, {
    label: label,
    hint: hint,
    error: error,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...base,
      width,
      borderColor: bad ? 'var(--color-error)' : focus ? 'var(--color-accent)' : 'var(--color-border)',
      boxShadow: focus ? bad ? '0 0 0 3px rgba(255,55,0,0.12)' : 'var(--shadow-focus)' : 'none',
      background: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg)'
    }
  }));
}
Object.assign(__ds_scope, { Field, Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  hint,
  error,
  options = [],
  value,
  onChange,
  disabled = false,
  width = 180,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width
    }
  }, /*#__PURE__*/React.createElement("select", {
    value: value,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      width: '100%',
      background: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
      border: `1px solid ${error ? 'var(--color-error)' : focus ? 'var(--color-accent)' : 'var(--color-border)'}`,
      boxShadow: focus && !error ? 'var(--shadow-focus)' : 'none',
      borderRadius: 8,
      padding: '9px 32px 9px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--color-fg)',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevronDown",
    size: 14,
    color: "var(--color-fg-secondary)",
    style: {
      position: 'absolute',
      right: 11,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 20,
      borderRadius: 9999,
      position: 'relative',
      flexShrink: 0,
      background: checked ? 'var(--color-accent)' : 'var(--color-border)',
      transition: 'background var(--duration-slow) var(--ease-standard)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: '#fff',
      top: 3,
      left: checked ? 19 : 3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      transition: 'left var(--duration-slow) var(--ease-standard)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--color-fg)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function Textarea({
  label,
  hint,
  error,
  placeholder,
  value,
  onChange,
  rows = 3,
  disabled = false,
  width = 220,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    hint: hint,
    error: error,
    style: style
  }, /*#__PURE__*/React.createElement("textarea", {
    rows: rows,
    placeholder: placeholder,
    value: value,
    disabled: disabled,
    onChange: e => onChange && onChange(e.target.value),
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width,
      resize: 'none',
      background: disabled ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
      border: `1px solid ${error ? 'var(--color-error)' : focus ? 'var(--color-accent)' : 'var(--color-border)'}`,
      boxShadow: focus && !error ? 'var(--shadow-focus)' : 'none',
      borderRadius: 8,
      padding: '9px 12px',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      fontWeight: 500,
      color: 'var(--color-fg)',
      outline: 'none'
    }
  }));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/Chrome.jsx
try { (() => {
// Sidebar + top bar chrome for the Personio HR Platform.
const {
  Icon,
  Avatar,
  Button
} = window.PersonioDesignSystem_eefd88;
const Sidebar = ({
  active,
  onNav
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: 220,
    flexShrink: 0,
    background: 'var(--color-bg-darkest)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    paddingBottom: 16
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
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  }
}, NAV_ITEMS.map(item => {
  const on = active === item.id;
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
      background: on ? 'rgba(165,51,204,0.18)' : 'transparent',
      transition: 'background var(--duration-fast)'
    },
    onMouseEnter: e => {
      if (!on) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
    },
    onMouseLeave: e => {
      if (!on) e.currentTarget.style.background = 'transparent';
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: item.icon,
    size: 16,
    color: on ? 'var(--color-accent)' : 'rgba(255,255,255,0.45)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: on ? 600 : 400,
      color: on ? '#fff' : 'rgba(255,255,255,0.55)',
      flex: 1
    }
  }, item.label), item.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'var(--color-accent)',
      color: '#fff',
      borderRadius: 9999,
      fontSize: 10,
      fontWeight: 600,
      padding: '1px 6px'
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
    borderRadius: 7,
    cursor: 'pointer'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "settings",
  size: 16,
  color: "rgba(255,255,255,0.4)"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)'
  }
}, "Settings")), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: 4
  }
}, /*#__PURE__*/React.createElement(Avatar, {
  initials: "MH",
  size: 28,
  tone: 0
}), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 12,
    fontWeight: 500,
    color: '#fff'
  }
}, "Maria H."), /*#__PURE__*/React.createElement("div", {
  style: {
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
    background: 'var(--color-bg)',
    borderBottom: '1px solid var(--color-border)',
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
    fontSize: 15,
    fontWeight: 600
  }
}, title), subtitle && /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: 'var(--color-fg-secondary)',
    marginTop: 1
  }
}, subtitle)), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--color-bg-subtle)',
    border: '1px solid var(--color-border)',
    borderRadius: 7,
    padding: '6px 12px',
    width: 200
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "search",
  size: 14,
  color: "var(--color-fg-tertiary)"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: 'var(--color-fg-tertiary)'
  }
}, "Search\u2026")), /*#__PURE__*/React.createElement("div", {
  style: {
    position: 'relative',
    cursor: 'pointer'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "bell",
  size: 18,
  color: "var(--color-fg-secondary)"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 8,
    height: 8,
    background: 'var(--color-accent)',
    borderRadius: '50%',
    border: '1.5px solid var(--color-bg)'
  }
})), actions, /*#__PURE__*/React.createElement(Avatar, {
  initials: "MH",
  size: 30,
  tone: 0
}));
Object.assign(window, {
  Sidebar,
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/HomeScreen.jsx
try { (() => {
// Home / dashboard — tasks, activity, headcount, upcoming, AI panel.
const {
  Icon,
  Avatar,
  Card,
  Badge
} = window.PersonioDesignSystem_eefd88;
const Panel = ({
  title,
  aside,
  children,
  style
}) => /*#__PURE__*/React.createElement(Card, {
  tone: "white",
  radius: 12,
  bordered: true,
  style: {
    boxShadow: 'none',
    ...style
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 14
  }
}, /*#__PURE__*/React.createElement("span", null, title), aside && /*#__PURE__*/React.createElement("span", {
  style: {
    color: 'var(--color-fg-tertiary)',
    fontWeight: 400
  }
}, aside)), children);
const TASKS = [{
  done: true,
  text: "Review Sara Jensen's onboarding docs",
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
}];
const DEPTS = [{
  dept: 'Engineering',
  count: 84,
  pct: 34,
  color: 'var(--color-accent)'
}, {
  dept: 'Sales',
  count: 52,
  pct: 21,
  color: 'var(--sky-50)'
}, {
  dept: 'Marketing',
  count: 38,
  pct: 15,
  color: 'var(--forest-50)'
}, {
  dept: 'HR / People',
  count: 24,
  pct: 10,
  color: 'var(--marigold-50)'
}, {
  dept: 'Finance',
  count: 20,
  pct: 8,
  color: 'var(--water-50)'
}, {
  dept: 'Design',
  count: 18,
  pct: 7,
  color: 'var(--flame-50)'
}, {
  dept: 'Other',
  count: 11,
  pct: 5,
  color: 'var(--color-fg-tertiary)'
}];
const HomeScreen = () => {
  const [tasks, setTasks] = React.useState(TASKS);
  const toggle = i => setTasks(t => t.map((x, k) => k === i ? {
    ...x,
    done: !x.done
  } : x));
  const left = tasks.filter(t => !t.done).length;
  return /*#__PURE__*/React.createElement("div", {
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
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, "Good morning, Maria"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-fg-secondary)',
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
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Your tasks",
    aside: `${left} remaining`
  }, tasks.map((t, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => toggle(i),
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
      border: t.done ? 'none' : '1.5px solid var(--color-border)',
      background: t.done ? 'var(--color-accent)' : 'transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, t.done && /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 10,
    color: "#fff",
    strokeWidth: 2.4
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      flex: 1,
      color: t.done ? 'var(--color-fg-tertiary)' : 'var(--color-fg)',
      textDecoration: t.done ? 'line-through' : 'none'
    }
  }, t.text), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: t.done ? 'var(--color-fg-tertiary)' : 'var(--color-accent)'
    }
  }, t.time)))), /*#__PURE__*/React.createElement(Panel, {
    title: "Recent activity"
  }, [['AK', 'Alex Kim', 'uploaded a document', '10m ago'], ['SJ', 'Sara Jensen', 'completed onboarding step', '1h ago'], ['LP', 'Lena Park', 'requested 3 days off', '2h ago']].map(([ini, name, action, time], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: ini,
    size: 26
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500
    }
  }, name), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-fg-secondary)'
    }
  }, " ", action)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--color-fg-tertiary)'
    }
  }, time))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Headcount by department"
  }, DEPTS.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.dept,
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 3,
      fontSize: 11
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-fg-secondary)'
    }
  }, d.dept), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-fg-tertiary)'
    }
  }, d.count)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 4,
      borderRadius: 9999,
      background: 'var(--color-bg-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 9999,
      background: d.color,
      width: `${d.pct}%`
    }
  }))))), /*#__PURE__*/React.createElement(Panel, {
    title: "Upcoming"
  }, [['Today', 'All-hands meeting', '14:00'], ['Thu', 'New hire starts: Sara Jensen', 'All day'], ['Fri', 'Performance reviews due', 'EOD']].map(([date, event, time], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      marginBottom: 10,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-accent-subtle)',
      borderRadius: 6,
      padding: '4px 8px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      fontWeight: 600,
      color: 'var(--color-accent)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, date)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 500
    }
  }, event), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: 'var(--color-fg-tertiary)'
    }
  }, time)))))), /*#__PURE__*/React.createElement(AiPanel, null)));
};
const AiPanel = () => {
  const [msgs, setMsgs] = React.useState([{
    role: 'ai',
    text: 'You have 3 pending time-off requests that need approval. Would you like me to summarize them?'
  }, {
    role: 'user',
    text: 'Yes, please summarize.'
  }, {
    role: 'ai',
    text: 'Lena Park: 3 days (Apr 7–9). Tom Weber: 1 day (Apr 11). Marco Rossi: 5 days (Apr 14–18, annual leave). All have sufficient balance.'
  }]);
  const [draft, setDraft] = React.useState('');
  const send = () => {
    if (!draft.trim()) return;
    setMsgs(m => [...m, {
      role: 'user',
      text: draft
    }, {
      role: 'ai',
      text: 'Drafting that now — I will add it to your approvals queue.'
    }]);
    setDraft('');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-bg-darkest)',
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
    color: "var(--color-accent)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: '#fff'
    }
  }, "Personio AI"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: 'var(--lavender-30)',
      background: 'rgba(165,51,204,0.25)',
      borderRadius: 4,
      padding: '1px 6px'
    }
  }, "Beta")), msgs.map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
      maxWidth: '85%',
      background: m.role === 'ai' ? 'rgba(255,255,255,0.06)' : 'rgba(165,51,204,0.3)',
      borderRadius: m.role === 'ai' ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
      padding: '10px 13px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
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
  }, /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    onKeyDown: e => e.key === 'Enter' && send(),
    placeholder: "Ask anything\u2026",
    style: {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: '#fff'
    }
  }), /*#__PURE__*/React.createElement("div", {
    onClick: send,
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'var(--color-success)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrowUp",
    size: 14,
    color: "#fff"
  }))));
};
Object.assign(window, {
  HomeScreen,
  Panel
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/LoginScreen.jsx
try { (() => {
// Sign-in screen — Sunset Bloom brand panel beside the form.
const {
  Button,
  Input,
  Icon
} = window.PersonioDesignSystem_eefd88;
const LoginScreen = ({
  onSignIn
}) => {
  const [email, setEmail] = React.useState('maria.hoffmann@personio.de');
  const [pw, setPw] = React.useState('••••••••••');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      background: 'var(--color-bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 72px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logomark.svg",
    height: "26",
    alt: "Personio",
    style: {
      alignSelf: 'flex-start',
      marginBottom: 48
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 34,
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1.05
    }
  }, "Welcome back"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--color-fg-secondary)',
      marginTop: 8
    }
  }, "Sign in to your Personio workspace."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      marginTop: 32,
      maxWidth: 320
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    value: email,
    onChange: setEmail,
    width: "100%"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    value: pw,
    onChange: setPw,
    width: "100%"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    onClick: onSignIn,
    style: {
      marginTop: 6
    }
  }, "Sign in"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 12
    }
  }, "Forgot your password?"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--color-bg-sunset)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -160,
      bottom: -160,
      width: 640,
      height: 640,
      borderRadius: '50%',
      background: 'radial-gradient(circle,#FF3700 0%,#FF8766 30%,#A533CC 60%,transparent 78%)',
      opacity: 0.7,
      filter: 'blur(40px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      color: 'rgba(200,80,40,0.4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "halftone"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      maxWidth: 420
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      fontWeight: 800,
      letterSpacing: '-0.04em',
      lineHeight: 0.98,
      color: '#fff',
      textWrap: 'pretty'
    }
  }, "Serve people, not processes"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.65)',
      marginTop: 16
    }
  }, "The Intelligent HR Platform"))));
};
Object.assign(window, {
  LoginScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/PeopleScreen.jsx
try { (() => {
// People list — KPI strip, department filter pills, employee table.
const {
  Icon,
  Avatar,
  Badge,
  Button,
  KpiCard
} = window.PersonioDesignSystem_eefd88;
const COLS = '2fr 1.5fr 1fr 1fr 1fr 40px';
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
  }, /*#__PURE__*/React.createElement(KpiCard, {
    value: "247",
    label: "Total employees",
    delta: "12 this month",
    direction: "up",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(KpiCard, {
    value: "231",
    label: "Active",
    delta: "93.5%",
    direction: "up",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(KpiCard, {
    value: "8",
    label: "Onboarding",
    delta: "3 new this week",
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(KpiCard, {
    value: "18",
    label: "Open roles",
    delta: "5 in final round",
    style: {
      flex: 1
    }
  })), /*#__PURE__*/React.createElement("div", {
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
      border: `1px solid ${filter === d ? 'var(--color-accent)' : 'var(--color-border)'}`,
      background: filter === d ? 'var(--color-accent-subtle)' : 'var(--color-bg)',
      color: filter === d ? 'var(--color-accent)' : 'var(--color-fg-secondary)',
      borderRadius: 9999,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: 500,
      fontFamily: 'var(--font-sans)',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, d === 'all' ? 'All employees' : d))), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    icon: "plus"
  }, "Add employee"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    icon: "filter"
  }, "Filter"), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    variant: "secondary",
    icon: "download"
  }, "Export")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 24px 24px',
      background: 'var(--color-bg)',
      borderRadius: 12,
      border: '1px solid var(--color-border)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: COLS,
      gap: '0 16px',
      padding: '10px 18px',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-bg-subtle)'
    }
  }, ['Employee', 'Role', 'Department', 'Start date', 'Status', ''].map((h, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--color-fg-tertiary)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, h))), shown.map((emp, i) => /*#__PURE__*/React.createElement("div", {
    key: emp.id,
    onClick: () => onSelect(emp),
    style: {
      display: 'grid',
      gridTemplateColumns: COLS,
      gap: '0 16px',
      padding: '12px 18px',
      alignItems: 'center',
      cursor: 'pointer',
      borderBottom: i < shown.length - 1 ? '1px solid var(--color-border)' : 'none'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--color-bg-subtle)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: emp.initials,
    size: 30
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, emp.name)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-fg-secondary)'
    }
  }, emp.role), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-fg-secondary)'
    }
  }, emp.dept), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--color-fg-secondary)'
    }
  }, emp.start), /*#__PURE__*/React.createElement(Badge, {
    tone: STATUS_TONE[emp.status],
    dot: true
  }, emp.status[0].toUpperCase() + emp.status.slice(1)), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 14,
    color: "var(--color-fg-tertiary)"
  })))));
};
Object.assign(window, {
  PeopleScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/PeopleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/ProfileScreen.jsx
try { (() => {
// Employee profile — header, tabs, overview panels.
const {
  Icon,
  Avatar,
  Badge,
  Button,
  Select,
  Switch
} = window.PersonioDesignSystem_eefd88;
const TABS = ['Overview', 'Documents', 'Time off', 'Performance', 'Payroll'];
const ProfileScreen = ({
  employee,
  onBack
}) => {
  const [tab, setTab] = React.useState('Overview');
  const [remote, setRemote] = React.useState(true);
  if (!employee) return null;
  const first = employee.name.split(' ')[0].toLowerCase();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-bg)',
      padding: '24px 24px 0',
      borderBottom: '1px solid var(--color-border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: 'var(--color-fg-tertiary)',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      marginBottom: 16,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "chevronLeft",
    size: 13,
    color: "var(--color-fg-tertiary)"
  }), " Back to people"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 18,
      paddingBottom: 20
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    initials: employee.initials,
    size: 64
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, employee.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--color-fg-secondary)',
      marginTop: 2
    }
  }, employee.role, " \xB7 ", employee.dept), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: STATUS_TONE[employee.status],
    dot: true
  }, employee.status[0].toUpperCase() + employee.status.slice(1)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--color-fg-tertiary)',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "calendar",
    size: 11,
    color: "var(--color-fg-tertiary)"
  }), " Joined ", employee.start))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm"
  }, "Edit profile"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    iconRight: "chevronDown"
  }, "Actions"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex'
    }
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => setTab(t),
    style: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: tab === t ? 600 : 400,
      color: tab === t ? 'var(--color-fg)' : 'var(--color-fg-secondary)',
      padding: '8px 16px',
      marginBottom: -1,
      borderBottom: `2px solid ${tab === t ? 'var(--color-accent)' : 'transparent'}`
    }
  }, t)))), tab === 'Overview' ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Personal info"
  }, [['Email', `${first}@personio.de`], ['Location', 'Berlin, Germany'], ['Contract', 'Full-time'], ['Manager', 'Maria Hoffmann']].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: 'var(--color-fg-tertiary)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }
  }, l), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      marginTop: 2
    }
  }, v))), /*#__PURE__*/React.createElement(Switch, {
    checked: remote,
    onChange: setRemote,
    label: "Remote-first contract",
    style: {
      marginTop: 4
    }
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Time off balance"
  }, [['Annual leave', 8, 25, 'var(--color-accent)'], ['Sick days', 2, 10, 'var(--sky-50)'], ['Remote work', 12, 30, 'var(--forest-50)']].map(([l, used, total, color]) => /*#__PURE__*/React.createElement("div", {
    key: l,
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
      fontSize: 12,
      color: 'var(--color-fg-secondary)'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--color-fg-tertiary)'
    }
  }, used, "/", total, " days")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      borderRadius: 9999,
      background: 'var(--color-bg-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      borderRadius: 9999,
      background: color,
      width: `${used / total * 100}%`
    }
  })))), /*#__PURE__*/React.createElement(Select, {
    label: "Absence type",
    options: ['Annual leave', 'Sick day', 'Remote work', 'Parental leave'],
    width: "100%"
  })), /*#__PURE__*/React.createElement(Panel, {
    title: "Quick actions"
  }, ['Request time off', 'Upload document', 'Schedule 1:1', 'Send message'].map(a => /*#__PURE__*/React.createElement("div", {
    key: a,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid var(--color-border)',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12
    }
  }, a), /*#__PURE__*/React.createElement(Icon, {
    name: "chevronRight",
    size: 13,
    color: "var(--color-fg-tertiary)"
  }))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '48px 24px',
      color: 'var(--color-fg-tertiary)',
      fontSize: 13
    }
  }, tab, " is not part of the supplied source material \u2014 intentionally left blank."));
};
Object.assign(window, {
  ProfileScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/RecruitingScreen.jsx
try { (() => {
// Recruiting — funnel KPIs and open positions with inline pipeline meters.
const {
  Icon,
  Button,
  Card,
  Tag
} = window.PersonioDesignSystem_eefd88;
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
}, [['Open roles', '18'], ['Active candidates', '88'], ['Avg. time to hire', '24d'], ['Offers sent', '5']].map(([label, val]) => /*#__PURE__*/React.createElement(Card, {
  key: label,
  tone: "white",
  bordered: true,
  radius: 10,
  padding: "14px 18px",
  style: {
    flex: 1,
    boxShadow: 'none'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: '-0.03em'
  }
}, val), /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 11,
    color: 'var(--color-fg-secondary)',
    marginTop: 2
  }
}, label)))), /*#__PURE__*/React.createElement("div", {
  style: {
    background: 'var(--color-bg)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    overflow: 'hidden'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-subtle)'
  }
}, /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    fontWeight: 600
  }
}, "Open positions"), /*#__PURE__*/React.createElement(Button, {
  size: "sm",
  icon: "plus"
}, "New job posting")), JOBS.map((job, i) => /*#__PURE__*/React.createElement("div", {
  key: job.id,
  style: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 80px 1.5fr 70px 30px',
    gap: '0 16px',
    padding: '14px 18px',
    alignItems: 'center',
    cursor: 'pointer',
    borderBottom: i < JOBS.length - 1 ? '1px solid var(--color-border)' : 'none'
  },
  onMouseEnter: e => e.currentTarget.style.background = 'var(--color-bg-subtle)',
  onMouseLeave: e => e.currentTarget.style.background = 'transparent'
}, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
  style: {
    fontSize: 13,
    fontWeight: 500
  }
}, job.title), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 4
  }
}, /*#__PURE__*/React.createElement(Tag, {
  tone: "lavender"
}, job.dept))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "users",
  size: 12,
  color: "var(--color-fg-tertiary)"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 12,
    color: 'var(--color-fg-secondary)'
  }
}, job.candidates, " candidates")), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 11,
    color: 'var(--color-fg-tertiary)'
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
    background: STAGES.indexOf(s) <= STAGES.indexOf(job.stage) ? 'var(--color-accent)' : 'var(--color-border)'
  }
}))), /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 11,
    color: 'var(--color-accent)',
    fontWeight: 500
  }
}, job.stage), /*#__PURE__*/React.createElement(Icon, {
  name: "chevronRight",
  size: 14,
  color: "var(--color-fg-tertiary)"
})))));
Object.assign(window, {
  RecruitingScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/RecruitingScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/web-app/data.jsx
try { (() => {
// Shared demo data for the Personio HR Platform UI kit.
const EMPLOYEES = [{
  id: 1,
  name: 'Alex Kim',
  initials: 'AK',
  role: 'Product Designer',
  dept: 'Design',
  status: 'active',
  start: 'Mar 2024'
}, {
  id: 2,
  name: 'Sara Jensen',
  initials: 'SJ',
  role: 'Software Engineer',
  dept: 'Engineering',
  status: 'onboarding',
  start: 'Jan 2025'
}, {
  id: 3,
  name: 'Marco Rossi',
  initials: 'MR',
  role: 'People Ops Lead',
  dept: 'HR',
  status: 'active',
  start: 'Aug 2022'
}, {
  id: 4,
  name: 'Lena Park',
  initials: 'LP',
  role: 'Account Executive',
  dept: 'Sales',
  status: 'active',
  start: 'Nov 2023'
}, {
  id: 5,
  name: 'Tom Weber',
  initials: 'TW',
  role: 'Data Analyst',
  dept: 'Analytics',
  status: 'active',
  start: 'Jun 2023'
}, {
  id: 6,
  name: 'Jana Novak',
  initials: 'JN',
  role: 'Payroll Specialist',
  dept: 'Finance',
  status: 'pending',
  start: 'Feb 2025'
}, {
  id: 7,
  name: 'David Osei',
  initials: 'DO',
  role: 'Backend Engineer',
  dept: 'Engineering',
  status: 'active',
  start: 'Apr 2023'
}, {
  id: 8,
  name: 'Mia Torres',
  initials: 'MT',
  role: 'Marketing Manager',
  dept: 'Marketing',
  status: 'offboarded',
  start: 'Jan 2021'
}];
const STATUS_TONE = {
  active: 'success',
  onboarding: 'warning',
  pending: 'warning',
  offboarded: 'error'
};
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
  label: 'Time & attendance'
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
Object.assign(window, {
  EMPLOYEES,
  STATUS_TONE,
  JOBS,
  STAGES,
  NAV_ITEMS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/web-app/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarStack = __ds_scope.AvatarStack;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ICON_NAMES = __ds_scope.ICON_NAMES;

__ds_ns.KpiCard = __ds_scope.KpiCard;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

})();
