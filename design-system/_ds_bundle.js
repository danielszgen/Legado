/* @ds-bundle: {"format":3,"namespace":"LegadoDesignSystem_04c693","components":[],"sourceHashes":{"brandbook/deck-stage.js":"d8d952171670","ui_kits/website/App.jsx":"f29df195b683","ui_kits/website/Collection.jsx":"120e71a5f880","ui_kits/website/Footer.jsx":"f9f72ebf81a0","ui_kits/website/Home.jsx":"d5368aff737b","ui_kits/website/Manifesto.jsx":"c59d5c9806da","ui_kits/website/Nav.jsx":"8d58b4a0d55c","ui_kits/website/NewsletterCard.jsx":"bddf8950cfa7","ui_kits/website/Primitives.jsx":"f12b4bfffe78","ui_kits/website/ProductCard.jsx":"b98a0c8d2496","ui_kits/website/ProductPage.jsx":"b9c05ae78106","ui_kits/website/Seal.jsx":"2a99ae039001"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LegadoDesignSystem_04c693 = window.LegadoDesignSystem_04c693 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// brandbook/deck-stage.js
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
 *  (g) thumbnail rail — resizable left-hand column of per-slide thumbnails
 *      (static clones). Click to navigate; ↑/↓ with a thumbnail focused to
 *      step between slides; drag to reorder; right-click for
 *      Skip / Move up / Move down / Delete (opens a Cancel/Delete confirm
 *      dialog). Drag the rail's right edge to resize; width persists to
 *      localStorage. Skipped slides carry `data-deck-skip`, are dimmed in
 *      the rail, omitted from prev/next navigation, and hidden at print.
 *      The rail is suppressed in presenting mode, in the host's Preview
 *      mode (ViewerMode='none'), on `noscale`, and via the `no-rail`
 *      attribute. Rail mutations dispatch a `deckchange`
 *      CustomEvent on the element: detail = {action, from, to, slide}.
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
 * Persistence: none at the deck level. The host app keeps the current slide
 * in its own URL (?slide=) and re-delivers it via location.hash on load, so a
 * bare load with no hash always starts at slide 1.
 *
 * Usage:
 *   <style>deck-stage:not(:defined){visibility:hidden}</style>
 *   <deck-stage width="1920" height="1080">
 *     <section data-label="Title">...</section>
 *     <section data-label="Agenda">...</section>
 *   </deck-stage>
 *   <script src="deck-stage.js"></script>
 *
 * The :not(:defined) rule prevents a flash of the first slide at its
 * authored styles before this script runs and attaches the shadow root.
 *
 * Slides are the direct element children of <deck-stage>. Each slide is
 * automatically tagged with:
 *   - data-screen-label="NN Label"   (1-indexed, for comment flow)
 *   - data-om-validate="no_overflowing_text,no_overlapping_text,slide_sized_text"
 */

