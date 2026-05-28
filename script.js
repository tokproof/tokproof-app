/* ===========================
   TOKPROOF — script.js
   =========================== */

// === HEADER SCROLL ===
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// === MOBILE NAV ===
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileClose = document.getElementById('mobileClose');

hamburger.addEventListener('click', () => {
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
});
mobileClose.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
});
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// === SCROLL REVEAL ===
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// === SMOOTH SCROLL FOR NAV ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// === LIVE EDITOR PREVIEW ===
const editorFields = {
  edBrandName:    '.emp-logo',
  edProductName:  '.emp-product',
  edHeadline:     '#empHeadline',
  edCta:          '.emp-cta',
  edSocialProof:  '.emp-proof',
  edPrice:        '.emp-price',
};

Object.entries(editorFields).forEach(([inputId, selector]) => {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.addEventListener('input', () => {
    document.querySelectorAll(selector).forEach(el => {
      el.textContent = input.value || el.dataset.default || el.textContent;
    });
  });
});

// Color theme picker
document.querySelectorAll('.color-swatch').forEach(swatch => {
  swatch.addEventListener('click', () => {
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    const color = swatch.dataset.color;
    document.querySelectorAll('.emp-price').forEach(el => el.style.color = color);
    document.querySelectorAll('.emp-cta').forEach(el => {
      el.style.background = `linear-gradient(135deg, ${color}, #FE2C55)`;
    });
    document.querySelectorAll('.dp-cta-btn').forEach(el => {
      el.style.background = `linear-gradient(135deg, ${color}, #FE2C55)`;
    });
  });
});

// Block toggles
document.querySelectorAll('.block-toggle').forEach(toggle => {
  toggle.addEventListener('click', () => {
    const sw = toggle.querySelector('.toggle-switch');
    sw.classList.toggle('on');
    const blockKey = toggle.dataset.block;
    const block = document.querySelector(`[data-preview-block="${blockKey}"]`);
    if (block) {
      block.style.display = sw.classList.contains('on') ? '' : 'none';
    }
  });
});

// === FAQ ACCORDION (demo phone) ===
document.querySelectorAll('.dp-faq-q').forEach(q => {
  q.addEventListener('click', () => {
    const faq = q.closest('.dp-faq');
    const answer = faq.querySelector('.dp-faq-a');
    const icon = q.querySelector('.faq-chevron');
    const isOpen = answer.style.display === 'block';
    answer.style.display = isOpen ? 'none' : 'block';
    if (icon) icon.textContent = isOpen ? '›' : '‹';
  });
});

// === LIKE BUTTONS ===
document.querySelectorAll('.like-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('liked');
    const count = btn.querySelector('.like-count');
    if (count) {
      let n = parseInt(count.textContent.replace(/[^0-9]/g, '')) || 0;
      count.textContent = btn.classList.contains('liked') ? n + 1 : n - 1;
    }
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => btn.style.transform = '', 200);
  });
});

// === PRICING TOGGLE ===
const pricingToggle = document.getElementById('pricingToggle');
const pricingPrices = document.querySelectorAll('.pricing-price-val');
const pricingPeriod = document.getElementById('pricingPeriod');

const monthly = ['$0', '$29', '$79'];
const annual  = ['$0', '$19', '$49'];

if (pricingToggle) {
  pricingToggle.addEventListener('change', () => {
    const isAnnual = pricingToggle.checked;
    pricingPrices.forEach((el, i) => {
      el.textContent = isAnnual ? annual[i] : monthly[i];
    });
    if (pricingPeriod) {
      pricingPeriod.textContent = isAnnual ? '/mo, billed annually' : '/mo';
    }
  });
}

// === ANIMATED COUNTERS ===
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = target * ease;
    const display = target % 1 === 0 ? Math.floor(value) : value.toFixed(1);
    el.textContent = prefix + display + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.dataset.animated) {
      entry.target.dataset.animated = 'true';
      animateCounter(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// === DEMO PAGE SCROLL ANIMATION ===
const demoScreen = document.querySelector('.demo-screen');
if (demoScreen) {
  let autoScrolling = true;
  let scrollPos = 0;
  let direction = 1;

  function autoScroll() {
    if (!autoScrolling) return;
    scrollPos += 0.4 * direction;
    const max = demoScreen.scrollHeight - demoScreen.clientHeight;
    if (scrollPos >= max) direction = -1;
    if (scrollPos <= 0) direction = 1;
    demoScreen.scrollTop = scrollPos;
    requestAnimationFrame(autoScroll);
  }

  demoScreen.addEventListener('mouseenter', () => { autoScrolling = false; });
  demoScreen.addEventListener('mouseleave', () => {
    autoScrolling = true;
    autoScroll();
  });
  demoScreen.addEventListener('touchstart', () => { autoScrolling = false; }, { passive: true });

  setTimeout(autoScroll, 2000);
}

// === SIDEBAR NAVIGATION (editor) ===
document.querySelectorAll('.sidebar-nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

// === DEVICE TOGGLE (editor preview) ===
document.querySelectorAll('.device-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// === TIKTOK COMMENT TYPEWRITER (mini phone hero) ===
const phrases = [
  'Just got mine!! 🔥🔥',
  'This actually works omg',
  'Free shipping too??',
  'Ordering rn no cap',
  '5 stars hands down ⭐',
];
let phraseIdx = 0;
const typingEl = document.getElementById('typingComment');
if (typingEl) {
  function typePhrase() {
    const phrase = phrases[phraseIdx % phrases.length];
    typingEl.textContent = '';
    let charIdx = 0;
    const typeInterval = setInterval(() => {
      typingEl.textContent += phrase[charIdx++];
      if (charIdx >= phrase.length) {
        clearInterval(typeInterval);
        setTimeout(() => {
          phraseIdx++;
          typePhrase();
        }, 2200);
      }
    }, 60);
  }
  setTimeout(typePhrase, 1500);
}

// === PAGE LOAD ANIMATION ===
window.addEventListener('load', () => {
  document.body.classList.add('loaded');
  // trigger hero elements
  document.querySelectorAll('.hero .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 120);
  });
});
