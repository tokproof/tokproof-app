/* ───────────────────── Tokproof Landing — interactions ───────────────────── */
(function(){
  'use strict';

  /* ---------- toast ---------- */
  const toast = document.getElementById('toast');
  function showToast(msg){
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(window.__t); window.__t = setTimeout(()=>toast.classList.remove('show'),1500);
  }

  /* ---------- scroll reveal (robust: rect-based, IO-independent) ---------- */
  const revs = [].slice.call(document.querySelectorAll('.reveal'));
  function revealCheck(){
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for(let i=revs.length-1;i>=0;i--){
      const r = revs[i];
      const rect = r.getBoundingClientRect();
      if(rect.top < vh*0.94 && rect.bottom > -40){
        r.classList.add('in');
        revs.splice(i,1);
      }
    }
  }
  revealCheck();
  window.addEventListener('scroll', revealCheck, {passive:true});
  window.addEventListener('resize', revealCheck);
  window.addEventListener('load', revealCheck);
  setTimeout(revealCheck, 120);
  // safety: never leave content hidden
  setTimeout(function(){ document.querySelectorAll('.reveal').forEach(r=>r.classList.add('in')); }, 2600);

  /* ---------- nav / CTA toasts ---------- */
  document.querySelectorAll('.nav-cta, .btn-primary').forEach(b=>{
    b.addEventListener('click',()=>showToast('Demo: registro no disponible en el prototipo'));
  });
  document.querySelector('.pcopy')?.addEventListener('click',()=>showToast('Copiado: tokproof.app/@glowlab'));

  /* ============================================================
     DRAGGABLE BUBBLES  (Todos tus enlaces en un solo lugar)
  ============================================================ */
  (function(){
    const stage = document.getElementById('czStage');
    if(!stage) return;
    document.querySelectorAll('.bubble').forEach(b=>{
      let drag=false, sx=0, sy=0, ox=0, oy=0;
      const onDown=(e)=>{
        drag=true; b.classList.add('dragging');
        const p = e.touches? e.touches[0] : e;
        sx=p.clientX; sy=p.clientY;
        ox=parseFloat(b.style.left); oy=parseFloat(b.style.top);
        e.preventDefault();
      };
      const onMove=(e)=>{
        if(!drag) return;
        const p = e.touches? e.touches[0] : e;
        const r = stage.getBoundingClientRect();
        let nx = ox + (p.clientX - sx);
        let ny = oy + (p.clientY - sy);
        nx = Math.max(-10, Math.min(r.width-44, nx));
        ny = Math.max(-10, Math.min(r.height-44, ny));
        b.style.left = nx+'px'; b.style.top = ny+'px';
      };
      const onUp=()=>{ if(drag){ drag=false; b.classList.remove('dragging'); } };
      b.addEventListener('mousedown',onDown);
      b.addEventListener('touchstart',onDown,{passive:false});
      window.addEventListener('mousemove',onMove);
      window.addEventListener('touchmove',onMove,{passive:false});
      window.addEventListener('mouseup',onUp);
      window.addEventListener('touchend',onUp);
    });
  })();

  /* ============================================================
     TESTIMONIALS CAROUSEL
  ============================================================ */
  (function(){
    const track = document.getElementById('testiTrack');
    if(!track) return;
    const cards = track.children.length;
    let idx = 0;
    function perView(){ return window.innerWidth<=680?1: window.innerWidth<=1000?2:3; }
    function maxIdx(){ return Math.max(0, cards - perView()); }
    function go(){
      idx = Math.max(0, Math.min(maxIdx(), idx));
      const card = track.children[0];
      const gap = 20;
      const step = card.getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-idx*step}px)`;
    }
    document.getElementById('tPrev').addEventListener('click',()=>{ idx--; go(); });
    document.getElementById('tNext').addEventListener('click',()=>{ idx++; go(); });
    window.addEventListener('resize',go);
    go();
  })();

  /* ============================================================
     ANALYTICS — TWO LOOPING "VIDEO" ANIMATIONS
  ============================================================ */

  // smooth path builder (catmull-rom -> bezier)
  function smoothPath(pts){
    if(pts.length<2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for(let i=0;i<pts.length-1;i++){
      const p0 = pts[i-1]||pts[i], p1=pts[i], p2=pts[i+1], p3=pts[i+2]||p2;
      const c1x = p1[0] + (p2[0]-p0[0])/6, c1y = p1[1] + (p2[1]-p0[1])/6;
      const c2x = p2[0] - (p3[0]-p1[0])/6, c2y = p2[1] - (p3[1]-p1[1])/6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  /* ---- LINE CHART (right panel) : draws, then head dot pulses, loops ---- */
  function setupLineChart(){
    const svg = document.getElementById('lineSvg');
    if(!svg) return ()=>{};
    const W=460,H=120;
    const datasets = [
      [42,55,40,62,52,78,66,92,84,104,96,112],
      [50,46,60,54,70,66,84,78,96,90,108,100]
    ];
    function buildPts(arr){
      return arr.map((v,i)=>[ (i/(arr.length-1))*(W-12)+6, H-8 - (v/120)*(H-18) ]);
    }
    const linePath = document.getElementById('linePath');
    const areaPath = document.getElementById('areaPath');
    const head = document.getElementById('lineHead');
    let di=0;

    function play(){
      const pts = buildPts(datasets[di]);
      const d = smoothPath(pts);
      linePath.setAttribute('d', d);
      areaPath.setAttribute('d', d + ` L ${W-6} ${H} L 6 ${H} Z`);
      const len = linePath.getTotalLength();
      linePath.style.transition='none';
      linePath.style.strokeDasharray = len;
      linePath.style.strokeDashoffset = len;
      areaPath.style.transition='none';
      areaPath.style.opacity='0';
      head.setAttribute('opacity','0');
      // force reflow
      void linePath.getBoundingClientRect();
      linePath.style.transition='stroke-dashoffset 1.8s cubic-bezier(.5,0,.2,1)';
      linePath.style.strokeDashoffset = '0';
      areaPath.style.transition='opacity 1.2s ease .4s';
      areaPath.style.opacity='.5';

      // animate head dot along path
      const start = performance.now(), dur=1800;
      function tick(now){
        const t = Math.min(1,(now-start)/dur);
        const pt = linePath.getPointAtLength(len*t);
        head.setAttribute('cx',pt.x); head.setAttribute('cy',pt.y);
        head.setAttribute('opacity', t>0.05?'1':'0');
        if(t<1) requestAnimationFrame(tick);
        else {
          head.animate([{r:4.5},{r:7},{r:4.5}],{duration:1200,iterations:2});
        }
      }
      requestAnimationFrame(tick);
      // fallback: ensure head ends at path end if rAF is throttled
      setTimeout(()=>{
        try{ const pt=linePath.getPointAtLength(len); head.setAttribute('cx',pt.x); head.setAttribute('cy',pt.y); head.setAttribute('opacity','1'); }catch(e){}
      }, dur+150);
      di = (di+1)%datasets.length;
    }
    return play;
  }

  /* ---- DONUT (right panel) : sweeps in, guaranteed colored rest-state ---- */
  function setupDonut(){
    const donut = document.getElementById('donut');
    if(!donut) return ()=>{};
    const segs = [['#7B61FF',34],['#FF4FD8',26],['#FFB1E7',18],['#C9A0FF',22]];
    function bgFor(total){
      let a=0; const parts=[];
      segs.forEach(([c,p])=>{
        const seg = 3.6*p;
        const segStart=a, segEnd=Math.min(total,a+seg);
        if(segEnd>segStart) parts.push(`${c} ${segStart}deg ${segEnd}deg`);
        a+=seg;
      });
      if(total<360) parts.push(`#EEE9F4 ${total}deg 360deg`);
      return `conic-gradient(${parts.join(',')})`;
    }
    const FULL = bgFor(360);
    donut.style.background = FULL; // colored at rest from the start
    function play(){
      const dur=1300, start=performance.now();
      donut.style.background = bgFor(0);
      function tick(now){
        const t=Math.min(1,(now-start)/dur);
        const ease = 1-Math.pow(1-t,3);
        donut.style.background = bgFor(360*ease);
        if(t<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      // fallback (rAF-independent): guarantee colored rest-state
      setTimeout(()=>{ donut.style.background = FULL; }, dur+120);
    }
    return play;
  }

  /* ---- AUDIENCE BARS ---- */
  function setupBars(){
    const fills = document.querySelectorAll('.aud-bar .fill');
    return function(){
      fills.forEach(f=>{ f.style.width='0'; });
      void document.body.offsetWidth;
      fills.forEach((f,i)=>{ setTimeout(()=>{ f.style.width = f.dataset.w+'%'; }, 200 + i*180); });
    };
  }

  /* ---- COUNTERS (count-up on each loop, with rAF-independent fallback) ---- */
  function animateCounters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target = el.dataset.count;
      const m = target.match(/^([^\d]*)([\d.]+)([^\d]*)$/);
      if(!m){ el.textContent = target; return; }
      const pre=m[1], num=parseFloat(m[2]), suf=m[3];
      const dec = (m[2].split('.')[1]||'').length;
      const start=performance.now(), dur=1400;
      function tick(now){
        const t=Math.min(1,(now-start)/dur);
        const ease=1-Math.pow(1-t,3);
        const val=(num*ease).toFixed(dec);
        el.textContent = pre+val+suf;
        if(t<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      setTimeout(()=>{ el.textContent = target; }, dur+150); // guarantee final value
    });
  }

  /* ---- LIVE SALE TICKER (left panel) ---- */
  function setupSaleTicker(){
    const el = document.getElementById('saleVal');
    if(!el) return ()=>{};
    const vals=['$0.43','$1.20','$0.87','$2.05','$0.64','$1.58'];
    let i=0;
    return function(){
      const pop = el.closest('.an-sale').querySelector('.pop');
      el.textContent = vals[i%vals.length]; i++;
      if(pop){ pop.animate([{transform:'scale(0)',opacity:0},{transform:'scale(1.1)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:500,easing:'cubic-bezier(.3,1.4,.5,1)'}); }
    };
  }

  /* ---- LIVE MAP DOTS (left panel) ---- */
  function setupMapDots(){
    const host = document.getElementById('mapDots');
    if(!host) return;
    host.innerHTML='';
    function add(x,y,opt){
      const d=document.createElement('span');
      d.className='map-dot'+(opt.purple?' purple':'')+(opt.big?' big':'');
      d.style.left=x+'%'; d.style.top=y+'%';
      d.style.setProperty('--pd',(opt.delay||0)+'s');
      host.appendChild(d);
    }
    // emphasized: USA, UK, Mexico (match ranking)
    add(19,33,{big:true,delay:0});
    add(50,28,{big:true,delay:.5});
    add(16,50,{big:true,delay:1});
    // ambient dots over the other landmasses
    const ambient=[[75,34],[60,40],[54,62],[27,70],[86,76],[40,30],[70,54],[30,58]];
    ambient.forEach((c,i)=>add(c[0],c[1],{purple:i%2===0,delay:(i*0.3)%2.4}));
  }

  /* ---- Orchestrate: run once visible, then loop like a video ---- */
  const playLine = setupLineChart();
  const playDonut = setupDonut();
  const playBars = setupBars();
  const tickSale = setupSaleTicker();
  setupMapDots();

  function runCycle(){
    animateCounters();
    playLine();
    playDonut();
    playBars();
    tickSale();
  }

  let cycleTimer=null, saleTimer=null, started=false;
  const shell = document.getElementById('anShell');
  function maybeStart(){
    if(started || !shell) return;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const rect = shell.getBoundingClientRect();
    if(rect.top < vh*0.78 && rect.bottom > 0){
      started=true;
      runCycle();
      cycleTimer = setInterval(runCycle, 6000);   // loop the whole "video"
      saleTimer = setInterval(tickSale, 2000);    // sale ticks faster
      window.removeEventListener('scroll', maybeStart);
    }
  }
  if(shell){
    maybeStart();
    window.addEventListener('scroll', maybeStart, {passive:true});
    window.addEventListener('resize', maybeStart);
    setTimeout(maybeStart, 300);
    // safety fallback if never scrolled into the trigger band
    setTimeout(function(){ if(!started){ started=true; runCycle(); cycleTimer=setInterval(runCycle,6000); saleTimer=setInterval(tickSale,2000);} }, 4000);
  }
})();