(() => {
  const DESIGN_W_DEFAULT = 1920;
  const DESIGN_H_DEFAULT = 1080;
  const OVERLAY_HIDE_MS = 1800;
  const VALIDATE_ATTR = 'no_overflowing_text,no_overlapping_text,slide_sized_text';
  const pad2 = n => String(n).padStart(2, '0');

  // Label precedence: data-label → data-screen-label (number stripped) → first heading → "Slide".
  const getSlideLabel = el => {
    const explicit = el.getAttribute('data-label');
    if (explicit) return explicit;
    const existing = el.getAttribute('data-screen-label');
    if (existing) return existing.replace(/^\s*\d+\s*/, '').trim() || existing;
    const h = el.querySelector('h1, h2, h3, [data-title]');
    const t = h && (h.textContent || '').trim().slice(0, 40);
    if (t) return t;
    return 'Slide';
  };
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
    /* connectedCallback holds this until document.fonts.ready (capped 2s) so
     * the first visible paint has the deck's real typography + final rail
     * layout. opacity (not visibility) so the active slide can't un-hide
     * itself via the ::slotted([data-deck-active]) visibility:visible rule.
     * Only the stage/rail hide — the black :host background stays, so the
     * iframe doesn't flash the page's default white. */
    :host([data-fonts-pending]) .stage,
    :host([data-fonts-pending]) .rail { opacity: 0; pointer-events: none; }

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

    /* ── Thumbnail rail ──────────────────────────────────────────────────
       Fixed column on the left; each thumbnail is a static deep-clone of
       the light-DOM slide scaled into a 16:9 (or design-aspect) frame. The
       stage re-fits around it (see _fit); hidden during present / noscale
       / print so capture geometry and fullscreen output are unchanged. */
    .rail {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: var(--deck-rail-w, 188px);
      background: #141414;
      border-right: 1px solid rgba(255,255,255,0.08);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 10px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 2147482500;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.18) transparent;
    }
    .rail::-webkit-scrollbar { width: 8px; }
    .rail::-webkit-scrollbar-track { background: transparent; margin: 2px; }
    .rail::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.18);
      border-radius: 4px;
      border: 2px solid transparent;
      background-clip: content-box;
    }
    .rail::-webkit-scrollbar-thumb:hover {
      background: rgba(255,255,255,0.28);
      border: 2px solid transparent;
      background-clip: content-box;
    }
    :host([no-rail]) .rail,
    :host([noscale]) .rail { display: none; }
    .rail[data-presenting] { display: none; }
    /* User-driven show/hide (the TweaksPanel toggle) slides instead of
       popping. Transitions are gated on :host([data-rail-anim]) — set only
       for the 200ms around the toggle — so window-resize and rail-width
       drag (which also call _fit) don't lag behind the cursor. */
    .rail[data-user-hidden] { transform: translateX(-100%); }
    :host([data-rail-anim]) .rail { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .stage { transition: left 200ms cubic-bezier(.3,.7,.4,1); }
    :host([data-rail-anim]) .canvas { transition: transform 200ms cubic-bezier(.3,.7,.4,1); }
    /* transition shorthand replaces rather than merges — repeat the base
       .overlay opacity/transform/filter transitions so visibility changes
       during the 200ms toggle window still fade instead of popping. */
    :host([data-rail-anim]) .overlay {
      transition: margin-left 200ms cubic-bezier(.3,.7,.4,1),
                  opacity 260ms ease,
                  transform 260ms cubic-bezier(.2,.8,.2,1),
                  filter 260ms ease;
    }
    :host([data-rail-anim]) .tapzones { transition: left 200ms cubic-bezier(.3,.7,.4,1); }

    .thumb {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .thumb .num {
      width: 16px;
      flex-shrink: 0;
      font-size: 11px;
      font-weight: 500;
      text-align: right;
      color: rgba(255,255,255,0.55);
      padding-top: 2px;
      font-variant-numeric: tabular-nums;
    }
    .thumb .frame {
      position: relative;
      flex: 1;
      min-width: 0;
      aspect-ratio: var(--deck-aspect);
      background: #fff;
      border-radius: 4px;
      outline: 2px solid transparent;
      outline-offset: 0;
      overflow: hidden;
      transition: outline-color 120ms ease;
    }
    .thumb:hover .frame { outline-color: rgba(255,255,255,0.25); }
    .thumb { outline: none; }
    .thumb:focus-visible .frame { outline-color: rgba(255,255,255,0.5); }
    .thumb[data-current] .num { color: #fff; }
    .thumb[data-current] .frame { outline-color: #D97757; }
    .thumb[data-dragging] { opacity: 0.35; }
    .thumb::before {
      content: '';
      position: absolute;
      left: 24px;
      right: 0;
      height: 3px;
      border-radius: 2px;
      background: #D97757;
      opacity: 0;
      pointer-events: none;
    }
    .thumb[data-drop="before"]::before { top: -8px; opacity: 1; }
    .thumb[data-drop="after"]::before { bottom: -8px; opacity: 1; }
    .thumb[data-skip] .frame { opacity: 0.35; }
    .thumb[data-skip] .frame::after {
      content: 'Skipped';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.45);
      color: #fff;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }

    .ctxmenu {
      position: fixed;
      min-width: 150px;
      padding: 4px;
      background: #242424;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 7px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      z-index: 2147483100;
      display: none;
      font-size: 12px;
    }
    .ctxmenu[data-open] { display: block; }
    .ctxmenu button {
      display: block;
      width: 100%;
      appearance: none;
      border: 0;
      background: transparent;
      color: #e8e8e8;
      font: inherit;
      text-align: left;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
    }
    .ctxmenu button:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ctxmenu button:disabled { opacity: 0.35; cursor: default; }
    .ctxmenu hr {
      border: 0;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 4px 2px;
    }

    .rail-resize {
      position: fixed;
      left: calc(var(--deck-rail-w, 188px) - 3px);
      top: 0;
      bottom: 0;
      width: 6px;
      cursor: col-resize;
      z-index: 2147482600;
      touch-action: none;
    }
    .rail-resize:hover,
    .rail-resize[data-dragging] { background: rgba(255,255,255,0.12); }
    :host([no-rail]) .rail-resize,
    :host([noscale]) .rail-resize,
    .rail[data-presenting] + .rail-resize,
    .rail[data-user-hidden] + .rail-resize { display: none; }

    /* Delete-confirm popup — matches the SPA's ConfirmDialog layout
       (title + message body, depressed footer with Cancel / Delete). */
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 2147483200;
      display: none;
      align-items: center;
      justify-content: center;
    }
    .confirm-backdrop[data-open] { display: flex; }
    .confirm {
      width: 320px;
      max-width: calc(100vw - 32px);
      background: #2a2a2a;
      color: #e8e8e8;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
      overflow: hidden;
      font-family: inherit;
      animation: deck-confirm-in 0.18s ease;
    }
    @keyframes deck-confirm-in {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
    .confirm .body { padding: 20px 20px 16px; }
    .confirm .title { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .confirm .msg { font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.65); }
    .confirm .footer {
      padding: 14px 20px;
      background: #1f1f1f;
      border-top: 1px solid rgba(255,255,255,0.08);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .confirm button {
      appearance: none;
      font: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .confirm .cancel {
      background: transparent;
      border: 0;
      color: rgba(255,255,255,0.8);
    }
    .confirm .cancel:hover { background: rgba(255,255,255,0.08); }
    .confirm .danger {
      background: #c96442;
      border: 1px solid rgba(0,0,0,0.15);
      color: #fff;
      box-shadow: 0 1px 3px rgba(166,50,68,0.3), 0 2px 6px rgba(166,50,68,0.18);
    }
    .confirm .danger:hover { background: #b5563a; }

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
      /* :last-child alone isn't enough once data-deck-skip hides the
         trailing slide(s) — the last *visible* slide still carries
         break-after:page and prints a blank sheet. _markLastVisible()
         maintains data-deck-last-visible on the last non-skipped slide. */
      ::slotted(*:last-child),
      ::slotted([data-deck-last-visible]) {
        break-after: auto;
        page-break-after: auto;
      }
      ::slotted([data-deck-skip]) { display: none !important; }
      .overlay, .tapzones, .rail, .rail-resize, .ctxmenu, .confirm-backdrop { display: none !important; }
    }
  `;
  class DeckStage extends HTMLElement {
    static get observedAttributes() {
      return ['width', 'height', 'noscale', 'no-rail'];
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
      this._menuIndex = -1;
      this._onKey = this._onKey.bind(this);
      this._onResize = this._onResize.bind(this);
      this._onSlotChange = this._onSlotChange.bind(this);
      this._onMouseMove = this._onMouseMove.bind(this);
      this._onTapBack = this._onTapBack.bind(this);
      this._onTapForward = this._onTapForward.bind(this);
      this._onMessage = this._onMessage.bind(this);
      // Capture-phase close so a click anywhere dismisses the menu, but
      // ignore clicks that land inside the menu itself — otherwise the
      // capture handler runs before the menu's own (bubble) handler and
      // clears _menuIndex out from under it.
      this._onDocClick = e => {
        if (this._menu && e.composedPath && e.composedPath().includes(this._menu)) return;
        this._closeMenu();
      };
    }
    get designWidth() {
      return parseInt(this.getAttribute('width'), 10) || DESIGN_W_DEFAULT;
    }
    get designHeight() {
      return parseInt(this.getAttribute('height'), 10) || DESIGN_H_DEFAULT;
    }
    connectedCallback() {
      // Presenter-view popup loads deckUrl?_snthumb=...#N for its prev/cur/
      // next thumbnails — the rail has no business rendering inside those
      // (wrong scale, and it offsets the stage so the thumb shows a gutter).
      if (/[?&]_snthumb=/.test(location.search)) this.setAttribute('no-rail', '');
      this._render();
      this._loadNotes();
      this._syncPrintPageRule();
      window.addEventListener('keydown', this._onKey);
      window.addEventListener('resize', this._onResize);
      window.addEventListener('mousemove', this._onMouseMove, {
        passive: true
      });
      window.addEventListener('message', this._onMessage);
      window.addEventListener('click', this._onDocClick, true);
      // Initial collection + layout happens via slotchange, which fires on mount.
      this._enableRail();
      // Hold the stage hidden until webfonts are ready so the first visible
      // paint has the deck's real typography — the :not(:defined) guard in
      // the page HTML only covers custom-element upgrade, not font load.
      // Capped so a 404'd font URL can't blank the deck indefinitely.
      this.setAttribute('data-fonts-pending', '');
      const reveal = () => this.removeAttribute('data-fonts-pending');
      // rAF first: fonts.ready is a pre-resolved promise until layout has
      // resolved the slotted text's font-family and pushed a FontFace into
      // 'loading'. Reading it here in connectedCallback (parse-time) would
      // settle the race in a microtask before any font fetch starts.
      requestAnimationFrame(() => {
        Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 2000))]).then(reveal, reveal);
      });
    }
    _enableRail() {
      // Idempotent — older host builds still post __omelette_rail_enabled.
      // no-rail guard keeps the observers/stylesheet walk off the cheap path
      // for presenter-popup thumbnail iframes (up to 9 per view).
      if (this._railEnabled || this.hasAttribute('no-rail')) return;
      this._railEnabled = true;
      // Per-viewer preference — restored alongside rail width. Default on;
      // only a stored '0' (from the TweaksPanel toggle) hides it.
      this._railVisible = true;
      try {
        if (localStorage.getItem('deck-stage.railVisible') === '0') this._railVisible = false;
      } catch (e) {}
      // Live thumbnail updates: watch the light-DOM slides for content
      // edits and re-clone just the affected thumb(s), debounced. Ignore
      // the data-deck-* / data-screen-label / data-om-validate attributes
      // this component itself writes so nav and skip don't trigger
      // spurious refreshes.
      const OWN_ATTRS = /^data-(deck-|screen-label$|om-validate$)/;
      this._liveDirty = new Set();
      this._liveObserver = new MutationObserver(records => {
        for (const r of records) {
          if (r.type === 'attributes' && OWN_ATTRS.test(r.attributeName || '')) continue;
          let n = r.target;
          while (n && n.parentElement !== this) n = n.parentElement;
          if (n && this._slideSet && this._slideSet.has(n)) this._liveDirty.add(n);
        }
        if (this._liveDirty.size && !this._liveTimer) {
          this._liveTimer = setTimeout(() => {
            this._liveTimer = null;
            this._liveDirty.forEach(s => this._refreshThumb(s));
            this._liveDirty.clear();
          }, 200);
        }
      });
      this._liveObserver.observe(this, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true
      });
      // Lazy thumbnail materialization — clone the slide only when its
      // frame scrolls into (or near) the rail viewport. rootMargin gives
      // ~4 thumbs of pre-load so fast scrolling doesn't flash blanks.
      this._railObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && e.target.__deckThumb) {
            this._materialize(e.target.__deckThumb);
          }
        });
      }, {
        root: this._rail,
        rootMargin: '400px 0px'
      });
      // Tweaks typically change CSS vars / attrs OUTSIDE <deck-stage>
      // (on <html>, <body>, a wrapper div, or a <style> tag), which
      // _liveObserver can't see. Re-snapshot author CSS (constructable
      // sheet is shared by reference, so one replaceSync updates every
      // thumb shadow root) and re-sync each thumb host's attrs + custom
      // properties. In-slide DOM mutations are _liveObserver's job.
      // Debounced so slider drags don't thrash.
      this._onTweakChange = () => {
        clearTimeout(this._tweakTimer);
        this._tweakTimer = setTimeout(() => {
          this._snapshotAuthorCss();
          // One getComputedStyle for the whole batch — each
          // getPropertyValue read below reuses the same computed style
          // as long as nothing invalidates layout between thumbs.
          const cs = getComputedStyle(this);
          (this._thumbs || []).forEach(t => {
            if (t.host) this._syncThumbHostAttrs(t.host, cs);
          });
        }, 120);
      };
      window.addEventListener('tweakchange', this._onTweakChange);
      this._snapshotAuthorCss();
      // Build the rail now that it's enabled — slotchange already fired,
      // so _renderRail's early-return skipped the initial build.
      this._syncRailHidden();
      this._renderRail();
      this._fit();
    }

    /** Snapshot document stylesheets into a constructable sheet that each
     *  thumbnail's nested shadow root adopts — so author CSS styles the
     *  cloned slide content without touching this component's chrome.
     *  Cross-origin sheets throw on .cssRules — skip them. Re-callable:
     *  the existing constructable sheet is reused via replaceSync so every
     *  already-adopted shadow root picks up the fresh CSS without re-adopt. */
    _snapshotAuthorCss() {
      // :root in an adopted sheet inside a shadow root matches nothing
      // (only the document root qualifies), so author rules like
      // `:root[data-voice="modern"] .serif` never reach the clones.
      // Rewrite :root → :host and mirror <html>'s data-*/class/lang onto
      // each thumb host (see _syncThumbHostAttrs) so the same selectors
      // match inside the thumbnail's shadow tree.
      const authorCss = Array.from(document.styleSheets).map(sh => {
        try {
          return Array.from(sh.cssRules).map(r => r.cssText).join('\n');
        } catch (e) {
          return '';
        }
      }).join('\n')
      // The shadow host is featureless outside the functional :host(...)
      // form, so any compound on :root — [attr], .class, #id, :pseudo —
      // must become :host(<compound>) not :host<compound>. Same for the
      // html type selector (Tailwind class-strategy dark mode emits
      // html.dark; Pico uses html[data-theme]), which has nothing to
      // match inside the thumb's shadow tree.
      .replace(/:root((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)/g, ':host($1)').replace(/:root\b/g, ':host').replace(/(^|[\s,>~+(}])html((?:\[[^\]]*\]|[.#][-\w]+|:[-\w]+(?:\([^)]*\))?)+)(?![-\w])/g, '$1:host($2)').replace(/(^|[\s,>~+(}])html(?![-\w])/g, '$1:host');
      // Every custom property the author references. _syncThumbHostAttrs
      // mirrors each one's *computed* value at <deck-stage> onto the
      // thumb host so the live value wins over the :host default above
      // regardless of which ancestor the tweak wrote to (<html>, <body>,
      // a wrapper div, or the deck-stage element itself all inherit
      // down to getComputedStyle(this)).
      this._authorVars = new Set(authorCss.match(/--[\w-]+/g) || []);
      try {
        if (!this._adoptedSheet) this._adoptedSheet = new CSSStyleSheet();
        this._adoptedSheet.replaceSync(authorCss);
      } catch (e) {
        this._adoptedSheet = null;
        this._authorCss = authorCss;
      }
    }
    _syncThumbHostAttrs(host, cs) {
      const de = document.documentElement;
      // setAttribute overwrites but can't delete — an attr removed from
      // <html> (toggleAttribute off, classList emptied) would linger on
      // the host and :host([data-*]) / :host(.foo) rules would keep
      // matching. Remove stale mirrored attrs first; iterate backward
      // because removeAttribute mutates the live NamedNodeMap.
      for (let i = host.attributes.length - 1; i >= 0; i--) {
        const n = host.attributes[i].name;
        if ((n.startsWith('data-') || n === 'class' || n === 'lang') && !de.hasAttribute(n)) {
          host.removeAttribute(n);
        }
      }
      for (const a of de.attributes) {
        if (a.name.startsWith('data-') || a.name === 'class' || a.name === 'lang') {
          host.setAttribute(a.name, a.value);
        }
      }
      // The :root→:host rewrite in _snapshotAuthorCss pins each custom
      // property to its stylesheet default on the thumb host, shadowing
      // the live value that would otherwise inherit. Tweaks can write the
      // live value on any ancestor — <html>, <body>, a wrapper div, the
      // deck-stage element — so read it as the *computed* value at
      // <deck-stage> (which sees the whole inheritance chain) rather than
      // trying to guess which element the author wrote to. Inline on the
      // host beats the :host{} rule. remove-stale covers vars dropped
      // from the stylesheet between snapshots.
      const vars = this._authorVars || new Set();
      for (let i = host.style.length - 1; i >= 0; i--) {
        const p = host.style[i];
        if (p.startsWith('--') && !vars.has(p)) host.style.removeProperty(p);
      }
      const live = cs || getComputedStyle(this);
      vars.forEach(p => {
        const v = live.getPropertyValue(p);
        if (v) host.style.setProperty(p, v.trim());else host.style.removeProperty(p);
      });
    }
    disconnectedCallback() {
      window.removeEventListener('keydown', this._onKey);
      window.removeEventListener('resize', this._onResize);
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('message', this._onMessage);
      window.removeEventListener('click', this._onDocClick, true);
      if (this._hideTimer) clearTimeout(this._hideTimer);
      if (this._mouseIdleTimer) clearTimeout(this._mouseIdleTimer);
      if (this._liveTimer) clearTimeout(this._liveTimer);
      if (this._tweakTimer) clearTimeout(this._tweakTimer);
      if (this._railAnimTimer) clearTimeout(this._railAnimTimer);
      if (this._scaleRaf) cancelAnimationFrame(this._scaleRaf);
      if (this._liveObserver) this._liveObserver.disconnect();
      if (this._railObserver) this._railObserver.disconnect();
      if (this._onTweakChange) window.removeEventListener('tweakchange', this._onTweakChange);
    }
    attributeChangedCallback() {
      if (this._canvas) {
        this._canvas.style.width = this.designWidth + 'px';
        this._canvas.style.height = this.designHeight + 'px';
        this._canvas.style.setProperty('--deck-design-w', this.designWidth + 'px');
        this._canvas.style.setProperty('--deck-design-h', this.designHeight + 'px');
        if (this._rail) {
          this._rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
        }
        this._fit();
        this._scaleThumbs();
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
      tapzones.setAttribute('data-noncommentable', '');
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
      overlay.setAttribute('data-noncommentable', '');
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
      overlay.querySelector('.prev').addEventListener('click', () => this._advance(-1, 'click'));
      overlay.querySelector('.next').addEventListener('click', () => this._advance(1, 'click'));
      overlay.querySelector('.reset').addEventListener('click', () => this._go(0, 'click'));

      // Thumbnail rail + context menu. Thumbnails are populated in
      // _renderRail() after _collectSlides().
      const rail = document.createElement('div');
      rail.className = 'rail export-hidden';
      rail.setAttribute('data-noncommentable', '');
      rail.style.setProperty('--deck-aspect', this.designWidth + '/' + this.designHeight);
      // Edge auto-scroll while dragging a thumb near the rail's top/bottom
      // so off-screen drop targets are reachable. Native dragover fires
      // continuously while the pointer is stationary, so a per-event nudge
      // (ramped by edge proximity) is enough — no rAF loop needed.
      rail.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        const r = rail.getBoundingClientRect();
        const EDGE = 40;
        const dt = e.clientY - r.top;
        const db = r.bottom - e.clientY;
        if (dt < EDGE) rail.scrollTop -= Math.ceil((EDGE - dt) / 3);else if (db < EDGE) rail.scrollTop += Math.ceil((EDGE - db) / 3);
      });
      const menu = document.createElement('div');
      menu.className = 'ctxmenu export-hidden';
      menu.setAttribute('data-noncommentable', '');
      menu.innerHTML = `
        <button type="button" data-act="skip">Skip slide</button>
        <button type="button" data-act="up">Move up</button>
        <button type="button" data-act="down">Move down</button>
        <hr>
        <button type="button" data-act="delete">Delete slide</button>
      `;
      menu.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (!act) return;
        const i = this._menuIndex;
        this._closeMenu();
        if (act === 'skip') this._toggleSkip(i);else if (act === 'up') this._moveSlide(i, i - 1);else if (act === 'down') this._moveSlide(i, i + 1);else if (act === 'delete') this._openConfirm(i);
      });
      menu.addEventListener('contextmenu', e => e.preventDefault());

      // Rail resize handle — drag to set --deck-rail-w, persisted to
      // localStorage so the width survives reloads.
      const resize = document.createElement('div');
      resize.className = 'rail-resize export-hidden';
      resize.setAttribute('data-noncommentable', '');
      resize.addEventListener('pointerdown', e => {
        e.preventDefault();
        resize.setPointerCapture(e.pointerId);
        resize.setAttribute('data-dragging', '');
        const move = ev => this._setRailWidth(ev.clientX);
        const up = () => {
          resize.removeEventListener('pointermove', move);
          resize.removeEventListener('pointerup', up);
          resize.removeEventListener('pointercancel', up);
          resize.removeAttribute('data-dragging');
          try {
            localStorage.setItem('deck-stage.railWidth', String(this._railPx));
          } catch (err) {}
        };
        resize.addEventListener('pointermove', move);
        resize.addEventListener('pointerup', up);
        resize.addEventListener('pointercancel', up);
      });

      // Delete-confirm dialog — mirrors the SPA's ConfirmDialog layout.
      const confirm = document.createElement('div');
      confirm.className = 'confirm-backdrop export-hidden';
      confirm.setAttribute('data-noncommentable', '');
      confirm.innerHTML = `
        <div class="confirm" role="dialog" aria-modal="true">
          <div class="body">
            <div class="title">Delete slide?</div>
            <div class="msg">This slide will be removed from the deck.</div>
          </div>
          <div class="footer">
            <button type="button" class="cancel">Cancel</button>
            <button type="button" class="danger">Delete</button>
          </div>
        </div>
      `;
      confirm.addEventListener('click', e => {
        if (e.target === confirm) this._closeConfirm();
      });
      confirm.querySelector('.cancel').addEventListener('click', () => this._closeConfirm());
      confirm.querySelector('.danger').addEventListener('click', () => {
        const i = this._confirmIndex;
        this._closeConfirm();
        this._deleteSlide(i);
      });
      this._root.append(style, rail, resize, stage, tapzones, overlay, menu, confirm);
      this._canvas = canvas;
      this._slot = slot;
      this._overlay = overlay;
      this._tapzones = tapzones;
      this._rail = rail;
      this._resize = resize;
      this._menu = menu;
      this._confirm = confirm;
      this._countEl = overlay.querySelector('.current');
      this._totalEl = overlay.querySelector('.total');

      // Restore persisted rail width.
      let rw = 188;
      try {
        const s = localStorage.getItem('deck-stage.railWidth');
        if (s) rw = parseInt(s, 10) || rw;
      } catch (err) {}
      this._setRailWidth(rw);
      this._syncRailHidden();
    }
    _setRailWidth(px) {
      const w = Math.max(120, Math.min(360, Math.round(px)));
      this._railPx = w;
      this.style.setProperty('--deck-rail-w', w + 'px');
      this._fit();
      // _scaleThumbs forces a sync layout (frame.offsetWidth) then writes
      // N transforms. During a resize drag this runs per-pointermove;
      // coalesce to one per frame.
      if (!this._scaleRaf) {
        this._scaleRaf = requestAnimationFrame(() => {
          this._scaleRaf = null;
          this._scaleThumbs();
        });
      }
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
      // Rail mutations (delete/move) already reconcile synchronously and
      // emit slidechange with reason 'api'; skip the async slotchange that
      // would otherwise re-broadcast with reason 'init'.
      if (this._squelchSlotChange) {
        this._squelchSlotChange = false;
        return;
      }
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
      this._slideSet = new Set(this._slides);
      this._slides.forEach((slide, i) => {
        const n = i + 1;
        slide.setAttribute('data-screen-label', `${pad2(n)} ${getSlideLabel(slide)}`);

        // Validation attribute for comment flow / auto-checks.
        if (!slide.hasAttribute('data-om-validate')) {
          slide.setAttribute('data-om-validate', VALIDATE_ATTR);
        }
        slide.setAttribute('data-deck-slide', String(i));
      });
      if (this._totalEl) this._totalEl.textContent = String(this._slides.length || 1);
      if (this._index >= this._slides.length) this._index = Math.max(0, this._slides.length - 1);
      this._markLastVisible();
      this._renderRail();
    }

    /** Tag the last non-skipped slide so print CSS can drop its
     *  break-after (see the @media print comment above — :last-child
     *  alone matches a hidden skipped slide). */
    _markLastVisible() {
      let last = null;
      this._slides.forEach(s => {
        s.removeAttribute('data-deck-last-visible');
        if (!s.hasAttribute('data-deck-skip')) last = s;
      });
      if (last) last.setAttribute('data-deck-last-visible', '');
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
      // The host's ?slide= param is delivered as a #<int> hash (1-indexed) on
      // the iframe src. No hash → slide 1; the deck itself keeps no position
      // state across loads.
      const h = (location.hash || '').match(/^#(\d+)$/);
      if (h) {
        const n = parseInt(h[1], 10) - 1;
        if (n >= 0 && n < this._slides.length) this._index = n;
      }
    }
    _applyIndex({
      showOverlay = true,
      broadcast = true,
      reason = 'init'
    } = {}) {
      if (!this._slides.length) return;
      const prev = this._prevIndex == null ? -1 : this._prevIndex;
      const curr = this._index;
      // Keep the iframe's own hash in sync so an in-iframe location.reload()
      // (reload banner path in viewer-handle.ts) lands on the current slide,
      // not the stale deep-link hash from initial load.
      try {
        history.replaceState(null, '', '#' + (curr + 1));
      } catch (e) {}
      this._slides.forEach((s, i) => {
        if (i === curr) s.setAttribute('data-deck-active', '');else s.removeAttribute('data-deck-active');
      });
      if (this._countEl) this._countEl.textContent = String(curr + 1);
      // Follow-scroll on every navigation (init deep-link, keyboard, click,
      // tap, external goTo) — the only time we *don't* want the rail to
      // track current is after a rail-internal mutation, where _renderRail
      // has already restored the user's scroll position and yanking back to
      // current would undo it.
      this._syncRail(reason !== 'mutation');
      if (broadcast) {
        // (1) Legacy: host-window postMessage for speaker-notes renderers.
        try {
          window.postMessage({
            slideIndexChanged: curr,
            deckTotal: this._slides.length,
            deckSkipped: this._skippedIndices()
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
      // Host posts __omelette_presenting while in fullscreen/tab presentation
      // mode — suppress the nav footer entirely (both hover and slide-change
      // flash) so the audience sees clean slides.
      if (!this._overlay || this._presenting) return;
      this._overlay.setAttribute('data-visible', '');
      if (this._hideTimer) clearTimeout(this._hideTimer);
      this._hideTimer = setTimeout(() => {
        this._overlay.removeAttribute('data-visible');
      }, OVERLAY_HIDE_MS);
    }
    _railWidth() {
      // State-based, no offsetWidth: the first _fit() can run before the
      // rail has had layout on some load paths, and a 0 there paints the
      // slide full-width for one frame before the post-slotchange _fit()
      // corrects it.
      if (!this._railEnabled || !this._railVisible || this.hasAttribute('no-rail') || this.hasAttribute('noscale') || this._presenting || this._previewMode) return 0;
      return this._railPx || 0;
    }
    _fit() {
      if (!this._canvas) return;
      const stage = this._canvas.parentElement;
      // PPTX export sets noscale so the DOM capture sees authored-size
      // geometry — the scaled canvas is in shadow DOM, so the exporter's
      // resetTransformSelector can't reach .canvas.style.transform directly.
      if (this.hasAttribute('noscale')) {
        this._canvas.style.transform = 'none';
        if (stage) stage.style.left = '0';
        if (this._overlay) this._overlay.style.marginLeft = '0';
        if (this._tapzones) this._tapzones.style.left = '0';
        return;
      }
      const rw = this._railWidth();
      if (stage) stage.style.left = rw + 'px';
      // Overlay is centred on the viewport via left:50% + translate(-50%);
      // marginLeft shifts the centre by rw/2 so it lands in the middle of
      // the [rw, innerWidth] stage region. Tapzones just inset from rw.
      if (this._overlay) this._overlay.style.marginLeft = rw / 2 + 'px';
      if (this._tapzones) this._tapzones.style.left = rw + 'px';
      const vw = window.innerWidth - rw;
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
    _onMessage(e) {
      const d = e.data;
      if (d && typeof d.__omelette_presenting === 'boolean') {
        this._presenting = d.__omelette_presenting;
        if (this._presenting && this._overlay) {
          this._overlay.removeAttribute('data-visible');
          if (this._hideTimer) clearTimeout(this._hideTimer);
        }
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Host's Preview segment (ViewerMode='none'): the rail's drag-reorder /
      // right-click skip-delete affordances are editing chrome, so hide it
      // while the user is just looking at the deck. Same hard-hide path as
      // presenting; independent of the user's _railVisible preference so
      // returning to Edit restores whatever they had.
      if (d && typeof d.__omelette_preview_mode === 'boolean') {
        if (d.__omelette_preview_mode === this._previewMode) return;
        this._previewMode = d.__omelette_preview_mode;
        this._syncRailHidden();
        this._closeMenu();
        this._closeConfirm();
        this._fit();
        this._scaleThumbs();
      }
      // Per-viewer show/hide, driven by the TweaksPanel's auto-injected
      // "Thumbnail rail" toggle (or any author script). Independent of
      // whether the Tweaks panel itself is open — closing the panel
      // doesn't change rail visibility. Persists alongside rail width.
      if (d && d.type === '__deck_rail_visible' && typeof d.on === 'boolean') {
        if (d.on === this._railVisible) return;
        this._railVisible = d.on;
        try {
          localStorage.setItem('deck-stage.railVisible', d.on ? '1' : '0');
        } catch (e) {}
        // Arm the transition, commit it, then flip state — otherwise the
        // browser coalesces both writes and nothing animates on show.
        this.setAttribute('data-rail-anim', '');
        void (this._rail && this._rail.offsetHeight);
        this._syncRailHidden();
        this._fit();
        this._scaleThumbs();
        clearTimeout(this._railAnimTimer);
        this._railAnimTimer = setTimeout(() => this.removeAttribute('data-rail-anim'), 220);
      }
      if (d && d.type === '__omelette_rail_enabled') this._enableRail();
    }
    _syncRailHidden() {
      if (!this._rail) return;
      // data-presenting is the hard hide (display:none) for flag-off,
      // presentation mode, and the host's Preview segment — instant, no
      // transition. data-user-hidden is the soft hide (translateX(-100%))
      // for the viewer's rail toggle, so show/hide slides under
      // :host([data-rail-anim]).
      const hard = !this._railEnabled || this._presenting || this._previewMode;
      if (hard) this._rail.setAttribute('data-presenting', '');else this._rail.removeAttribute('data-presenting');
      if (!this._railVisible) this._rail.setAttribute('data-user-hidden', '');else this._rail.removeAttribute('data-user-hidden');
      // translateX hide leaves thumbs (tabIndex=0) in the tab order —
      // inert keeps them unfocusable while the rail is off-screen.
      this._rail.inert = hard || !this._railVisible;
    }
    _onTapBack(e) {
      e.preventDefault();
      this._advance(-1, 'tap');
    }
    _onTapForward(e) {
      e.preventDefault();
      this._advance(1, 'tap');
    }
    _onKey(e) {
      // Ignore when the user is typing.
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      // Confirm dialog swallows nav keys while open; Escape cancels. Enter
      // is left to the focused button's native activation so Tab→Cancel
      // →Enter activates Cancel, not the window-level confirm path.
      if (this._confirm && this._confirm.hasAttribute('data-open')) {
        if (e.key === 'Escape') {
          this._closeConfirm();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'Escape' && this._menu && this._menu.hasAttribute('data-open')) {
        this._closeMenu();
        e.preventDefault();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key;
      let handled = true;
      if (key === 'ArrowRight' || key === 'PageDown' || key === ' ' || key === 'Spacebar') {
        this._advance(1, 'keyboard');
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        this._advance(-1, 'keyboard');
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

    /** Step forward/back skipping any slide marked data-deck-skip. Falls
     *  back to _go's clamp-at-ends behaviour (flash overlay) when there's
     *  nothing further in that direction. */
    _advance(dir, reason) {
      if (!this._slides.length) return;
      let i = this._index + dir;
      while (i >= 0 && i < this._slides.length && this._slides[i].hasAttribute('data-deck-skip')) {
        i += dir;
      }
      if (i < 0 || i >= this._slides.length) {
        this._flashOverlay();
        return;
      }
      this._go(i, reason);
    }

    // ── Thumbnail rail ────────────────────────────────────────────────────
    //
    // Thumbs are keyed by slide element and reused across _renderRail()
    // calls, so a reorder/delete is an O(changed) DOM shuffle instead of an
    // O(N) teardown-and-re-clone. Each thumb starts as a lightweight shell
    // (num + empty frame); the clone is materialized lazily by an
    // IntersectionObserver when the frame scrolls into (or near) view, so
    // only visible-ish slides pay the clone + image-decode cost.

    _renderRail() {
      if (!this._rail || !this._railEnabled) {
        this._thumbs = [];
        return;
      }
      // FLIP: record each *materialized* thumb's top before the reconcile.
      // Off-screen (non-materialized) thumbs don't need the animation and
      // skipping their getBoundingClientRect saves a forced layout per
      // off-screen thumb on large decks.
      const prevTops = new Map();
      (this._thumbs || []).forEach(({
        thumb,
        slide,
        host
      }) => {
        if (host) prevTops.set(slide, thumb.getBoundingClientRect().top);
      });
      const st = this._rail.scrollTop;

      // Reconcile: reuse thumbs that already exist for a slide, create
      // shells for new slides, drop thumbs for removed slides.
      const bySlide = new Map();
      (this._thumbs || []).forEach(t => bySlide.set(t.slide, t));
      const next = [];
      this._slides.forEach(slide => {
        let t = bySlide.get(slide);
        if (t) bySlide.delete(slide);else t = this._makeThumb(slide);
        next.push(t);
      });
      // Orphans — slides removed since last render.
      bySlide.forEach(t => {
        if (this._railObserver) this._railObserver.unobserve(t.frame);
        t.thumb.remove();
      });
      // Put thumbs into document order to match _slides. insertBefore on
      // an already-correctly-placed node is a no-op, so this is cheap
      // when nothing moved.
      next.forEach((t, i) => {
        const want = t.thumb;
        const at = this._rail.children[i];
        if (at !== want) this._rail.insertBefore(want, at || null);
        t.i = i;
        t.num.textContent = String(i + 1);
        if (t.slide.hasAttribute('data-deck-skip')) t.thumb.setAttribute('data-skip', '');else t.thumb.removeAttribute('data-skip');
      });
      this._thumbs = next;
      this._rail.scrollTop = st;
      if (prevTops.size) {
        const moved = [];
        this._thumbs.forEach(({
          thumb,
          slide
        }) => {
          const old = prevTops.get(slide);
          if (old == null) return;
          const dy = old - thumb.getBoundingClientRect().top;
          if (Math.abs(dy) < 1) return;
          thumb.style.transition = 'none';
          thumb.style.transform = `translateY(${dy}px)`;
          moved.push(thumb);
        });
        if (moved.length) {
          // Commit the inverted positions before flipping the transition
          // on — otherwise the browser coalesces both style writes and
          // nothing animates.
          void this._rail.offsetHeight;
          moved.forEach(t => {
            t.style.transition = 'transform 180ms cubic-bezier(.2,.7,.3,1)';
            t.style.transform = '';
          });
          setTimeout(() => moved.forEach(t => {
            t.style.transition = '';
          }), 220);
        }
      }
      requestAnimationFrame(() => this._scaleThumbs());
      this._syncRail(false);
    }

    /** Create a lightweight thumb shell for one slide. The clone is
     *  materialized later by the IntersectionObserver. Event handlers
     *  look up the thumb's *current* index (via _thumbs.indexOf) so the
     *  same element can be reused across reorders. */
    _makeThumb(slide) {
      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.tabIndex = 0;
      const num = document.createElement('div');
      num.className = 'num';
      const frame = document.createElement('div');
      frame.className = 'frame';
      thumb.append(num, frame);
      const entry = {
        thumb,
        num,
        frame,
        slide,
        clone: null,
        host: null,
        i: -1
      };
      // entry.i is refreshed on every _renderRail reconcile pass, so
      // handlers read the thumb's current position without an O(N) scan.
      const idx = () => entry.i;
      thumb.addEventListener('click', () => this._go(idx(), 'click'));
      // ↑/↓ step through the rail when a thumb has focus. _go clamps at the
      // ends and _applyIndex→_syncRail scrolls the new current thumb into
      // view; we move focus to it (preventScroll — _syncRail already
      // scrolled) so a held key walks the whole list. stopPropagation keeps
      // this out of the window-level _onKey nav handler.
      thumb.addEventListener('keydown', e => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        e.preventDefault();
        e.stopPropagation();
        this._go(idx() + (e.key === 'ArrowDown' ? 1 : -1), 'keyboard');
        const cur = this._thumbs && this._thumbs[this._index];
        if (cur) cur.thumb.focus({
          preventScroll: true
        });
      });
      thumb.addEventListener('contextmenu', e => {
        e.preventDefault();
        this._openMenu(idx(), e.clientX, e.clientY);
      });
      thumb.draggable = true;
      thumb.addEventListener('dragstart', e => {
        this._dragFrom = idx();
        thumb.setAttribute('data-dragging', '');
        e.dataTransfer.effectAllowed = 'move';
        try {
          e.dataTransfer.setData('text/plain', String(this._dragFrom));
        } catch (err) {}
      });
      thumb.addEventListener('dragend', () => {
        thumb.removeAttribute('data-dragging');
        this._clearDrop();
        this._dragFrom = null;
      });
      thumb.addEventListener('dragover', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const r = thumb.getBoundingClientRect();
        this._setDrop(idx(), e.clientY < r.top + r.height / 2 ? 'before' : 'after');
      });
      thumb.addEventListener('drop', e => {
        if (this._dragFrom == null) return;
        e.preventDefault();
        const i = idx();
        const r = thumb.getBoundingClientRect();
        let to = e.clientY >= r.top + r.height / 2 ? i + 1 : i;
        if (this._dragFrom < to) to--;
        const from = this._dragFrom;
        this._clearDrop();
        this._dragFrom = null;
        if (to !== from) this._moveSlide(from, to);
      });
      if (this._railObserver) this._railObserver.observe(frame);
      frame.__deckThumb = entry;
      return entry;
    }

    /** Lazily build the clone for a thumb that has scrolled into view. */
    _materialize(entry) {
      if (entry.host) return;
      const dw = this.designWidth,
        dh = this.designHeight;
      let clone = entry.slide.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('data-deck-active');
      clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      // Neuter heavy media; replace <video> with its poster so the box
      // keeps a visual. <iframe>/<audio> become empty placeholders.
      clone.querySelectorAll('iframe, audio, object, embed').forEach(el => {
        el.removeAttribute('src');
        el.removeAttribute('srcdoc');
        el.removeAttribute('data');
        el.innerHTML = '';
      });
      clone.querySelectorAll('video').forEach(el => {
        if (!el.poster) {
          el.removeAttribute('src');
          el.innerHTML = '';
          return;
        }
        const img = document.createElement('img');
        img.src = el.poster;
        img.alt = '';
        img.style.cssText = el.style.cssText + ';object-fit:cover;width:100%;height:100%;';
        img.className = el.className;
        el.replaceWith(img);
      });
      // Images: defer decode and let the browser pick the smallest
      // srcset candidate for the ~140px thumb. Same-URL clones reuse the
      // slide's decoded bitmap (URL-keyed cache), so the remaining cost
      // is paint/composite — lazy+async keeps that off the main thread.
      clone.querySelectorAll('img').forEach(el => {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.srcset) el.sizes = (this._railPx || 188) + 'px';
      });
      // Custom elements inside the slide would have their
      // connectedCallback fire when the clone is appended. Replace them
      // with inert boxes so a component-heavy deck doesn't run N copies
      // of each component's mount logic in the rail. Children are
      // preserved so layout-wrapper elements (<my-column><h2>…</h2>)
      // still show their authored content; the querySelectorAll NodeList
      // is static, so nested custom elements in the moved subtree are
      // still visited on later iterations.
      const neuter = el => {
        const box = document.createElement('div');
        box.style.cssText = (el.getAttribute('style') || '') + ';background:rgba(0,0,0,0.06);border:1px dashed rgba(0,0,0,0.15);';
        box.className = el.className;
        // Preserve theming/i18n hooks so [data-*] / :lang() / [dir]
        // descendant selectors still match the neutered root.
        for (const a of el.attributes) {
          const n = a.name;
          if (n.startsWith('data-') || n.startsWith('aria-') || n === 'lang' || n === 'dir' || n === 'role' || n === 'title') {
            box.setAttribute(n, a.value);
          }
        }
        while (el.firstChild) box.appendChild(el.firstChild);
        return box;
      };
      // querySelectorAll('*') returns descendants only — a custom-element
      // slide root (<my-slide>…</my-slide>) would slip through and upgrade
      // on append. Swap the root first.
      if (clone.tagName.includes('-')) clone = neuter(clone);
      clone.querySelectorAll('*').forEach(el => {
        if (el.tagName.includes('-')) el.replaceWith(neuter(el));
      });
      clone.style.cssText += ';position:absolute;top:0;left:0;transform-origin:0 0;' + 'pointer-events:none;width:' + dw + 'px;height:' + dh + 'px;' + 'box-sizing:border-box;overflow:hidden;visibility:visible;opacity:1;';
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;inset:0;';
      this._syncThumbHostAttrs(host);
      const sr = host.attachShadow({
        mode: 'open'
      });
      if (this._adoptedSheet) sr.adoptedStyleSheets = [this._adoptedSheet];else {
        const st = document.createElement('style');
        st.textContent = this._authorCss || '';
        sr.appendChild(st);
      }
      sr.appendChild(clone);
      entry.frame.appendChild(host);
      entry.host = host;
      entry.clone = clone;
      if (this._thumbScale) clone.style.transform = 'scale(' + this._thumbScale + ')';
      // Once materialized the IO callback is a no-op early-return —
      // unobserve so scroll doesn't keep firing it.
      if (this._railObserver) this._railObserver.unobserve(entry.frame);
    }

    /** Re-clone a single thumb (live-update path). No-op if the thumb
     *  hasn't been materialized yet — it'll pick up current content when
     *  it scrolls into view. */
    _refreshThumb(slide) {
      const entry = (this._thumbs || []).find(t => t.slide === slide);
      if (!entry || !entry.host) return;
      entry.host.remove();
      entry.host = entry.clone = null;
      this._materialize(entry);
    }
    _scaleThumbs() {
      if (!this._thumbs || !this._thumbs.length) return;
      // Every frame is the same width; if it reads 0 the rail is
      // display:none (noscale / no-rail / presenting / print) — leave the
      // clones as-is and re-run when the rail is revealed.
      const fw = this._thumbs[0].frame.offsetWidth;
      if (!fw) return;
      this._thumbScale = fw / this.designWidth;
      this._thumbs.forEach(({
        clone
      }) => {
        if (clone) clone.style.transform = 'scale(' + this._thumbScale + ')';
      });
    }
    _setDrop(i, where) {
      // dragover fires at pointer-event rate; touch only the previous
      // and new target rather than sweeping all N thumbs.
      const t = this._thumbs && this._thumbs[i];
      if (this._dropOn && this._dropOn !== t) {
        this._dropOn.thumb.removeAttribute('data-drop');
      }
      if (t) t.thumb.setAttribute('data-drop', where);
      this._dropOn = t || null;
    }
    _clearDrop() {
      if (this._dropOn) this._dropOn.thumb.removeAttribute('data-drop');
      this._dropOn = null;
    }
    _syncRail(follow) {
      if (!this._thumbs) return;
      this._thumbs.forEach(({
        thumb
      }, i) => {
        if (i === this._index) {
          thumb.setAttribute('data-current', '');
          if (follow && typeof thumb.scrollIntoView === 'function') {
            thumb.scrollIntoView({
              block: 'nearest'
            });
          }
        } else {
          thumb.removeAttribute('data-current');
        }
      });
    }
    _openMenu(i, x, y) {
      if (!this._menu) return;
      this._menuIndex = i;
      const slide = this._slides[i];
      const skip = slide && slide.hasAttribute('data-deck-skip');
      this._menu.querySelector('[data-act="skip"]').textContent = skip ? 'Unskip slide' : 'Skip slide';
      this._menu.querySelector('[data-act="up"]').disabled = i <= 0;
      this._menu.querySelector('[data-act="down"]').disabled = i >= this._slides.length - 1;
      this._menu.querySelector('[data-act="delete"]').disabled = this._slides.length <= 1;
      // Place, then clamp to viewport after it's measurable.
      this._menu.style.left = x + 'px';
      this._menu.style.top = y + 'px';
      this._menu.setAttribute('data-open', '');
      const r = this._menu.getBoundingClientRect();
      const nx = Math.min(x, window.innerWidth - r.width - 4);
      const ny = Math.min(y, window.innerHeight - r.height - 4);
      this._menu.style.left = Math.max(4, nx) + 'px';
      this._menu.style.top = Math.max(4, ny) + 'px';
    }
    _closeMenu() {
      if (this._menu) this._menu.removeAttribute('data-open');
      this._menuIndex = -1;
    }
    _openConfirm(i) {
      if (!this._confirm) return;
      this._confirmIndex = i;
      this._confirm.querySelector('.title').textContent = 'Delete slide ' + (i + 1) + '?';
      this._confirm.setAttribute('data-open', '');
      const btn = this._confirm.querySelector('.danger');
      if (btn && btn.focus) btn.focus();
    }
    _closeConfirm() {
      if (this._confirm) this._confirm.removeAttribute('data-open');
      this._confirmIndex = -1;
    }
    _emitDeckChange(detail) {
      this.dispatchEvent(new CustomEvent('deckchange', {
        detail,
        bubbles: true,
        composed: true
      }));
    }
    _deleteSlide(i) {
      const slide = this._slides[i];
      if (!slide || this._slides.length <= 1) return;
      const wasCurrent = i === this._index;
      if (i < this._index || wasCurrent && i === this._slides.length - 1) this._index--;
      this._squelchSlotChange = true;
      slide.remove();
      this._emitDeckChange({
        action: 'delete',
        from: i,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: true,
        broadcast: true,
        reason: 'mutation'
      });
    }
    _toggleSkip(i) {
      const slide = this._slides[i];
      if (!slide) return;
      const on = !slide.hasAttribute('data-deck-skip');
      if (on) slide.setAttribute('data-deck-skip', '');else slide.removeAttribute('data-deck-skip');
      if (this._thumbs && this._thumbs[i]) {
        if (on) this._thumbs[i].thumb.setAttribute('data-skip', '');else this._thumbs[i].thumb.removeAttribute('data-skip');
      }
      this._markLastVisible();
      this._emitDeckChange({
        action: on ? 'skip' : 'unskip',
        from: i,
        slide
      });
      // Re-broadcast so the presenter popup's prev/next thumbnails re-pick
      // the nearest non-skipped slide without waiting for a nav event.
      try {
        window.postMessage({
          slideIndexChanged: this._index,
          deckTotal: this._slides.length,
          deckSkipped: this._skippedIndices()
        }, '*');
      } catch (e) {}
    }
    _skippedIndices() {
      const out = [];
      for (let i = 0; i < this._slides.length; i++) {
        if (this._slides[i].hasAttribute('data-deck-skip')) out.push(i);
      }
      return out;
    }
    _moveSlide(i, j) {
      if (j < 0 || j >= this._slides.length || j === i) return;
      const slide = this._slides[i];
      const ref = j < i ? this._slides[j] : this._slides[j].nextSibling;
      // Track the active slide across the reorder so the same content
      // stays on screen.
      const cur = this._index;
      if (cur === i) this._index = j;else if (i < cur && j >= cur) this._index = cur - 1;else if (i > cur && j <= cur) this._index = cur + 1;
      this._squelchSlotChange = true;
      this.insertBefore(slide, ref);
      this._emitDeckChange({
        action: 'move',
        from: i,
        to: j,
        slide
      });
      this._collectSlides();
      this._applyIndex({
        showOverlay: false,
        broadcast: true,
        reason: 'mutation'
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
      this._advance(1, 'api');
    }
    prev() {
      this._advance(-1, 'api');
    }
    reset() {
      this._go(0, 'api');
    }
  }
  if (!customElements.get('deck-stage')) {
    customElements.define('deck-stage', DeckStage);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "brandbook/deck-stage.js", error: String((e && e.message) || e) }); }

// ui_kits/website/App.jsx
try { (() => {
// App — router. SPA between Home, Collection, ProductPage.
// Other routes (materials, about, contact) fall back to Home with a note.

function App() {
  const [route, setRoute] = React.useState({
    name: 'home'
  });
  const go = r => {
    setRoute(r);
    if (typeof window !== 'undefined') window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  let page;
  if (route.name === 'home') page = /*#__PURE__*/React.createElement(Home, {
    go: go
  });else if (route.name === 'collection') page = /*#__PURE__*/React.createElement(Collection, {
    go: go
  });else if (route.name === 'product') page = /*#__PURE__*/React.createElement(ProductPage, {
    model: route.model,
    go: go
  });else page = /*#__PURE__*/React.createElement(Stub, {
    label: route.name,
    go: go
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Nav, {
    route: route,
    go: go
  }), page, /*#__PURE__*/React.createElement(Footer, {
    go: go
  }));
}
const stubStyles = {
  wrap: {
    padding: '180px 56px',
    textAlign: 'center',
    maxWidth: 720,
    margin: '0 auto'
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    marginBottom: 18
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 64,
    lineHeight: 1.02,
    letterSpacing: '-0.02em',
    color: 'var(--marfil)'
  },
  body: {
    marginTop: 22,
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 19,
    lineHeight: 1.55,
    color: 'rgba(244,239,230,0.75)'
  }
};
function Stub({
  label,
  go
}) {
  const titles = {
    materials: 'Materiales',
    about: 'Sobre nosotros',
    contact: 'Contacto'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "page",
    style: stubStyles.wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: stubStyles.eyebrow
  }, "\u2014 Secci\xF3n \xB7 ", label), /*#__PURE__*/React.createElement("h1", {
    style: stubStyles.title
  }, titles[label] || label), /*#__PURE__*/React.createElement("p", {
    style: stubStyles.body
  }, "Esta secci\xF3n est\xE1 prevista para fase Semana 4-6 del manual. Volver\xE1 con fotograf\xEDa editorial y voz de marca. Sin prisa."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 32
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => go({
      name: 'home'
    })
  }, "Volver a casa")));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Collection.jsx
try { (() => {
// Collection — listado editorial completo. 4 piezas.

const collectionStyles = {
  hero: {
    padding: '90px 56px 70px',
    maxWidth: 1440,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 56,
    alignItems: 'end',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)'
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    fontWeight: 500,
    color: 'var(--dorado)'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 72,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    color: 'var(--marfil)',
    marginTop: 14
  },
  lede: {
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 19,
    lineHeight: 1.55,
    color: 'rgba(244,239,230,0.78)',
    maxWidth: '46ch'
  },
  filters: {
    padding: '24px 56px',
    maxWidth: 1440,
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)'
  },
  chips: {
    display: 'flex',
    gap: 10
  },
  chip: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    padding: '7px 14px',
    borderRadius: 999,
    border: '0.5px solid rgba(201,168,106,0.4)',
    background: 'transparent',
    color: 'rgba(244,239,230,0.75)',
    cursor: 'pointer'
  },
  chipActive: {
    background: 'var(--dorado)',
    color: 'var(--ebano)',
    borderColor: 'var(--dorado)'
  },
  sort: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  grid: {
    padding: '60px 56px 100px',
    maxWidth: 1440,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 36
  }
};
function Collection({
  go
}) {
  const filters = ['Todo', 'Cuero', 'Lino', 'Bouclé'];
  const [filter, setFilter] = React.useState('Todo');
  const filtered = filter === 'Todo' ? LEGADO_CATALOGUE : LEGADO_CATALOGUE.filter(p => p.materialLabel.toLowerCase().includes(filter.toLowerCase()));
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("section", {
    style: collectionStyles.hero
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: collectionStyles.eyebrow
  }, "\u2014 Colecci\xF3n \xB7 2026"), /*#__PURE__*/React.createElement("h1", {
    style: collectionStyles.title
  }, "Pocas piezas.", /*#__PURE__*/React.createElement("br", null), "Defendidas una a una.")), /*#__PURE__*/React.createElement("p", {
    style: collectionStyles.lede
  }, "Crecemos a piezas y categor\xEDas nuevas s\xF3lo cuando cada una puede mantener el mismo est\xE1ndar. Hoy son cuatro.")), /*#__PURE__*/React.createElement("div", {
    style: collectionStyles.filters
  }, /*#__PURE__*/React.createElement("div", {
    style: collectionStyles.chips
  }, filters.map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    style: {
      ...collectionStyles.chip,
      ...(f === filter ? collectionStyles.chipActive : null)
    },
    onClick: () => setFilter(f)
  }, f))), /*#__PURE__*/React.createElement("div", {
    style: collectionStyles.sort
  }, "Orden \xB7 alfab\xE9tico")), /*#__PURE__*/React.createElement("section", {
    style: collectionStyles.grid
  }, filtered.map((piece, i) => /*#__PURE__*/React.createElement(ProductCard, {
    key: piece.id,
    piece: piece,
    index: i,
    total: filtered.length,
    onClick: () => go({
      name: 'product',
      model: piece.id
    })
  }))));
}
window.Collection = Collection;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Collection.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
// Footer — editorial pie. Firmada por el fundador, sello pequeño.

const footerStyles = {
  wrap: {
    background: 'var(--ebano)',
    color: 'var(--marfil)',
    padding: '80px 56px 32px',
    position: 'relative'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
    gap: 56,
    maxWidth: 1280,
    margin: '0 auto'
  },
  signature: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    letterSpacing: '0.34em',
    color: 'var(--marfil)',
    textTransform: 'uppercase'
  },
  claim: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 18,
    color: 'var(--dorado)',
    maxWidth: '24ch',
    lineHeight: 1.35
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  colHead: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    marginBottom: 8
  },
  link: {
    fontFamily: 'var(--font-sans)',
    fontSize: 14,
    color: 'var(--marfil)',
    opacity: 0.85,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    textAlign: 'left'
  },
  bottom: {
    maxWidth: 1280,
    margin: '64px auto 0',
    paddingTop: 24,
    borderTop: '0.5px solid rgba(201,168,106,0.25)',
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(244,239,230,0.55)'
  }
};
function Footer({
  go
}) {
  const link = (label, onClick) => /*#__PURE__*/React.createElement("button", {
    style: footerStyles.link,
    onClick: onClick
  }, label);
  return /*#__PURE__*/React.createElement("footer", {
    style: footerStyles.wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.grid
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.signature
  }, /*#__PURE__*/React.createElement(Seal, {
    size: 68,
    mode: "mono",
    tone: "brass"
  }), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.wordmark
  }, "Legado"), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.claim
  }, "Una casa se hace con los muebles que se quedan.")), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colHead
  }, "Colecci\xF3n"), link('Baltic', () => go({
    name: 'product',
    model: 'baltic'
  })), link('Nordic', () => go({
    name: 'product',
    model: 'nordic'
  })), link('Venus', () => go({
    name: 'product',
    model: 'venus'
  })), link('Ver todo', () => go({
    name: 'collection'
  }))), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colHead
  }, "Casa"), link('Sobre nosotros', () => go({
    name: 'about'
  })), link('Materiales', () => go({
    name: 'materials'
  })), link('Manifiesto', () => go({
    name: 'about'
  })), link('Newsletter', () => {})), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.col
  }, /*#__PURE__*/React.createElement("div", {
    style: footerStyles.colHead
  }, "Contacto"), link('hola@legado.es', () => {}), link('+34 600 00 00 00', () => {}), link('Atención · L-V 10-19h', () => {}))), /*#__PURE__*/React.createElement("div", {
    style: footerStyles.bottom
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 MMXXVI \xB7 Legado \xB7 Madrid"), /*#__PURE__*/React.createElement("span", null, "Hecho en Espa\xF1a \xB7 Documento interno"), /*#__PURE__*/React.createElement("span", null, "Pol\xEDtica \xB7 Devoluciones \xB7 Aviso legal")));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
// Home — landing. Mockup §28.
// Reglas: hero sin texto en imagen, una sola CTA por bloque, sello pequeño y siempre.

const homeStyles = {
  hero: {
    padding: '110px 56px 90px',
    background: 'var(--ebano)',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 56,
    alignItems: 'center',
    maxWidth: 1440,
    margin: '0 auto',
    position: 'relative'
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: 26
  },
  heroEyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  heroClaim: {
    fontFamily: 'var(--font-display)',
    fontSize: 92,
    lineHeight: 0.96,
    letterSpacing: '-0.022em',
    color: 'var(--marfil)',
    margin: 0
  },
  heroClaimEm: {
    fontStyle: 'italic',
    color: 'var(--dorado)'
  },
  heroLede: {
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 1.5,
    color: 'rgba(244,239,230,0.78)',
    maxWidth: '34ch',
    marginTop: 4
  },
  heroCta: {
    marginTop: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 28
  },
  heroHint: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,106,0.55)'
  },
  heroImage: {
    position: 'relative'
  },
  section: {
    padding: '90px 56px',
    maxWidth: 1440,
    margin: '0 auto'
  },
  sectionHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 48,
    paddingBottom: 18,
    borderBottom: '0.5px solid rgba(201,168,106,0.25)'
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 44,
    lineHeight: 1,
    letterSpacing: '-0.015em',
    color: 'var(--marfil)'
  },
  sectionMeta: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    fontVariantNumeric: 'tabular-nums'
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 44
  },
  values: {
    background: 'var(--nogal)',
    padding: '90px 56px'
  },
  valuesInner: {
    maxWidth: 1280,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 32
  },
  valueCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    paddingTop: 18,
    borderTop: '0.5px solid var(--dorado)'
  },
  valueN: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.22em',
    color: 'var(--dorado)',
    fontVariantNumeric: 'tabular-nums'
  },
  valueT: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    lineHeight: 1.05,
    color: 'var(--marfil)'
  },
  valueD: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 14.5,
    lineHeight: 1.55,
    color: 'rgba(244,239,230,0.7)'
  },
  proof: {
    padding: '90px 56px',
    background: 'var(--ebano)',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)'
  },
  proofInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1.5fr',
    gap: 64,
    alignItems: 'center'
  },
  proofText: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 32,
    lineHeight: 1.3,
    color: 'var(--marfil)',
    maxWidth: '24ch'
  },
  proofAttr: {
    marginTop: 22,
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  }
};
function Home({
  go
}) {
  const featured = LEGADO_CATALOGUE.slice(0, 3);
  const values = [{
    n: '01',
    t: 'Herencia',
    d: 'Piezas pensadas para envejecer contigo y pasar a la siguiente generación.'
  }, {
    n: '02',
    t: 'Artesanía',
    d: 'Materiales nobles y procesos cuidadosos. Hechos para durar.'
  }, {
    n: '03',
    t: 'Confort',
    d: 'Ergonomía pensada para el día a día real. Sentarse bien no es lujo.'
  }, {
    n: '04',
    t: 'Sostenibilidad',
    d: 'Made-to-order. Sin stock acumulado, sin ciclos de moda.'
  }, {
    n: '05',
    t: 'Hogar',
    d: 'Trabajamos sobre la idea de hacer hogar, no de vender muebles.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("section", {
    style: homeStyles.hero
  }, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.heroLeft
  }, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.heroEyebrow
  }, "\u2014 Desde MMXXVI \xB7 Hecho en Espa\xF1a"), /*#__PURE__*/React.createElement("h1", {
    style: homeStyles.heroClaim
  }, "Sillones para", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: homeStyles.heroClaimEm
  }, "toda la vida.")), /*#__PURE__*/React.createElement("p", {
    style: homeStyles.heroLede
  }, "Hechos bajo demanda en talleres espa\xF1oles. Sin stock, sin temporadas. Cada sill\xF3n existe cuando alguien lo elige."), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.heroCta
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => go({
      name: 'collection'
    })
  }, "Ver la colecci\xF3n"), /*#__PURE__*/React.createElement("span", {
    style: homeStyles.heroHint
  }, "4 piezas \xB7 4 semanas de espera"))), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.heroImage
  }, /*#__PURE__*/React.createElement(PlaceholderImage, {
    tone: "ambient",
    ratio: "5/6"
  }))), /*#__PURE__*/React.createElement("section", {
    style: homeStyles.section
  }, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.sectionHead
  }, /*#__PURE__*/React.createElement("h2", {
    style: homeStyles.sectionTitle
  }, "La colecci\xF3n"), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.sectionMeta
  }, "04 piezas \xB7 2026")), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.grid3
  }, featured.map((piece, i) => /*#__PURE__*/React.createElement(ProductCard, {
    key: piece.id,
    piece: piece,
    index: i,
    total: LEGADO_CATALOGUE.length,
    onClick: () => go({
      name: 'product',
      model: piece.id
    })
  })))), /*#__PURE__*/React.createElement(Manifesto, null), /*#__PURE__*/React.createElement("section", {
    style: homeStyles.values
  }, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.valuesInner
  }, values.map(v => /*#__PURE__*/React.createElement("div", {
    key: v.n,
    style: homeStyles.valueCol
  }, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.valueN
  }, v.n), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.valueT
  }, v.t), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.valueD
  }, v.d))))), /*#__PURE__*/React.createElement("section", {
    style: homeStyles.proof
  }, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.proofInner
  }, /*#__PURE__*/React.createElement(Seal, {
    size: 180,
    mode: "bitmap",
    tone: "brass"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: homeStyles.proofText
  }, "\xABLo hacemos cuando lo pides. Tarda cuatro semanas. Es as\xED por una raz\xF3n.\xBB"), /*#__PURE__*/React.createElement("div", {
    style: homeStyles.proofAttr
  }, "\u2014 Daniel L. \xB7 Fundador")))), /*#__PURE__*/React.createElement(NewsletterCard, null));
}
window.Home = Home;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Manifesto.jsx
try { (() => {
// Manifesto excerpt block.

const manifestoStyles = {
  wrap: {
    background: 'var(--ebano)',
    color: 'var(--marfil)',
    padding: '120px 56px',
    position: 'relative'
  },
  inner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1.4fr',
    gap: 80,
    alignItems: 'start'
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 56,
    lineHeight: 1.02,
    letterSpacing: '-0.018em',
    color: 'var(--marfil)',
    marginTop: 18
  },
  titleEm: {
    fontStyle: 'italic',
    color: 'var(--dorado)'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  line: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 18,
    lineHeight: 1.55,
    color: 'rgba(244,239,230,0.92)',
    paddingLeft: 24,
    position: 'relative'
  },
  bullet: {
    position: 'absolute',
    left: 0,
    top: 8,
    width: 12,
    borderTop: '0.5px solid var(--dorado)'
  },
  signature: {
    marginTop: 40,
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,106,0.7)'
  }
};
function Manifesto() {
  const lines = ['Creemos en las casas que se hacen despacio.', 'Creemos que un sillón no es un mueble: es un sitio.', 'Creemos que lo barato sale caro cuando se mide en años.', 'Creemos que el reposo es un derecho de adulto, no un signo de cansancio.', 'Creemos en hacer pocas cosas. Y en hacerlas bien.'];
  return /*#__PURE__*/React.createElement("section", {
    style: manifestoStyles.wrap
  }, /*#__PURE__*/React.createElement(PageMarks, {
    color: "rgba(201,168,106,0.4)"
  }), /*#__PURE__*/React.createElement("div", {
    style: manifestoStyles.inner
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: manifestoStyles.eyebrow
  }, "\u2014 Manifiesto \xB7 2026"), /*#__PURE__*/React.createElement("h2", {
    style: manifestoStyles.title
  }, "Lo contrario", /*#__PURE__*/React.createElement("br", null), "del lujo no es", /*#__PURE__*/React.createElement("br", null), "la sencillez.", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: manifestoStyles.titleEm
  }, "Es la prisa.")), /*#__PURE__*/React.createElement("div", {
    style: manifestoStyles.signature
  }, "\u2014 Legado \xB7 Madrid")), /*#__PURE__*/React.createElement("div", {
    style: manifestoStyles.list
  }, lines.map((l, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: manifestoStyles.line
  }, /*#__PURE__*/React.createElement("div", {
    style: manifestoStyles.bullet
  }), l)))));
}
window.Manifesto = Manifesto;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Manifesto.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Nav.jsx
try { (() => {
// Nav — sticky top bar. Sello pequeño y siempre (§28).

const navStyles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 56px',
    background: 'var(--ebano)',
    borderBottom: '0.5px solid rgba(201,168,106,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    cursor: 'pointer'
  },
  wordmark: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    letterSpacing: '0.32em',
    color: 'var(--marfil)',
    textTransform: 'uppercase'
  },
  links: {
    display: 'flex',
    gap: 38,
    fontFamily: 'var(--font-sans)',
    fontSize: 12.5,
    fontWeight: 500,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--marfil)'
  },
  link: {
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
    letterSpacing: 'inherit',
    textTransform: 'inherit',
    padding: 0,
    transition: 'opacity .2s ease'
  },
  linkActive: {
    borderBottom: '0.5px solid var(--dorado)',
    paddingBottom: 4
  }
};
function Nav({
  route,
  go
}) {
  const items = [{
    id: 'collection',
    label: 'Colección'
  }, {
    id: 'materials',
    label: 'Materiales'
  }, {
    id: 'about',
    label: 'Sobre nosotros'
  }, {
    id: 'contact',
    label: 'Contacto'
  }];
  const isActive = id => id === 'collection' && (route.name === 'collection' || route.name === 'product');
  return /*#__PURE__*/React.createElement("nav", {
    style: navStyles.bar
  }, /*#__PURE__*/React.createElement("div", {
    style: navStyles.left,
    onClick: () => go({
      name: 'home'
    })
  }, /*#__PURE__*/React.createElement(Seal, {
    size: 40,
    mode: "mono",
    tone: "brass"
  }), /*#__PURE__*/React.createElement("span", {
    style: navStyles.wordmark
  }, "Legado")), /*#__PURE__*/React.createElement("div", {
    style: navStyles.links
  }, items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    style: {
      ...navStyles.link,
      ...(isActive(it.id) ? navStyles.linkActive : null)
    },
    onClick: () => go({
      name: it.id === 'collection' ? 'collection' : it.id
    }),
    onMouseEnter: e => e.currentTarget.style.opacity = 0.55,
    onMouseLeave: e => e.currentTarget.style.opacity = 1
  }, it.label))), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => go({
      name: 'collection'
    })
  }, "Ver la colecci\xF3n"));
}
window.Nav = Nav;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/NewsletterCard.jsx
try { (() => {
// Newsletter signup — pausada. "Una sola vez al mes." (§30)

const nlStyles = {
  wrap: {
    background: 'var(--cuero)',
    padding: '100px 56px',
    position: 'relative'
  },
  inner: {
    maxWidth: 760,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    alignItems: 'flex-start'
  },
  eyebrow: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: '0.32em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 44,
    lineHeight: 1.05,
    letterSpacing: '-0.015em',
    color: 'var(--marfil)',
    maxWidth: '14ch'
  },
  body: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17,
    lineHeight: 1.55,
    fontStyle: 'italic',
    color: 'rgba(244,239,230,0.85)',
    maxWidth: '50ch'
  },
  form: {
    display: 'flex',
    gap: 0,
    width: '100%',
    maxWidth: 540,
    marginTop: 12,
    borderBottom: '0.5px solid var(--dorado)'
  },
  input: {
    flex: 1,
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 19,
    background: 'transparent',
    border: 'none',
    padding: '12px 0',
    color: 'var(--marfil)',
    outline: 'none'
  },
  send: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    background: 'transparent',
    border: 'none',
    padding: '12px 0 12px 20px',
    cursor: 'pointer'
  },
  footnote: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'rgba(244,239,230,0.45)',
    marginTop: 10
  }
};
function NewsletterCard() {
  const [v, setV] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", {
    style: nlStyles.wrap
  }, /*#__PURE__*/React.createElement("div", {
    style: nlStyles.inner
  }, /*#__PURE__*/React.createElement("div", {
    style: nlStyles.eyebrow
  }, "\u2014 Carta mensual"), /*#__PURE__*/React.createElement("h2", {
    style: nlStyles.title
  }, "Una carta al mes. Sin oferta."), /*#__PURE__*/React.createElement("p", {
    style: nlStyles.body
  }, "Escribimos sobre un material, una pieza y un rinc\xF3n ajeno. Sin descuentos, sin colecci\xF3n nueva. La newsletter es el contrario del descuento."), /*#__PURE__*/React.createElement("form", {
    style: nlStyles.form,
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    }
  }, /*#__PURE__*/React.createElement("input", {
    style: nlStyles.input,
    type: "email",
    placeholder: "tu@correo.es",
    value: v,
    onChange: e => setV(e.target.value),
    disabled: sent
  }), /*#__PURE__*/React.createElement("button", {
    style: nlStyles.send,
    type: "submit"
  }, sent ? '✓ Anotada' : 'Suscribirse')), /*#__PURE__*/React.createElement("div", {
    style: nlStyles.footnote
  }, "Un correo al mes. Te puedes ir cuando quieras.")));
}
window.NewsletterCard = NewsletterCard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/NewsletterCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Primitives.jsx
try { (() => {
// Primitives — shared building blocks. Loaded first.

const primBtnStyles = {
  primary: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--ebano)',
    background: 'var(--dorado)',
    padding: '15px 26px',
    border: 'none',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'opacity .2s ease'
  },
  secondary: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    fontWeight: 700,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--marfil)',
    background: 'transparent',
    padding: '14px 25px',
    border: '0.5px solid var(--dorado)',
    borderRadius: 2,
    cursor: 'pointer',
    transition: 'opacity .2s ease, background .2s ease'
  },
  ghost: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    background: 'transparent',
    border: 'none',
    borderBottom: '0.5px solid var(--dorado)',
    padding: '6px 2px',
    cursor: 'pointer',
    transition: 'opacity .2s ease',
    whiteSpace: 'nowrap'
  }
};
function Button({
  variant = 'primary',
  onClick,
  children,
  style
}) {
  const [hover, setHover] = React.useState(false);
  const base = primBtnStyles[variant];
  const computed = {
    ...base,
    opacity: hover ? 0.7 : 1,
    ...style
  };
  return /*#__PURE__*/React.createElement("button", {
    style: computed,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, children);
}
function Eyebrow({
  children,
  color,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: color || 'var(--fg2)',
      ...style
    }
  }, children);
}
function Rule({
  tone = 'laton',
  style
}) {
  const color = tone === 'laton' ? 'var(--dorado)' : tone === 'cuero' ? 'var(--cuero)' : 'var(--rule)';
  return /*#__PURE__*/React.createElement("hr", {
    style: {
      border: 0,
      borderTop: `0.5px solid ${color}`,
      margin: 0,
      ...style
    }
  });
}

// Page corner crosses, § 23 punto 02
function PageMarks({
  color = 'rgba(74,50,32,0.5)'
}) {
  const mark = pos => ({
    position: 'absolute',
    width: 14,
    height: 14,
    background: `linear-gradient(${color}, ${color}) center/100% 0.5px no-repeat, linear-gradient(${color}, ${color}) center/0.5px 100% no-repeat`,
    ...pos
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: mark({
      top: 24,
      left: 24
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: mark({
      top: 24,
      right: 24
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: mark({
      bottom: 24,
      left: 24
    })
  }), /*#__PURE__*/React.createElement("div", {
    style: mark({
      bottom: 24,
      right: 24
    })
  }));
}

// Placeholder image — warm gradient suggesting leather / wood interior.
// All images are placeholders pending §32 "Semana 3-4 · fotografía editorial".
function PlaceholderImage({
  tone = 'cognac',
  ratio = '4/5',
  children,
  style
}) {
  const gradients = {
    cognac: 'radial-gradient(ellipse at 30% 20%, #B97540 0%, #6E4322 60%, #3A2616 100%)',
    tabaco: 'radial-gradient(ellipse at 70% 30%, #7A4B2A 0%, #4A2E1E 70%, #1F140C 100%)',
    moka: 'radial-gradient(ellipse at 30% 80%, #6E4E32 0%, #3A2616 70%, #1A1410 100%)',
    lino: 'radial-gradient(ellipse at 50% 30%, #DCC8A6 0%, #B89466 50%, #7C5A38 100%)',
    boucle: 'radial-gradient(ellipse at 30% 30%, #E6D6B8 0%, #C9A07A 60%, #8A6446 100%)',
    bouclé: 'radial-gradient(ellipse at 30% 30%, #E6D6B8 0%, #C9A07A 60%, #8A6446 100%)',
    terciopelo: 'radial-gradient(ellipse at 70% 20%, #6E2620 0%, #3F1612 60%, #1A0908 100%)',
    nogal: 'radial-gradient(ellipse at 50% 50%, #6E4E32 0%, #3A2616 100%)',
    ambient: 'radial-gradient(ellipse at 70% 30%, #B68455 0%, #6E4E32 40%, #2A1C12 100%)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: ratio,
      width: '100%',
      background: gradients[tone] || gradients.ambient,
      position: 'relative',
      overflow: 'hidden',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse at 50% 60%, transparent 30%, rgba(26,20,16,0.35) 100%)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.04,
      pointerEvents: 'none',
      backgroundImage: 'radial-gradient(rgba(244,239,230,0.6) 0.5px, transparent 0.5px)',
      backgroundSize: '3px 3px'
    }
  }), children);
}
Object.assign(window, {
  Button,
  Eyebrow,
  Rule,
  PageMarks,
  PlaceholderImage
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Primitives.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProductCard.jsx
try { (() => {
// ProductCard — pieza listada. Nombre, material, precio, número.
// Sin descuento, sin "últimas unidades". § 12 y § 14.

const productCardStyles = {
  card: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    padding: 0,
    width: '100%',
    textAlign: 'left',
    fontFamily: 'inherit'
  },
  imgWrap: {
    position: 'relative',
    overflow: 'hidden'
  },
  no: {
    position: 'absolute',
    top: 14,
    right: 16,
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(244,239,230,0.75)',
    fontVariantNumeric: 'tabular-nums'
  },
  body: {
    padding: '20px 0 4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 16
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  name: {
    fontFamily: 'var(--font-display)',
    fontSize: 28,
    lineHeight: 1,
    letterSpacing: '-0.01em',
    color: 'var(--marfil)'
  },
  meta: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11.5,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  price: {
    fontFamily: 'var(--font-sans)',
    fontSize: 16,
    fontWeight: 500,
    color: 'var(--marfil)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  }
};
function ProductCard({
  piece,
  index,
  total,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    style: productCardStyles.card,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    style: productCardStyles.imgWrap
  }, /*#__PURE__*/React.createElement(PlaceholderImage, {
    tone: piece.tone,
    ratio: "4/5"
  }), /*#__PURE__*/React.createElement("span", {
    style: productCardStyles.no
  }, "N\xBA ", String(index + 1).padStart(2, '0'), " / ", String(total).padStart(2, '0'))), /*#__PURE__*/React.createElement("div", {
    style: productCardStyles.body
  }, /*#__PURE__*/React.createElement("div", {
    style: productCardStyles.left
  }, /*#__PURE__*/React.createElement("div", {
    style: productCardStyles.name
  }, piece.name), /*#__PURE__*/React.createElement("div", {
    style: productCardStyles.meta
  }, piece.materialLabel)), /*#__PURE__*/React.createElement("div", {
    style: productCardStyles.price
  }, piece.price.toLocaleString('es-ES'), " \u20AC")));
}

// Catalogue data — manual §28
const LEGADO_CATALOGUE = [{
  id: 'baltic',
  name: 'Baltic',
  price: 890,
  materialLabel: 'Cuero · cognac',
  tone: 'cognac',
  blurb: 'El sillón de lectura. Asiento profundo, respaldo medio, brazos amplios. Pensado para tardes largas.',
  composition: ['Estructura de roble macizo', 'Cuero de Ubrique · curtido vegetal', 'Relleno: pluma de oca y látex natural'],
  dimensions: {
    Ancho: '82 cm',
    Fondo: '92 cm',
    Alto: '94 cm',
    'Alto asiento': '44 cm'
  },
  posture: 'Lectura prolongada · siesta breve · conversación a dos.'
}, {
  id: 'nordic',
  name: 'Nordic',
  price: 820,
  materialLabel: 'Lino lavado · arena',
  tone: 'lino',
  blurb: 'La pieza que se queda en el rincón claro. Líneas limpias, base baja. Para el salón que respira.',
  composition: ['Estructura de fresno claro', 'Lino lavado 100% · Bélgica', 'Relleno: espuma HR + pluma'],
  dimensions: {
    Ancho: '78 cm',
    Fondo: '86 cm',
    Alto: '88 cm',
    'Alto asiento': '42 cm'
  },
  posture: 'Conversación · descanso medio · espacios claros.'
}, {
  id: 'venus',
  name: 'Venus',
  price: 760,
  materialLabel: 'Bouclé · crudo',
  tone: 'boucle',
  blurb: 'Curva continua, textura cálida. Una sola pieza, mucho carácter. Pieza protagonista de habitación.',
  composition: ['Estructura de haya curvada', 'Bouclé italiano · 360 g/m²', 'Relleno: espuma HR firmeza media'],
  dimensions: {
    Ancho: '86 cm',
    Fondo: '88 cm',
    Alto: '82 cm',
    'Alto asiento': '40 cm'
  },
  posture: 'Lectura ligera · acento decorativo · habitación.'
}, {
  id: 'duero',
  name: 'Duero',
  price: 940,
  materialLabel: 'Cuero · moka',
  tone: 'moka',
  blurb: 'El sillón de despacho doméstico. Respaldo alto, brazos contenidos. Hecho para sentarse derecho.',
  composition: ['Estructura de nogal macizo', 'Cuero engrasado · moka', 'Costuras visibles en hilo crudo'],
  dimensions: {
    Ancho: '76 cm',
    Fondo: '88 cm',
    Alto: '102 cm',
    'Alto asiento': '46 cm'
  },
  posture: 'Trabajo · lectura derecha · entrevista en casa.'
}];
Object.assign(window, {
  ProductCard,
  LEGADO_CATALOGUE
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProductCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProductPage.jsx
try { (() => {
// ProductPage — ficha de modelo. 7 bloques fijos (§28).
//  1. Hero      2. Materiales   3. Dimensiones
//  4. Postura   5. Garantía     6. FAQ
//  7. Contacto

const ppStyles = {
  back: {
    padding: '24px 56px',
    maxWidth: 1440,
    margin: '0 auto'
  },
  // -------- 1. Hero
  hero: {
    padding: '0 56px 80px',
    maxWidth: 1440,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 64,
    alignItems: 'center'
  },
  heroImg: {
    position: 'relative'
  },
  heroSeal: {
    position: 'absolute',
    bottom: 24,
    right: 24
  },
  heroText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 22
  },
  heroNo: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    fontVariantNumeric: 'tabular-nums'
  },
  heroName: {
    fontFamily: 'var(--font-display)',
    fontSize: 96,
    lineHeight: 0.92,
    letterSpacing: '-0.025em',
    color: 'var(--marfil)',
    margin: 0
  },
  heroBlurb: {
    fontFamily: 'var(--font-serif-text)',
    fontStyle: 'italic',
    fontSize: 21,
    lineHeight: 1.5,
    color: 'rgba(244,239,230,0.82)',
    maxWidth: '34ch'
  },
  heroMeta: {
    display: 'flex',
    gap: 28,
    alignItems: 'baseline',
    marginTop: 8,
    flexWrap: 'wrap'
  },
  heroPrice: {
    fontFamily: 'var(--font-display)',
    fontSize: 36,
    color: 'var(--marfil)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'
  },
  heroEnvio: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    whiteSpace: 'nowrap'
  },
  // shared block
  block: {
    padding: '80px 56px',
    maxWidth: 1440,
    margin: '0 auto',
    borderTop: '0.5px solid rgba(201,168,106,0.2)'
  },
  blockGrid: {
    display: 'grid',
    gridTemplateColumns: '260px 1fr',
    gap: 56,
    alignItems: 'start'
  },
  blockNo: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.32em',
    color: 'var(--dorado)',
    textTransform: 'uppercase',
    fontVariantNumeric: 'tabular-nums',
    marginBottom: 8
  },
  blockTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 32,
    lineHeight: 1,
    color: 'var(--marfil)',
    letterSpacing: '-0.01em'
  },
  blockBody: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17,
    lineHeight: 1.6,
    color: 'rgba(244,239,230,0.85)'
  },
  // -------- 2. Materiales
  matsRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0
  },
  matRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    padding: '20px 0',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17,
    color: 'var(--marfil)'
  },
  matLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: 'var(--dorado)',
    paddingTop: 4
  },
  matRowLast: {
    borderBottom: '0.5px solid rgba(201,168,106,0.2)'
  },
  // -------- 3. Dimensiones
  dimsWrap: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: 64,
    alignItems: 'center'
  },
  dimsList: {
    display: 'flex',
    flexDirection: 'column'
  },
  dimRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '18px 0',
    borderTop: '0.5px solid rgba(201,168,106,0.2)'
  },
  dimLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  dimVal: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    color: 'var(--marfil)',
    fontVariantNumeric: 'tabular-nums'
  },
  // -------- 5. Garantía / 6. FAQ shared
  faq: {
    display: 'flex',
    flexDirection: 'column'
  },
  faqItem: {
    padding: '20px 0',
    borderTop: '0.5px solid rgba(201,168,106,0.2)',
    cursor: 'pointer'
  },
  faqQ: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    color: 'var(--marfil)',
    letterSpacing: '-0.005em'
  },
  faqMark: {
    fontFamily: 'var(--font-sans)',
    fontSize: 18,
    color: 'var(--dorado)',
    marginLeft: 16
  },
  faqA: {
    marginTop: 10,
    fontFamily: 'var(--font-serif-text)',
    fontSize: 16,
    lineHeight: 1.6,
    color: 'rgba(244,239,230,0.75)',
    maxWidth: '64ch'
  },
  // -------- 7. Contacto
  contactWrap: {
    background: 'var(--cuero)',
    padding: '90px 56px'
  },
  contactInner: {
    maxWidth: 1100,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 64
  },
  contactSig: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  contactQuote: {
    fontFamily: 'var(--font-display)',
    fontStyle: 'italic',
    fontSize: 28,
    lineHeight: 1.3,
    color: 'var(--marfil)',
    maxWidth: '24ch'
  },
  contactAttr: {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  contactForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  fieldLabel: {
    fontFamily: 'var(--font-sans)',
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: '0.24em',
    textTransform: 'uppercase',
    color: 'var(--dorado)'
  },
  fieldInput: {
    fontFamily: 'var(--font-serif-text)',
    fontSize: 17,
    color: 'var(--marfil)',
    background: 'transparent',
    border: 'none',
    borderBottom: '0.5px solid var(--dorado)',
    padding: '8px 0',
    outline: 'none'
  }
};
function FAQItem({
  q,
  a,
  open,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: ppStyles.faqItem,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.faqQ
  }, /*#__PURE__*/React.createElement("span", null, q), /*#__PURE__*/React.createElement("span", {
    style: ppStyles.faqMark
  }, open ? '−' : '+')), open && /*#__PURE__*/React.createElement("div", {
    style: ppStyles.faqA
  }, a));
}
function ProductPage({
  model,
  go
}) {
  const piece = LEGADO_CATALOGUE.find(p => p.id === model) || LEGADO_CATALOGUE[0];
  const idx = LEGADO_CATALOGUE.indexOf(piece);
  const [openFaq, setOpenFaq] = React.useState(0);
  const faqs = [{
    q: '¿Cuánto tarda?',
    a: 'Cuatro semanas desde el pedido. No tenemos stock — cada sillón se hace cuando lo pides.'
  }, {
    q: '¿Cómo lo enviáis?',
    a: 'Transporte propio en península. Subida hasta tu salón incluida. Retiramos el embalaje.'
  }, {
    q: '¿Puedo devolverlo?',
    a: 'Treinta días desde la entrega. Sin preguntas. Coste de devolución a nuestro cargo si la pieza viene con tara.'
  }, {
    q: '¿Y si el cuero envejece?',
    a: 'Se patina. Esa es la idea. Te enviamos pauta de cuidado y aceite hidratante con la pieza.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "page"
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.back
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: () => go({
      name: 'collection'
    })
  }, "\u2190 Volver a la colecci\xF3n")), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.hero
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroImg
  }, /*#__PURE__*/React.createElement(PlaceholderImage, {
    tone: piece.tone,
    ratio: "5/6"
  }), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroSeal
  }, /*#__PURE__*/React.createElement(Seal, {
    size: 64,
    mode: "mono",
    tone: "brass"
  }))), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroText
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroNo
  }, "N\xBA ", String(idx + 1).padStart(2, '0'), " / ", String(LEGADO_CATALOGUE.length).padStart(2, '0'), "\xA0\xB7\xA0 Edici\xF3n 2026"), /*#__PURE__*/React.createElement("h1", {
    style: ppStyles.heroName
  }, piece.name), /*#__PURE__*/React.createElement("p", {
    style: ppStyles.heroBlurb
  }, piece.blurb), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroMeta
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroPrice
  }, piece.price.toLocaleString('es-ES'), " \u20AC"), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.heroEnvio
  }, "Hecho en 4 semanas \xB7 Env\xEDo incluido")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 18
    }
  }, /*#__PURE__*/React.createElement(Button, {
    onClick: () => {}
  }, "Encargar el ", piece.name)))), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.block
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockGrid
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockNo
  }, "02 \xB7 Materiales"), /*#__PURE__*/React.createElement("h3", {
    style: ppStyles.blockTitle
  }, "Lo que toca tu mano.")), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.matsRows
  }, piece.composition.map((line, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      ...ppStyles.matRow,
      ...(i === piece.composition.length - 1 ? ppStyles.matRowLast : null)
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: ppStyles.matLabel
  }, "Cap. ", String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", null, line)))))), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.block
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockGrid
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockNo
  }, "03 \xB7 Dimensiones"), /*#__PURE__*/React.createElement("h3", {
    style: ppStyles.blockTitle
  }, "Para que entre por la puerta.")), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.dimsWrap
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.dimsList
  }, Object.entries(piece.dimensions).map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: ppStyles.dimRow
  }, /*#__PURE__*/React.createElement("span", {
    style: ppStyles.dimLabel
  }, k), /*#__PURE__*/React.createElement("span", {
    style: ppStyles.dimVal
  }, v)))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(ChairDiagram, null))))), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.block
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockGrid
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockNo
  }, "04 \xB7 Postura"), /*#__PURE__*/React.createElement("h3", {
    style: ppStyles.blockTitle
  }, "Para qu\xE9 se sienta uno aqu\xED.")), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockBody
  }, /*#__PURE__*/React.createElement("p", null, piece.posture), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--fg2)',
      fontStyle: 'italic'
    }
  }, "No prometemos ergonom\xEDa con lenguaje m\xE9dico. Si lo necesitas, te recomendamos un especialista.")))), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.block
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockGrid
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockNo
  }, "05 \xB7 Garant\xEDa"), /*#__PURE__*/React.createElement("h3", {
    style: ppStyles.blockTitle
  }, "Veinte a\xF1os. Sin letra peque\xF1a.")), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockBody
  }, /*#__PURE__*/React.createElement("p", null, "Estructura: ", /*#__PURE__*/React.createElement("b", null, "20 a\xF1os"), ". Tapicer\xEDa y relleno: ", /*#__PURE__*/React.createElement("b", null, "5 a\xF1os"), ". Si se rompe, lo arreglamos. Si no se puede, te damos uno nuevo. Si tampoco, te devolvemos el dinero. En ese orden.")))), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.block
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockGrid
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockNo
  }, "06 \xB7 Preguntas"), /*#__PURE__*/React.createElement("h3", {
    style: ppStyles.blockTitle
  }, "Lo que casi todos preguntan.")), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.faq
  }, faqs.map((f, i) => /*#__PURE__*/React.createElement(FAQItem, {
    key: i,
    q: f.q,
    a: f.a,
    open: openFaq === i,
    onClick: () => setOpenFaq(openFaq === i ? -1 : i)
  }))))), /*#__PURE__*/React.createElement("section", {
    style: ppStyles.contactWrap
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.contactInner
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.contactSig
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.blockNo
  }, "07 \xB7 Hablamos"), /*#__PURE__*/React.createElement("p", {
    style: ppStyles.contactQuote
  }, "\xABAntes de comprar un sill\xF3n se piensa una semana. Si quieres pensar en voz alta, escr\xEDbeme.\xBB"), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.contactAttr
  }, "\u2014 Daniel L. \xB7 Fundador \xB7 hola@legado.es")), /*#__PURE__*/React.createElement("form", {
    style: ppStyles.contactForm,
    onSubmit: e => e.preventDefault()
  }, /*#__PURE__*/React.createElement("div", {
    style: ppStyles.field
  }, /*#__PURE__*/React.createElement("label", {
    style: ppStyles.fieldLabel
  }, "Tu nombre"), /*#__PURE__*/React.createElement("input", {
    style: ppStyles.fieldInput,
    placeholder: "Elena Vidal"
  })), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.field
  }, /*#__PURE__*/React.createElement("label", {
    style: ppStyles.fieldLabel
  }, "Email"), /*#__PURE__*/React.createElement("input", {
    style: ppStyles.fieldInput,
    placeholder: "tu@correo.es"
  })), /*#__PURE__*/React.createElement("div", {
    style: ppStyles.field
  }, /*#__PURE__*/React.createElement("label", {
    style: ppStyles.fieldLabel
  }, "Pregunta sobre el ", piece.name), /*#__PURE__*/React.createElement("input", {
    style: ppStyles.fieldInput,
    placeholder: "\xBFEl cuero llega ya patinado\u2026?"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(Button, null, "Enviar pregunta"))))));
}

// Simple line-art chair silhouette for the dimensions block — placeholder.
function ChairDiagram() {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 240 240",
    width: "100%",
    style: {
      maxWidth: 240,
      display: 'block',
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("g", {
    stroke: "var(--marfil)",
    strokeWidth: "0.6",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    opacity: "0.85"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M50 60 Q60 40 90 38 L150 38 Q180 40 190 60 L190 150 Q190 165 175 165 L65 165 Q50 165 50 150 Z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M70 165 L65 215 M170 165 L175 215"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M50 110 L40 110 L40 175 M190 110 L200 110 L200 175"
  })), /*#__PURE__*/React.createElement("g", {
    stroke: "var(--dorado)",
    strokeWidth: "0.4",
    strokeDasharray: "2 3"
  }, /*#__PURE__*/React.createElement("line", {
    x1: "40",
    y1: "225",
    x2: "200",
    y2: "225"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "40",
    y1: "225",
    x2: "40",
    y2: "220"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "200",
    y1: "225",
    x2: "200",
    y2: "220"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "222",
    y1: "38",
    x2: "222",
    y2: "215"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "218",
    y1: "38",
    x2: "222",
    y2: "38"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "218",
    y1: "215",
    x2: "222",
    y2: "215"
  })), /*#__PURE__*/React.createElement("text", {
    x: "120",
    y: "237",
    textAnchor: "middle",
    style: {
      font: '9px "Inter", sans-serif',
      letterSpacing: '0.2em',
      textTransform: 'uppercase'
    },
    fill: "var(--dorado)"
  }, "Ancho"), /*#__PURE__*/React.createElement("text", {
    x: "232",
    y: "130",
    textAnchor: "middle",
    transform: "rotate(90 232 130)",
    style: {
      font: '9px "Inter", sans-serif',
      letterSpacing: '0.2em',
      textTransform: 'uppercase'
    },
    fill: "var(--dorado)"
  }, "Alto"));
}
window.ProductPage = ProductPage;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProductPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Seal.jsx
try { (() => {
// Seal — circular brand mark.
// Manual §15 defines two operational variants:
//   · Sello completo (bitmap, single official asset received)
//   · Monograma LG (typographic, for favicons / small sizes)
// Use bitmap by default at any size; the typographic fallback (`mode="mono"`)
// is for nav/footer corners and social avatars.
//
// The official bitmap is cocoa-on-cream. To render the "brass on ébano"
// variant (manual §16, sello completo · brass), pass `tone="brass"` —
// an SVG color-matrix knocks out the cream paper and tints the ink to
// dorado #C9A86A, producing a fused foil-stamp look.

// Inject the goldify filter once per document
let __sealFilterInjected = false;
function ensureSealFilter() {
  if (__sealFilterInjected || typeof document === 'undefined') return;
  __sealFilterInjected = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.innerHTML = `
    <defs>
      <filter id="legado-goldify" color-interpolation-filters="sRGB">
        <feColorMatrix type="matrix" values="
          1 0 0 0 0
          0 1 0 0 0
          0 0 1 0 0
          -3 -3 -3 0 2.4"/>
        <feColorMatrix type="matrix" values="
          0 0 0 0 0.788
          0 0 0 0 0.659
          0 0 0 0 0.416
          0 0 0 1 0"/>
        <feGaussianBlur stdDeviation="0.35"/>
      </filter>
    </defs>`;
  document.body.appendChild(svg);
}
function Seal({
  size = 80,
  mode = 'auto',
  tone = 'cocoa'
}) {
  React.useEffect(() => {
    ensureSealFilter();
  }, []);
  const useBitmap = mode === 'bitmap' || mode === 'auto' && size >= 90;
  if (useBitmap) {
    // For brass and cream tones, run the bitmap through the goldify filter.
    const filtered = tone === 'brass' || tone === 'cream';
    return /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logo-seal.jpg",
      alt: "LEGADO \xB7 Sillones para toda la vida",
      style: {
        width: size,
        height: size,
        display: 'block',
        borderRadius: '50%',
        flexShrink: 0,
        filter: filtered ? 'url(#legado-goldify)' : 'none',
        mixBlendMode: filtered ? 'screen' : 'normal',
        opacity: filtered ? 0.92 : 1
      }
    });
  }

  // Monograma LG · constructed equivalent
  const palettes = {
    cocoa: {
      ring: 'var(--nogal)',
      text: 'var(--nogal)'
    },
    brass: {
      ring: 'var(--dorado)',
      text: 'var(--dorado)'
    },
    cream: {
      ring: 'var(--marfil)',
      text: 'var(--marfil)'
    }
  };
  const p = palettes[tone] || palettes.cocoa;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      border: `0.5px solid ${p.ring}`,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: p.text
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: size * 0.10,
      borderRadius: '50%',
      border: `0.5px solid ${p.ring}`,
      opacity: 0.55
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: size * 0.42,
      lineHeight: 1,
      letterSpacing: '-0.04em',
      color: p.text,
      position: 'relative'
    }
  }, "LG"));
}
window.Seal = Seal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Seal.jsx", error: String((e && e.message) || e) }); }

})();
