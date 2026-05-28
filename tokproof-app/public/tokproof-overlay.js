/**
 * Tokproof Exit Guide Overlay SDK  v1.0
 * Vanilla JS · no dependencies · <10KB minified
 *
 * Usage:
 *   window.TokproofExitGuide = { enabled: true, destinationUrl: "...", ... }
 *   <script async src="/tokproof-overlay.js"></script>
 *
 * Only activates inside TikTok WebView. Renders a fullscreen overlay on the
 * current page (no iframe, no DOM injection into TikTok's chrome, no hacks).
 */
;(function (w, d) {
  'use strict';

  /* ─────────────── Config ─────────────────────────────────────────────── */
  var cfg = Object.assign({
    enabled: true,
    destinationUrl: null,
    showOnlyInTikTok: true,
    autoRedirectOutsideWebView: true,
    redirectDelay: 800,
    locale: 'es',
    copy: { title: null, subtitle: null },
  }, w.TokproofExitGuide || {});

  /* ─────────────── i18n ───────────────────────────────────────────────── */
  var I18N = {
    es: {
      title:      'Para abrir esta página',
      subtitle:   'toca los {DOTS} y elige',
      pill:       'Abrir en el navegador',
      copyBtn:    'Copiar enlace',
      continueBtn:'Ya estoy en el navegador',
      copiedBtn:  'Enlace copiado ✓',
      stillWarn:  'Todavía estás dentro de TikTok. Toca los tres puntos arriba a la derecha y elige Abrir en navegador.',
      close:      'Cerrar',
    },
    en: {
      title:      'To open this page',
      subtitle:   'tap the {DOTS} and choose',
      pill:       'Open in browser',
      copyBtn:    'Copy link',
      continueBtn:"I'm already in browser",
      copiedBtn:  'Link copied ✓',
      stillWarn:  "You're still inside TikTok. Tap the three dots above and choose Open in browser.",
      close:      'Close',
    },
    pt: {
      title:      'Para abrir esta página',
      subtitle:   'toque nos {DOTS} e escolha',
      pill:       'Abrir no navegador',
      copyBtn:    'Copiar link',
      continueBtn:'Já estou no navegador',
      copiedBtn:  'Link copiado ✓',
      stillWarn:  'Você ainda está dentro do TikTok. Toque nos três pontos acima e escolha Abrir no navegador.',
      close:      'Fechar',
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
  var LOOP = '6.5s';
  var TAP  = '2.4s';

  function buildCSS() {
    var base = [
      /* reset & container */
      '#tkp-ov,#tkp-ov *{box-sizing:border-box;margin:0;padding:0;}',
      '#tkp-ov{position:fixed;inset:0;z-index:2147483646;',
        'font-family:-apple-system,"Inter",system-ui,sans-serif;',
        '-webkit-font-smoothing:antialiased;pointer-events:none;}',

      /* dim */
      '#tkp-dim{position:absolute;inset:0;',
        'background:rgba(8,4,18,.85);',
        'backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}',
      '@supports not (backdrop-filter:blur(2px)){#tkp-dim{background:rgba(8,4,18,.93);}}',

      /* sparkles */
      '#tkp-sparks{position:absolute;inset:0;pointer-events:none;}',
      '.tkp-sp{position:absolute;width:3px;height:3px;border-radius:50%;',
        'background:#fff;opacity:0;animation:tkpTwinkle 4s ease-in-out infinite;}',
      '@keyframes tkpTwinkle{0%,100%{opacity:0;transform:scale(.5);}50%{opacity:.8;transform:scale(1);}}',

      /* arrow svg */
      '#tkp-arrow{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}',
      '.tkp-aline{stroke:#fff;stroke-width:2.4;fill:none;stroke-linecap:round;stroke-linejoin:round;',
        'stroke-dasharray:600;stroke-dashoffset:600;',
        'filter:drop-shadow(0 0 6px rgba(255,79,216,.55));',
        'animation:tkpArrow ' + LOOP + ' cubic-bezier(.6,.05,.2,1) infinite;}',
      '@keyframes tkpArrow{',
        '0%,8%{stroke-dashoffset:600;opacity:0;}',
        '14%{opacity:1;}',
        '62%{stroke-dashoffset:0;opacity:1;}',
        '82%{opacity:1;}',
        '90%,100%{opacity:0;stroke-dashoffset:0;}}',

      /* ring pulse on cursor */
      '@keyframes tkpRingPulse{',
        '0%,30%{box-shadow:0 0 0 0 rgba(255,79,216,0);}',
        '38%,62%{box-shadow:0 0 0 5px rgba(255,79,216,.55),0 0 22px 4px rgba(255,79,216,.45);}',
        '70%,100%{box-shadow:0 0 0 0 rgba(255,79,216,0);}}',

      /* cursor circle */
      '#tkp-cursor{position:absolute;width:70px;height:70px;border-radius:50%;',
        'background:#fff;display:grid;place-items:center;color:#0E0B17;',
        'box-shadow:0 12px 40px rgba(255,79,216,.45),0 0 0 8px rgba(255,255,255,.08);',
        'left:calc(50% - 35px);top:54%;opacity:0;',
        'animation:tkpCursor ' + LOOP + ' cubic-bezier(.55,.05,.25,1) infinite;}',
      '@keyframes tkpCursor{',
        '0%,6%{opacity:0;transform:translateY(14px) scale(.85);}',
        '14%,80%{opacity:1;transform:translateY(0) scale(1);}',
        '88%,100%{opacity:0;transform:translateY(-6px) scale(.95);}}',

      /* popup */
      '#tkp-popup{position:absolute;top:calc(54% + 78px);left:50%;',
        'transform:translateX(-50%) scale(.8) translateY(-8px);',
        'transform-origin:top center;width:178px;',
        'background:rgba(28,22,42,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);',
        'border:1px solid rgba(255,255,255,.08);border-radius:14px;',
        'box-shadow:0 20px 50px rgba(0,0,0,.5);overflow:hidden;opacity:0;',
        'animation:tkpPopup ' + LOOP + ' cubic-bezier(.5,.1,.2,1) infinite;}',
      '@keyframes tkpPopup{',
        '0%,18%{opacity:0;transform:translateX(-50%) scale(.8) translateY(-8px);}',
        '26%,80%{opacity:1;transform:translateX(-50%) scale(1) translateY(0);}',
        '88%,100%{opacity:0;transform:translateX(-50%) scale(.95) translateY(-4px);}}',
      '#tkp-popup::before{content:"";position:absolute;top:-6px;left:50%;',
        'transform:translateX(-50%) rotate(45deg);width:10px;height:10px;',
        'background:rgba(28,22,42,.96);',
        'border-left:1px solid rgba(255,255,255,.08);border-top:1px solid rgba(255,255,255,.08);}',

      /* popup items */
      '.tkp-pi{display:flex;align-items:center;gap:9px;padding:10px 12px;',
        'font-size:12px;color:rgba(255,255,255,.78);font-weight:500;',
        'border-bottom:1px solid rgba(255,255,255,.05);position:relative;}',
      '.tkp-pi:last-child{border-bottom:0;}',
      '.tkp-ic{color:rgba(255,255,255,.5);display:flex;flex-shrink:0;}',
      '.tkp-hl{color:#fff;background:linear-gradient(90deg,rgba(255,79,216,.22),rgba(123,97,255,.22));}',
      '.tkp-hl::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;',
        'background:linear-gradient(180deg,#FF4FD8,#7B61FF);}',
      '.tkp-hl .tkp-ic{color:#fff;}',

      /* hand tap */
      '.tkp-hand{position:absolute;top:14px;left:28px;color:#fff;',
        'filter:drop-shadow(0 4px 12px rgba(255,79,216,.7));opacity:0;',
        'transform-origin:30% 0%;',
        'animation:tkpHand ' + TAP + ' cubic-bezier(.5,.1,.2,1) infinite;pointer-events:none;}',
      '.tkp-hand::after{content:"";position:absolute;left:8px;top:10px;',
        'width:14px;height:14px;border-radius:50%;border:2px solid #fff;opacity:0;',
        'animation:tkpRing ' + TAP + ' cubic-bezier(.3,.7,.4,1) infinite;}',
      '@keyframes tkpHand{',
        '0%{opacity:0;transform:translate(28px,36px) scale(.3);}',
        '18%{opacity:1;transform:translate(20px,26px) scale(.55);}',
        '52%{opacity:1;transform:translate(0,0) scale(1);}',
        '62%{opacity:1;transform:translate(-2px,-2px) scale(1.12);}',
        '72%{opacity:1;transform:translate(2px,4px) scale(.88);}',
        '82%{opacity:1;transform:translate(0,0) scale(1);}',
        '100%{opacity:0;transform:translate(0,0) scale(1);}}',
      '@keyframes tkpRing{',
        '0%,68%{opacity:0;transform:scale(.3);}',
        '72%{opacity:.9;transform:scale(.5);}',
        '84%,100%{opacity:0;transform:scale(2.4);}}',

      /* caption */
      '#tkp-caption{position:absolute;top:calc(54% + 78px + 88px + 14px);',
        'left:24px;right:24px;text-align:center;opacity:0;',
        'animation:tkpCap ' + LOOP + ' ease-out infinite;}',
      '@keyframes tkpCap{',
        '0%,10%{opacity:0;transform:translateY(8px);}',
        '18%,84%{opacity:1;transform:translateY(0);}',
        '92%,100%{opacity:0;transform:translateY(-4px);}}',
      '.tkp-t1{font-size:19px;font-weight:700;color:#fff;letter-spacing:-0.02em;}',
      '.tkp-t2{font-size:14px;color:rgba(255,255,255,.78);margin-top:12px;line-height:1.55;}',
      '.tkp-dots{display:inline-flex;align-items:center;gap:3px;',
        'padding:3px 9px;border-radius:999px;',
        'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);',
        'color:#fff;font-weight:700;margin:0 2px;vertical-align:1px;}',
      '.tkp-dots i{width:3px;height:3px;border-radius:50%;background:#fff;display:inline-block;}',
      '.tkp-pill{display:inline-flex;align-items:center;',
        'padding:3px 10px;border-radius:999px;',
        'background:linear-gradient(135deg,rgba(255,79,216,.22),rgba(123,97,255,.22));',
        'border:1px solid rgba(255,79,216,.35);color:#fff;font-weight:600;margin-top:4px;}',

      /* action buttons */
      '#tkp-actions{position:absolute;bottom:28px;left:24px;right:24px;',
        'display:flex;flex-direction:column;gap:10px;pointer-events:auto;}',
      '.tkp-btn{width:100%;padding:13px 18px;border-radius:999px;',
        'font-size:14px;font-weight:600;font-family:inherit;',
        'border:none;cursor:pointer;',
        'display:flex;align-items:center;justify-content:center;gap:8px;',
        'transition:opacity .15s ease,transform .12s ease,background .18s ease,color .18s ease;}',
      '.tkp-btn:active{transform:scale(.97);}',
      '#tkp-copy{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#fff;}',
      '#tkp-copy.tkp-copied{background:rgba(255,79,216,.2);border-color:rgba(255,79,216,.45);color:#FF4FD8;}',
      '#tkp-go{background:linear-gradient(135deg,#FF4FD8 0%,#7B61FF 100%);color:#fff;',
        'box-shadow:0 10px 30px rgba(255,79,216,.35);}',
      '#tkp-warn{display:none;margin-top:4px;padding:10px 14px;border-radius:12px;',
        'background:rgba(255,79,216,.12);border:1px solid rgba(255,79,216,.3);',
        'font-size:12px;color:rgba(255,255,255,.88);text-align:center;line-height:1.5;}',
      '#tkp-warn.tkp-show{display:block;}',

      /* close button */
      '#tkp-close{position:absolute;top:20px;right:20px;',
        'width:36px;height:36px;border-radius:50%;',
        'background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);',
        'color:rgba(255,255,255,.85);cursor:pointer;pointer-events:auto;',
        'display:grid;place-items:center;',
        'font-size:18px;line-height:1;font-family:system-ui;',
        'transition:background .15s ease;}',
      '#tkp-close:hover{background:rgba(255,255,255,.2);}',

      /* sig */
      '#tkp-sig{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);display:none;}',
    ].join('');

    if (reducedMotion) {
      return base + [
        '.tkp-aline,.tkp-hand,.tkp-hand::after,.tkp-sp{animation:none!important;}',
        '#tkp-cursor{animation:none!important;opacity:1;transform:translateY(0) scale(1);}',
        '#tkp-popup{animation:none!important;opacity:1;',
          'transform:translateX(-50%) scale(1) translateY(0);}',
        '#tkp-caption{animation:none!important;opacity:1;transform:translateY(0);}',
      ].join('');
    }
    return base;
  }

  /* ─────────────── HTML ───────────────────────────────────────────────── */
  var DOTS_HTML  = '<span class="tkp-dots"><i></i><i></i><i></i></span>';
  var SUBTITLE   = S.subtitle.replace('{DOTS}', DOTS_HTML);

  var SVG_COPY   = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var SVG_COMPASS= '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" fill="currentColor" fill-opacity=".2"/></svg>';
  var SVG_HAND   = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V6a2 2 0 0 1 4 0v5"/><path d="M13 9a2 2 0 0 1 4 0v3"/><path d="M17 10a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-1l-3-3a2 2 0 0 1 3-3l2 2"/></svg>';
  var SVG_DOTS   = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="19" cy="12" r="1.9"/></svg>';
  var SVG_LINK   = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  var SVG_CHECK  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var SVG_ARROW  = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>';

  function buildHTML() {
    return '<div id="tkp-ov">' +
      '<div id="tkp-dim"></div>' +
      '<div id="tkp-sparks">' +
        '<span class="tkp-sp" style="left:18%;top:30%;animation-delay:.4s"></span>' +
        '<span class="tkp-sp" style="left:78%;top:18%;animation-delay:1.2s"></span>' +
        '<span class="tkp-sp" style="left:82%;top:60%;animation-delay:2.1s"></span>' +
        '<span class="tkp-sp" style="left:14%;top:72%;animation-delay:.8s"></span>' +
      '</div>' +
      '<svg id="tkp-arrow" viewBox="0 0 360 740" preserveAspectRatio="none">' +
        '<path class="tkp-aline" d="M 195 500 C 290 450, 330 240, 325 14 l -16 22 l 16 -22 l 14 22"/>' +
      '</svg>' +
      '<div id="tkp-cursor">' + SVG_DOTS + '</div>' +
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
      '<div id="tkp-actions">' +
        '<button id="tkp-copy" class="tkp-btn">' + SVG_LINK + ' ' + S.copyBtn + '</button>' +
        '<button id="tkp-go"   class="tkp-btn">' + S.continueBtn + ' ' + SVG_ARROW + '</button>' +
        '<div id="tkp-warn">' + S.stillWarn + '</div>' +
      '</div>' +
      '<button id="tkp-close" aria-label="' + S.close + '">&#x2715;</button>' +
    '</div>';
  }

  /* ─────────────── Mount ──────────────────────────────────────────────── */
  function mount() {
    /* inject CSS */
    var styleEl = d.createElement('style');
    styleEl.id  = 'tkp-css';
    styleEl.textContent = buildCSS();
    d.head.appendChild(styleEl);

    /* inject HTML */
    var tmp = d.createElement('div');
    tmp.innerHTML = buildHTML();
    d.body.appendChild(tmp.firstElementChild);

    /* ── close ── */
    d.getElementById('tkp-close').addEventListener('click', function () {
      dismiss();
      track('exit_guide_closed');
    });

    /* ── copy link ── */
    var copyBtn = d.getElementById('tkp-copy');
    copyBtn.addEventListener('click', function () {
      var url = w.location.href;
      var ok  = function () {
        copyBtn.innerHTML = SVG_CHECK + ' ' + S.copiedBtn;
        copyBtn.classList.add('tkp-copied');
        setTimeout(function () {
          copyBtn.innerHTML = SVG_LINK + ' ' + S.copyBtn;
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

    /* ── already in browser ── */
    d.getElementById('tkp-go').addEventListener('click', function () {
      track('exit_manual_continue');
      if (!isTikTok()) {
        if (cfg.destinationUrl) {
          w.location.href = cfg.destinationUrl;
        } else {
          dismiss();
        }
      } else {
        track('exit_still_in_webview');
        var warn = d.getElementById('tkp-warn');
        warn.classList.add('tkp-show');
        setTimeout(function () { warn.classList.remove('tkp-show'); }, 5000);
      }
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
      if (cfg.autoRedirectOutsideWebView && cfg.destinationUrl) {
        setTimeout(function () { w.location.href = cfg.destinationUrl; }, cfg.redirectDelay);
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
