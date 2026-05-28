/**
 * Tokproof Exit Guide Overlay SDK  v2.0
 * Vanilla JS · no dependencies · <10KB minified
 *
 * Usage:
 *   window.TokproofExitGuide = { enabled: true, destinationUrl: "...", ... }
 *   <script async src="/tokproof-overlay.js"></script>
 *
 * Only activates inside TikTok WebView. Outside TikTok → instant redirect.
 */
;(function (w, d) {
  'use strict';

  /* ─────────────── Config ─────────────────────────────────────────────── */
  var cfg = Object.assign({
    enabled: true,
    destinationUrl: null,
    showOnlyInTikTok: true,
    autoRedirectOutsideWebView: true,
    locale: 'es',
    copy: { title: null, subtitle: null },
  }, w.TokproofExitGuide || {});

  /* ─────────────── i18n ───────────────────────────────────────────────── */
  var I18N = {
    es: {
      title:      'Para abrir esta página',
      subtitle:   'toca los {DOTS} y elige',
      pill:       'Abrir en el navegador',
      copyBtn:    'Copiar enlace',
      copiedBtn:  'Enlace copiado ✓',
      close:      'Cerrar',
      opening:    'Abriendo producto oficial…',
      noRedirect: '¿No redirige? Toca aquí',
    },
    en: {
      title:      'To open this page',
      subtitle:   'tap the {DOTS} and choose',
      pill:       'Open in browser',
      copyBtn:    'Copy link',
      copiedBtn:  'Link copied ✓',
      close:      'Close',
      opening:    'Opening product…',
      noRedirect: "Not redirecting? Tap here",
    },
    pt: {
      title:      'Para abrir esta página',
      subtitle:   'toque nos {DOTS} e escolha',
      pill:       'Abrir no navegador',
      copyBtn:    'Copiar link',
      copiedBtn:  'Link copiado ✓',
      close:      'Fechar',
      opening:    'Abrindo produto oficial…',
      noRedirect: 'Não redirecionou? Toque aqui',
    },
  };
  var S = I18N[cfg.locale] || I18N.es;
  if (cfg.copy && cfg.copy.title)    S.title    = cfg.copy.title;
  if (cfg.copy && cfg.copy.subtitle) S.subtitle = cfg.copy.subtitle;

  /* ─────────────── Detection ─────────────────────────────────────────── */
  function isTikTok() {
    var ua  = navigator.userAgent || '';
    var ref = (d.referrer || '');
    return /TikTok|musical_ly|BytedanceWebview|ByteLocale|com\.zhiliaoapp/i.test(ua)
        || /tiktok\.com/i.test(ref);
  }

  /* ─────────────── Analytics ─────────────────────────────────────────── */
  function track(ev, data) {
    if (typeof w.tokproofTrack === 'function') {
      try { w.tokproofTrack(ev, Object.assign({ sdk: true }, data || {})); } catch(e) {}
    }
  }

  /* ─────────────── CSS ────────────────────────────────────────────────── */
  var reducedMotion = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOOP = '5s';
  var TAP  = '2.2s';

  function buildCSS() {
    var base = [
      /* reset & container */
      '#tkp-ov,#tkp-ov *{box-sizing:border-box;margin:0;padding:0;}',
      '#tkp-ov{position:fixed;inset:0;z-index:2147483646;',
        'font-family:-apple-system,"Inter",system-ui,sans-serif;',
        '-webkit-font-smoothing:antialiased;pointer-events:none;}',

      /* dim */
      '#tkp-dim{position:absolute;inset:0;',
        'background:rgba(8,4,18,.40);',
        'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}',
      '@supports not (backdrop-filter:blur(2px)){#tkp-dim{background:rgba(8,4,18,.88);}}',

      /* sparkles */
      '#tkp-sparks{position:absolute;inset:0;pointer-events:none;}',
      '.tkp-sp{position:absolute;width:3px;height:3px;border-radius:50%;',
        'background:#fff;opacity:0;animation:tkpTwinkle 4s ease-in-out infinite;}',
      '@keyframes tkpTwinkle{0%,100%{opacity:0;transform:scale(.5);}50%{opacity:.8;transform:scale(1);}}',

      /* arrow svg — z-index 5 */
      '#tkp-arrow{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;}',
      '.tkp-aline{stroke:#fff;stroke-width:2.4;fill:none;stroke-linecap:round;stroke-linejoin:round;',
        'stroke-dasharray:600;stroke-dashoffset:600;',
        'filter:drop-shadow(0 0 6px rgba(255,79,216,.55));',
        'animation:tkpArrow ' + LOOP + ' cubic-bezier(.5,0,.2,1) infinite;}',
      '@keyframes tkpArrow{',
        '0%{stroke-dashoffset:600;opacity:0;}',
        '4%{opacity:1;}',
        '26%{stroke-dashoffset:0;opacity:1;}',
        '86%{stroke-dashoffset:0;opacity:1;}',
        '94%,100%{stroke-dashoffset:0;opacity:0;}}',

      /* centered flex stack — z-index 6 */
      '#tkp-stack{position:absolute;inset:0;z-index:6;',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;',
        'padding:0 28px;}',

      /* cursor circle */
      '#tkp-cursor{width:68px;height:68px;border-radius:50%;flex-shrink:0;',
        'background:#fff;display:grid;place-items:center;color:#0E0B17;',
        'box-shadow:0 12px 40px rgba(255,79,216,.45),0 0 0 8px rgba(255,255,255,.08);',
        'opacity:0;animation:tkpCursor ' + LOOP + ' cubic-bezier(.55,.05,.25,1) infinite;}',
      '@keyframes tkpCursor{',
        '0%,2%{opacity:0;transform:translateY(10px) scale(.85);}',
        '8%,86%{opacity:1;transform:translateY(0) scale(1);}',
        '94%,100%{opacity:0;transform:translateY(-6px) scale(.95);}}',

      /* popup — margin-top:14px, centered by flex parent */
      '#tkp-popup{margin-top:14px;flex-shrink:0;width:188px;',
        'background:rgba(28,22,42,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
        'border:1px solid rgba(255,255,255,.08);border-radius:14px;',
        'box-shadow:0 20px 50px rgba(0,0,0,.5);overflow:hidden;position:relative;',
        'opacity:0;transform-origin:top center;',
        'animation:tkpPopup ' + LOOP + ' cubic-bezier(.5,.1,.2,1) infinite;}',
      '@keyframes tkpPopup{',
        '0%,10%{opacity:0;transform:scale(.85) translateY(-6px);}',
        '18%,86%{opacity:1;transform:scale(1) translateY(0);}',
        '94%,100%{opacity:0;transform:scale(.95) translateY(-4px);}}',
      '#tkp-popup::before{content:"";position:absolute;top:-6px;left:50%;',
        'transform:translateX(-50%) rotate(45deg);width:10px;height:10px;',
        'background:rgba(28,22,42,.96);',
        'border-left:1px solid rgba(255,255,255,.08);border-top:1px solid rgba(255,255,255,.08);}',

      /* popup items */
      '.tkp-pi{display:flex;align-items:center;gap:10px;padding:11px 13px;',
        'font-size:12.5px;color:rgba(255,255,255,.78);font-weight:500;',
        'border-bottom:1px solid rgba(255,255,255,.05);position:relative;}',
      '.tkp-pi:last-child{border-bottom:0;}',
      '.tkp-ic{color:rgba(255,255,255,.5);display:flex;flex-shrink:0;}',
      '.tkp-hl{color:#fff;background:linear-gradient(90deg,rgba(255,79,216,.22),rgba(123,97,255,.22));}',
      '.tkp-hl::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;',
        'background:linear-gradient(180deg,#FF4FD8,#7B61FF);}',
      '.tkp-hl .tkp-ic{color:#fff;}',

      /* hand tap */
      '.tkp-hand{position:absolute;top:14px;left:30px;color:#fff;',
        'filter:drop-shadow(0 4px 12px rgba(255,79,216,.7));opacity:0;',
        'transform-origin:30% 0%;',
        'animation:tkpHand ' + TAP + ' cubic-bezier(.5,.1,.2,1) infinite;pointer-events:none;}',
      '.tkp-hand::after{content:"";position:absolute;left:8px;top:10px;',
        'width:14px;height:14px;border-radius:50%;border:2px solid #fff;opacity:0;',
        'animation:tkpRing ' + TAP + ' cubic-bezier(.3,.7,.4,1) infinite;}',
      '@keyframes tkpHand{',
        '0%{opacity:0;transform:translate(28px,34px) scale(.3);}',
        '18%{opacity:1;transform:translate(20px,24px) scale(.55);}',
        '52%{opacity:1;transform:translate(0,0) scale(1);}',
        '62%{opacity:1;transform:translate(-2px,-2px) scale(1.12);}',
        '72%{opacity:1;transform:translate(2px,4px) scale(.88);}',
        '82%{opacity:1;transform:translate(0,0) scale(1);}',
        '100%{opacity:0;transform:translate(0,0) scale(1);}}',
      '@keyframes tkpRing{',
        '0%,68%{opacity:0;transform:scale(.3);}',
        '72%{opacity:.9;transform:scale(.5);}',
        '84%,100%{opacity:0;transform:scale(2.4);}}',

      /* caption — always visible, margin-top:34px */
      '#tkp-caption{margin-top:34px;text-align:center;}',
      '.tkp-t1{font-size:20px;font-weight:700;color:#fff;letter-spacing:-0.02em;}',
      '.tkp-t2{font-size:14px;color:rgba(255,255,255,.78);margin-top:12px;line-height:1.6;}',
      '.tkp-dots{display:inline-flex;align-items:center;gap:3px;',
        'padding:3px 9px;border-radius:999px;',
        'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);',
        'color:#fff;font-weight:700;margin:0 2px;vertical-align:1px;}',
      '.tkp-dots i{width:3px;height:3px;border-radius:50%;background:#fff;display:inline-block;}',
      '.tkp-pill{display:inline-flex;align-items:center;',
        'padding:3px 10px;border-radius:999px;',
        'background:linear-gradient(135deg,rgba(255,79,216,.22),rgba(123,97,255,.22));',
        'border:1px solid rgba(255,79,216,.35);color:#fff;font-weight:600;margin-top:6px;}',

      /* divider "o" — margin-top:30px */
      '#tkp-divider{margin-top:30px;display:flex;align-items:center;gap:12px;',
        'width:150px;color:rgba(255,255,255,.42);font-size:12px;font-weight:500;}',
      '#tkp-divider span{flex:1;height:1px;background:rgba(255,255,255,.14);}',

      /* copy button — secondary pill, margin-top:22px */
      '#tkp-copy{margin-top:22px;display:inline-flex;align-items:center;gap:7px;',
        'padding:9px 16px;',
        'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);',
        'border-radius:999px;color:rgba(255,255,255,.72);',
        'font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;',
        'transition:background .15s ease,border-color .15s ease,color .15s ease;',
        'pointer-events:auto;}',
      '#tkp-copy:hover{background:rgba(255,255,255,.1);color:#fff;}',
      '#tkp-copy.tkp-copied{background:rgba(255,79,216,.2);',
        'border-color:rgba(255,79,216,.45);color:#FF4FD8;}',

      /* close button */
      '#tkp-close{position:absolute;top:20px;right:20px;z-index:7;',
        'width:36px;height:36px;border-radius:50%;',
        'background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);',
        'color:rgba(255,255,255,.85);cursor:pointer;pointer-events:auto;',
        'display:grid;place-items:center;',
        'font-size:18px;line-height:1;font-family:system-ui;',
        'transition:background .15s ease;}',
      '#tkp-close:hover{background:rgba(255,255,255,.2);}',
    ].join('');

    if (reducedMotion) {
      return base + [
        '.tkp-aline{animation:none!important;stroke-dashoffset:0;opacity:1;}',
        '#tkp-cursor{animation:none!important;opacity:1;transform:none;}',
        '#tkp-popup{animation:none!important;opacity:1;transform:none;}',
        '.tkp-hand{animation:none!important;opacity:1;transform:translate(0,0) scale(1);}',
        '.tkp-hand::after{animation:none!important;}',
      ].join('');
    }
    return base;
  }

  /* ─────────────── SVGs ───────────────────────────────────────────────── */
  var SVG_COPY    = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var SVG_COMPASS = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fill-opacity=".2"/></svg>';
  var SVG_HAND    = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v5"/><path d="M13 9a2 2 0 0 1 4 0v3"/><path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/></svg>';
  var SVG_DOTS_BIG= '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>';
  var SVG_CHECK   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  /* ─────────────── HTML ───────────────────────────────────────────────── */
  var DOTS_HTML = '<span class="tkp-dots"><i></i><i></i><i></i></span>';
  var SUBTITLE  = S.subtitle.replace('{DOTS}', DOTS_HTML);

  function buildHTML() {
    return '<div id="tkp-ov">' +
      '<div id="tkp-dim"></div>' +
      '<div id="tkp-sparks">' +
        '<span class="tkp-sp" style="left:18%;top:24%;animation-delay:.4s"></span>' +
        '<span class="tkp-sp" style="left:80%;top:18%;animation-delay:1.2s"></span>' +
        '<span class="tkp-sp" style="left:84%;top:54%;animation-delay:2.1s"></span>' +
        '<span class="tkp-sp" style="left:14%;top:64%;animation-delay:.8s"></span>' +
      '</div>' +
      '<svg id="tkp-arrow" viewBox="0 0 360 740" preserveAspectRatio="none">' +
        '<path class="tkp-aline" d="M 220 300 C 300 250, 332 150, 325 14 l -15 21 l 15 -21 l 14 21"/>' +
      '</svg>' +
      '<div id="tkp-stack">' +
        '<div id="tkp-cursor">' + SVG_DOTS_BIG + '</div>' +
        '<div id="tkp-popup">' +
          '<div class="tkp-pi"><span class="tkp-ic">' + SVG_COPY + '</span>' + S.copyBtn + '</div>' +
          '<div class="tkp-pi tkp-hl"><span class="tkp-ic">' + SVG_COMPASS + '</span>' + S.pill +
            '<span class="tkp-hand">' + SVG_HAND + '</span>' +
          '</div>' +
        '</div>' +
        '<div id="tkp-caption">' +
          '<div class="tkp-t1">' + S.title + '</div>' +
          '<div class="tkp-t2">' + SUBTITLE + '<br><span class="tkp-pill">' + S.pill + '</span></div>' +
        '</div>' +
        '<div id="tkp-divider"><span></span>o<span></span></div>' +
        '<button id="tkp-copy">' + SVG_COPY + ' ' + S.copyBtn + '</button>' +
      '</div>' +
      '<button id="tkp-close" aria-label="' + S.close + '">&#x2715;</button>' +
    '</div>';
  }

  /* ─────────────── Redirect screen (outside TikTok) ──────────────────── */
  function mountRedirectScreen(dest) {
    var css = d.createElement('style');
    css.textContent = [
      '#tkp-redir{position:fixed;inset:0;z-index:2147483646;',
        'background:rgba(8,4,18,.92);',
        'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;',
        'font-family:-apple-system,"Inter",system-ui,sans-serif;',
        '-webkit-font-smoothing:antialiased;',
        'animation:tkpFdIn .3s ease both;}',
      '@keyframes tkpFdIn{from{opacity:0;}to{opacity:1;}}',
      '#tkp-redir-icon{width:52px;height:52px;border-radius:16px;',
        'background:linear-gradient(135deg,#FF4FD8,#7B61FF);',
        'display:grid;place-items:center;}',
      '#tkp-redir-msg{margin-top:16px;color:rgba(255,255,255,.78);',
        'font-size:15px;font-weight:500;}',
      '#tkp-redir-spin{display:none;margin-top:20px;width:28px;height:28px;',
        'border:2.5px solid rgba(255,255,255,.15);border-top-color:#FF4FD8;',
        'border-radius:50%;animation:tkpSpin .7s linear infinite;}',
      '@keyframes tkpSpin{to{transform:rotate(360deg);}}',
      '#tkp-redir-link{display:none;margin-top:14px;font-size:13px;',
        'color:rgba(255,79,216,.9);text-decoration:underline;cursor:pointer;',
        'background:none;border:none;font-family:inherit;}',
    ].join('');
    d.head.appendChild(css);

    var el = d.createElement('div');
    el.id = 'tkp-redir';
    el.innerHTML =
      '<div id="tkp-redir-icon">' +
        '<svg width="22" height="8" viewBox="0 0 22 8" fill="white">' +
          '<circle cx="3" cy="4" r="3"/><circle cx="11" cy="4" r="3"/><circle cx="19" cy="4" r="3"/>' +
        '</svg>' +
      '</div>' +
      '<div id="tkp-redir-msg">' + S.opening + '</div>' +
      '<div id="tkp-redir-spin"></div>' +
      '<button id="tkp-redir-link" onclick="location.href=\'' + dest.replace(/'/g, "\\'") + '\'">' +
        S.noRedirect +
      '</button>';
    d.body.appendChild(el);

    /* Fire redirect immediately */
    try { w.location.replace(dest); } catch(e) { w.location.href = dest; }

    /* Spinner + manual link only if still here after 800ms */
    var t = setTimeout(function () {
      var spin = d.getElementById('tkp-redir-spin');
      var link = d.getElementById('tkp-redir-link');
      if (spin) spin.style.display = 'block';
      if (link) link.style.display = 'block';
    }, 800);

    /* Cancel timer if navigation succeeds */
    try { w.addEventListener('pagehide', function () { clearTimeout(t); }); } catch(e) {}
  }

  /* ─────────────── Mount ──────────────────────────────────────────────── */
  function mount() {
    var styleEl = d.createElement('style');
    styleEl.id  = 'tkp-css';
    styleEl.textContent = buildCSS();
    d.head.appendChild(styleEl);

    var tmp = d.createElement('div');
    tmp.innerHTML = buildHTML();
    d.body.appendChild(tmp.firstElementChild);

    /* close */
    d.getElementById('tkp-close').addEventListener('click', function () {
      dismiss();
      track('exit_guide_closed');
    });

    /* copy link */
    var copyBtn = d.getElementById('tkp-copy');
    copyBtn.addEventListener('click', function () {
      var url = cfg.destinationUrl || w.location.href;
      var ok = function () {
        copyBtn.innerHTML = SVG_CHECK + ' ' + S.copiedBtn;
        copyBtn.classList.add('tkp-copied');
        setTimeout(function () {
          copyBtn.innerHTML = SVG_COPY + ' ' + S.copyBtn;
          copyBtn.classList.remove('tkp-copied');
        }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(ok).catch(function () {});
      } else {
        try {
          var ta = d.createElement('textarea');
          ta.value = url;
          ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;';
          d.body.appendChild(ta);
          ta.focus(); ta.select();
          d.execCommand('copy');
          d.body.removeChild(ta);
          ok();
        } catch(e) {}
      }
      track('exit_copy_link', { url: url });
    });

    track('exit_guide_shown');
  }

  /* ─────────────── Dismiss ────────────────────────────────────────────── */
  function dismiss() {
    try { sessionStorage.setItem('tkp_dismissed', '1'); } catch(e) {}
    var el = d.getElementById('tkp-ov');
    if (el) {
      el.style.cssText += 'transition:opacity .25s ease;opacity:0;';
      setTimeout(function () { el.parentNode && el.parentNode.removeChild(el); }, 270);
    }
    var css = d.getElementById('tkp-css');
    if (css) setTimeout(function () { css.parentNode && css.parentNode.removeChild(css); }, 300);
  }

  /* ─────────────── Init ───────────────────────────────────────────────── */
  function init() {
    if (!cfg.enabled) return;

    var inTikTok = isTikTok();

    if (!inTikTok) {
      /* Outside TikTok: instant redirect with minimal screen */
      if (cfg.autoRedirectOutsideWebView && cfg.destinationUrl) {
        mountRedirectScreen(cfg.destinationUrl);
      }
      return;
    }

    var dismissed;
    try { dismissed = sessionStorage.getItem('tkp_dismissed'); } catch(e) {}
    if (dismissed) return;

    mount();
  }

  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ─────────────── Public API ─────────────────────────────────────────── */
  w.TokproofSDK = { isTikTok: isTikTok, mount: mount, dismiss: dismiss };

}(window, document));
