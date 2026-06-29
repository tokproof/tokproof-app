/* ═══════════════ Tokproof Landing — v2 interactions ═══════════════ */
(function(){
  'use strict';

  /* ---------- 1. Typing chat bubble (hero) ---------- */
  (function(){
    const el = document.getElementById('chatMsg');
    if(!el) return;
    const msgs = [
      '5 estrellas sin duda 😍',
      'compré desde TikTok, llegó perfecto ✨',
      'la página da muchísima confianza 🙌',
      'mi piel cambió en 3 días 🔥',
      'al fin un link que no se bloquea 💜'
    ];
    let mi=0, ci=0, deleting=false;
    function tick(){
      const full = msgs[mi];
      if(!deleting){
        ci++;
        el.innerHTML = full.slice(0,ci) + '<span class="caret"></span>';
        if(ci>=full.length){ deleting=true; return setTimeout(tick, 1700); }
        return setTimeout(tick, 55 + Math.random()*40);
      } else {
        ci-=2; if(ci<0) ci=0;
        el.innerHTML = full.slice(0,ci) + '<span class="caret"></span>';
        if(ci<=0){ deleting=false; mi=(mi+1)%msgs.length; return setTimeout(tick, 380); }
        return setTimeout(tick, 24);
      }
    }
    tick();
  })();

  /* ---------- 2. Hero annotations cycle ---------- */
  (function(){
    const host = document.getElementById('heroAnnot');
    if(!host) return;
    const items = [].slice.call(host.children);
    let i=0;
    setInterval(()=>{
      items.forEach(x=>x.classList.remove('on'));
      i=(i+1)%items.length;
      items[i].classList.add('on');
    }, 2200);
  })();

  /* ---------- 3. Editor section auto-click ---------- */
  (function(){
    const side = document.getElementById('edSide');
    if(!side) return;
    const rows = [].slice.call(side.querySelectorAll('.ed-sec'));
    let i=0;
    setInterval(()=>{
      rows.forEach(r=>r.classList.remove('on'));
      i=(i+1)%3;            // cycle through first 3 (cursor travels 3 stops)
      rows[i].classList.add('on');
    }, 2333);
  })();

  /* ---------- 4. World map dot-field ---------- */
  (function(){
    const field = document.getElementById('mapField');
    if(!field) return;
    // landmass regions in 0..100 space: [cx,cy,rx,ry]
    const land = [
      [19,30,12,13],   // North America
      [18,45,4.5,6],   // Mexico / C. America
      [27,66,7.5,17],  // South America
      [49,25,7,9],     // Europe
      [52,55,10,18],   // Africa
      [70,32,16,15],   // Asia
      [64,47,6,7],     // India / SE Asia
      [83,71,8,7],     // Australia
      [46,20,2.4,3]    // UK (island)
    ];
    const hot  = [[18,30,4],[46,20,3],[18,45,3.5]]; // US, UK, MX
    const warm = [[27,62,5]];                        // Brazil
    function inEll(x,y,e){const dx=(x-e[0])/e[2], dy=(y-e[1])/e[3];return dx*dx+dy*dy<=1;}
    function near(x,y,list){for(const c of list){const dx=x-c[0],dy=y-c[1];if(Math.sqrt(dx*dx+dy*dy)<=c[2])return true;}return false;}
    const COLS=58, ROWS=26;
    const frag=document.createDocumentFragment();
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const x=(c+0.5)/COLS*100, y=(r+0.5)/ROWS*100;
        let onLand=false; for(const e of land){ if(inEll(x,y,e)){onLand=true;break;} }
        if(!onLand) continue;
        const d=document.createElement('span');
        d.className='md'+(near(x,y,hot)?' hot':near(x,y,warm)?' warm':'');
        d.style.left=x+'%'; d.style.top=y+'%';
        frag.appendChild(d);
      }
    }
    field.appendChild(frag);

    // re-seat the pulsing markers on US / UK / MX to match the field
    const dots=document.getElementById('mapDots');
    if(dots){
      dots.innerHTML='';
      [[18,30,0],[46,20,.6],[18,45,1.2]].forEach(c=>{
        const s=document.createElement('span');
        s.className='map-dot big'; s.style.left=c[0]+'%'; s.style.top=c[1]+'%';
        s.style.setProperty('--pd',c[2]+'s');
        dots.appendChild(s);
      });
    }
  })();

  /* ---------- 5. Creators carousel ---------- */
  (function(){
    const track = document.getElementById('crTrack');
    if(!track) return;
    const soc = {
      ig:'<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="18" cy="6" r="1.4"/></svg>',
      x:'<svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M18.2 2h3.3l-7.2 8.3L22.8 22h-6.6l-5.2-6.8L5 22H1.7l7.7-8.8L1.5 2h6.8l4.7 6.2L18.2 2z"/></svg>',
      tk:'<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M16 3a5 5 0 0 0 4 4v3a8 8 0 0 1-4-1v7a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z"/></svg>',
      fb:'<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7v-3.5h3.1V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9v2.2h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
      sp:'<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.6 14.4a.6.6 0 0 1-.9.2c-2.4-1.5-5.4-1.8-9-1a.6.6 0 1 1-.3-1.2c3.9-.9 7.3-.5 10 1.1.3.2.4.6.2.9zm1.2-2.7a.8.8 0 0 1-1 .3c-2.7-1.7-6.9-2.2-10.1-1.2a.8.8 0 0 1-.5-1.5c3.7-1.1 8.3-.6 11.4 1.3.3.2.5.7.2 1.1zm.1-2.8C14.6 8.9 9.4 8.7 6.3 9.7a.9.9 0 1 1-.6-1.8c3.6-1.1 9.3-.9 13 1.3a.9.9 0 1 1-1 1.6z"/></svg>',
      yt:'<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M23 7c-.3-1-1-1.8-2-2C19 4.5 12 4.5 12 4.5s-7 0-9 .5c-1 .2-1.7 1-2 2C.5 9 .5 12 .5 12s0 3 .5 5c.3 1 1 1.8 2 2 2 .5 9 .5 9 .5s7 0 9-.5c1-.2 1.7-1 2-2 .5-2 .5-5 .5-5s0-3-.5-5zM10 16V8l6 4-6 4z"/></svg>'
    };
    const cbg = {ig:'#E1306C',x:'#000',tk:'#000',fb:'#1877F2',sp:'#1DB954',yt:'#FF0000'};
    function socRow(){
      return ['ig','x','tk','fb','sp','yt'].map(k=>`<a style="background:${cbg[k]}">${soc[k]}</a>`).join('');
    }
    const people = [
      {n:'Ethan Ross', h:'@ethanross', f:'100K', niche:'Fitness, productividad y negocio', g:'linear-gradient(160deg,#3A2E4A,#6B4E7A)'},
      {n:'Sofia Patel', h:'@sofiapatel', f:'436K', niche:'Editoriales de moda y momentos en la ciudad', g:'linear-gradient(160deg,#7A4E6B,#C77BAE)'},
      {n:'Daniel Reed', h:'@danielreed', f:'684K', niche:'Vida de fundador y economía de creadores', g:'linear-gradient(160deg,#8A5A3A,#D89B6B)'},
      {n:'Isabella Cruz', h:'@isabellacruz', f:'257K', niche:'Estilo de vida, sesiones y diarios de viaje', g:'linear-gradient(160deg,#5A4E7A,#9B8AC9)'},
      {n:'Liam Parker', h:'@liamparker', f:'1M', niche:'Tech, gadgets y reseñas honestas', g:'linear-gradient(160deg,#3A4E6B,#6B8ABF)'},
      {n:'Mia Collins', h:'@miacollins', f:'320K', niche:'Skincare, bienestar y vlogs', g:'linear-gradient(160deg,#7A3A5A,#C77B9B)'}
    ];
    function card(p){
      return `<div class="cr-card">
        <div class="cr-photo" style="background:${p.g}"><div class="ov"></div></div>
        <div class="cr-body">
          <div class="cr-name">${p.n} <span class="vf"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span></div>
          <div class="cr-handle">${p.h}</div>
          <div class="cr-soc">${socRow()}</div>
          <div class="cr-foll">${p.f} <span style="font-weight:500;color:var(--ink-3);font-size:11px;">seguidores</span></div>
          <div class="cr-niche">${p.niche}</div>
        </div>
      </div>`;
    }
    const html = people.map(card).join('');
    track.innerHTML = html + html; // duplicate for seamless loop
  })();
})();
