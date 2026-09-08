/* QuotaLab V136.0 — Visão Geral: Insight + Projeção compactos com popover
   Desktop only
   - Compacta Insight Automático dos Fundos e Projeção Futura
   - Mantém na capa apenas resumo executivo
   - Exibe detalhes no hover, sem modal e sem clique
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_OVERVIEW_INSIGHTS_PROJECTION_V1360__) return;
  window.__QL_OVERVIEW_INSIGHTS_PROJECTION_V1360__ = true;

  const norm = s => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();
  const visible = el => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();

  let pop = null;
  let hideTimer = null;
  let showTimer = null;
  const data = new Map();

  function findPanel(title){
    const target = norm(title);
    const all = [...document.querySelectorAll('section,article,div')]
      .filter(visible)
      .filter(el => norm(el.innerText || el.textContent || '').includes(target))
      .map(el => ({el, r:el.getBoundingClientRect()}))
      .filter(x => x.r.width > 350 && x.r.height > 120)
      .sort((a,b)=>(a.r.width*a.r.height)-(b.r.width*b.r.height));
    return all[0]?.el || null;
  }

  function moneyAfter(text,label){
    const t = clean(text);
    const re = new RegExp(label + '[^R]{0,50}(R\\$\\s?[\\d\\.]+(?:,\\d{2})?)','i');
    return t.match(re)?.[1]?.replace(/\s+/g,' ') || '—';
  }

  function captureInsight(panel){
    const text = clean(panel.innerText || panel.textContent || '');
    const items = [];
    const candidates = [...panel.querySelectorAll('div,li,article,section')]
      .filter(el => visible(el))
      .map(el => clean(el.innerText || el.textContent || ''))
      .filter(t => t.length > 25 && t.length < 500)
      .filter(t => /fundo de reserva abaixo do ideal|fundo de obras ativo para investimento|impacto direto na cota/i.test(t));
    const seen = new Set();
    candidates.forEach(t => {
      const key = norm(t);
      if (!seen.has(key)) { seen.add(key); items.push(t); }
    });
    return {
      type:'insight',
      title:'Insight automático dos fundos',
      count: Math.min(3, items.length || 3),
      main: items[0]?.split(/Percentual atual|Sugestão|\. /i)[0] || 'Reserva abaixo do ideal',
      items: items.slice(0,3),
      raw:text
    };
  }

  function captureProjection(panel){
    const text = clean(panel.innerText || panel.textContent || '');
    return {
      type:'projection',
      title:'Projeção futura',
      reserva6: moneyAfter(text,'Reserva em 6 meses'),
      reserva12: moneyAfter(text,'Reserva em 12 meses'),
      obras6: moneyAfter(text,'Obras em 6 meses'),
      obras12: moneyAfter(text,'Obras em 12 meses'),
      semFundos: moneyAfter(text,'Sem fundos'),
      reservaCota: moneyAfter(text,'Reserva'),
      obrasCota: moneyAfter(text,'Obras'),
      cotaFinal: moneyAfter(text,'Cota final'),
      raw:text
    };
  }

  function addStyles(){
    if (document.getElementById('ql-overview-ip-v1360-css')) return;
    const st = document.createElement('style');
    st.id = 'ql-overview-ip-v1360-css';
    st.textContent = `
      @media (min-width:901px){
        .ql-overview-ip-card-v1360{
          min-height:112px!important;height:auto!important;padding:16px 18px!important;
          display:flex!important;flex-direction:column!important;justify-content:center!important;
          cursor:default!important;overflow:visible!important;
        }
        .ql-ip-top-v1360{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:8px;}
        .ql-ip-label-v1360{font-size:11px;font-weight:850;letter-spacing:.055em;text-transform:uppercase;color:var(--text3);}
        .ql-ip-badge-v1360{font-size:10px;font-weight:850;border:1px solid rgba(210,153,34,.45);color:#d29922;border-radius:999px;padding:5px 9px;white-space:nowrap;}
        .ql-ip-main-v1360{font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:22px;line-height:1.05;color:var(--text);margin-bottom:5px;}
        .ql-ip-sub-v1360{font-size:11px;color:var(--text3);line-height:1.35;}
        .ql-ip-values-v1360{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:2px;}
        .ql-ip-value-v1360{border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);border-radius:11px;padding:8px 10px;min-width:0;}
        .ql-ip-value-v1360 span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.04em;color:var(--text3);margin-bottom:3px;}
        .ql-ip-value-v1360 strong{display:block;font-size:17px;line-height:1;color:var(--text);}
        .ql-ip-value-v1360.reserve strong{color:#58a6ff}.ql-ip-value-v1360.works strong{color:#ff9f43}
        .ql-overview-ip-card-v1360:hover{border-color:rgba(88,166,255,.33)!important;transform:translateY(-1px);transition:.12s ease;}

        body > .ql-overview-ip-pop-v1360{
          position:fixed;z-index:2147482400;display:none;width:380px;max-width:calc(100vw - 28px);
          box-sizing:border-box;border:1px solid var(--border);border-radius:15px;
          background:linear-gradient(180deg,var(--bg2),rgba(8,17,34,.985));color:var(--text);
          box-shadow:0 18px 50px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);
          padding:14px 15px 13px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          opacity:0;transform:translateY(4px) scale(.985);transition:opacity .12s ease,transform .12s ease;
        }
        body > .ql-overview-ip-pop-v1360.is-open{display:block;opacity:1;transform:translateY(0) scale(1);}
        body > .ql-overview-ip-pop-v1360::after{content:'';position:absolute;width:10px;height:10px;background:var(--bg2);border-right:1px solid var(--border);border-bottom:1px solid var(--border);transform:rotate(45deg);left:var(--arrow-x,50%);margin-left:-5px;bottom:-6px;}
        body > .ql-overview-ip-pop-v1360.is-below::after{bottom:auto;top:-6px;transform:rotate(225deg);}
        .ql-ip-pop-head-v1360{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;}
        .ql-ip-pop-title-v1360{font-size:9.5px;text-transform:uppercase;letter-spacing:.055em;color:var(--text3);font-weight:850;}
        .ql-ip-pop-hint-v1360{font-size:9px;color:var(--text3);opacity:.65;}
        .ql-ip-pop-list-v1360{display:grid;gap:7px;}
        .ql-ip-pop-item-v1360{padding:8px 9px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.025);font-size:11px;line-height:1.35;color:var(--text2);}
        .ql-ip-pop-item-v1360 strong{color:var(--text);}
        .ql-ip-pop-grid-v1360{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .ql-ip-pop-metric-v1360{padding:8px 9px;border:1px solid rgba(255,255,255,.06);border-radius:10px;background:rgba(255,255,255,.025);}
        .ql-ip-pop-metric-v1360 span{display:block;font-size:9px;text-transform:uppercase;color:var(--text3);margin-bottom:3px;}
        .ql-ip-pop-metric-v1360 strong{font-size:14px;color:var(--text);}
        .ql-ip-pop-impact-v1360{margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.06);display:grid;gap:5px;}
        .ql-ip-pop-impact-v1360 div{display:flex;justify-content:space-between;gap:12px;font-size:10.5px;color:var(--text3);}.ql-ip-pop-impact-v1360 strong{color:var(--text);}
      }
    `;
    document.head.appendChild(st);
  }

  function compactInsight(panel,d){
    const pdf = [...panel.querySelectorAll('button,a')].find(el => /pdf dos fundos/i.test(el.textContent || ''));
    const pdfClone = pdf ? pdf.cloneNode(true) : null;
    panel.dataset.qlIpType = 'insight';
    panel.classList.add('ql-overview-ip-card-v1360');
    panel.innerHTML = `
      <div class="ql-ip-top-v1360">
        <div class="ql-ip-label-v1360">Insight automático dos fundos</div>
        <div class="ql-ip-badge-v1360">${d.count} insights</div>
      </div>
      <div class="ql-ip-main-v1360">${d.main.replace(/^●\s*/,'')}</div>
      <div class="ql-ip-sub-v1360">Passe o mouse para ver a leitura completa.</div>`;
    if (pdfClone) {
      pdfClone.style.cssText += ';position:absolute;right:16px;bottom:12px;transform:scale(.9);transform-origin:right bottom;';
      panel.style.position='relative';
      panel.appendChild(pdfClone);
    }
  }

  function compactProjection(panel,d){
    panel.dataset.qlIpType = 'projection';
    panel.classList.add('ql-overview-ip-card-v1360');
    panel.innerHTML = `
      <div class="ql-ip-top-v1360"><div class="ql-ip-label-v1360">Projeção futura</div><div class="ql-ip-badge-v1360">12 meses</div></div>
      <div class="ql-ip-values-v1360">
        <div class="ql-ip-value-v1360 reserve"><span>Reserva 12m</span><strong>${d.reserva12}</strong></div>
        <div class="ql-ip-value-v1360 works"><span>Obras 12m</span><strong>${d.obras12}</strong></div>
      </div>`;
  }

  function renderPopover(d){
    if (!pop) return;
    if (d.type === 'insight') {
      const items = d.items.length ? d.items : [d.raw];
      pop.innerHTML = `<div class="ql-ip-pop-head-v1360"><div class="ql-ip-pop-title-v1360">Insight automático dos fundos</div><div class="ql-ip-pop-hint-v1360">consulta rápida</div></div><div class="ql-ip-pop-list-v1360">${items.map(x=>`<div class="ql-ip-pop-item-v1360">${x}</div>`).join('')}</div>`;
    } else {
      pop.innerHTML = `<div class="ql-ip-pop-head-v1360"><div class="ql-ip-pop-title-v1360">Projeção futura</div><div class="ql-ip-pop-hint-v1360">consulta rápida</div></div>
        <div class="ql-ip-pop-grid-v1360">
          <div class="ql-ip-pop-metric-v1360"><span>Reserva em 6 meses</span><strong>${d.reserva6}</strong></div>
          <div class="ql-ip-pop-metric-v1360"><span>Reserva em 12 meses</span><strong>${d.reserva12}</strong></div>
          <div class="ql-ip-pop-metric-v1360"><span>Obras em 6 meses</span><strong>${d.obras6}</strong></div>
          <div class="ql-ip-pop-metric-v1360"><span>Obras em 12 meses</span><strong>${d.obras12}</strong></div>
        </div>
        <div class="ql-ip-pop-impact-v1360">
          <div><span>Sem fundos</span><strong>${d.semFundos}</strong></div>
          <div><span>Reserva</span><strong>${d.reservaCota}</strong></div>
          <div><span>Obras</span><strong>${d.obrasCota}</strong></div>
          <div><span>Cota final</span><strong>${d.cotaFinal}</strong></div>
        </div>`;
    }
  }

  function position(card){
    const r=card.getBoundingClientRect(), gap=9;
    const pw=pop.offsetWidth||380, ph=pop.offsetHeight||220;
    let left=Math.max(14,Math.min(r.left+(r.width-pw)/2,window.innerWidth-pw-14));
    let below=false, top;
    if(r.top-gap>=ph+10) top=r.top-ph-gap; else {below=true;top=Math.min(r.bottom+gap,window.innerHeight-ph-14);}
    pop.style.left=Math.round(left)+'px';pop.style.top=Math.round(Math.max(14,top))+'px';
    pop.classList.toggle('is-below',below);
    pop.style.setProperty('--arrow-x',Math.max(18,Math.min(pw-18,(r.left+r.width/2)-left))+'px');
  }

  function show(card,d){clearTimeout(hideTimer);clearTimeout(showTimer);renderPopover(d);pop.classList.add('is-open');requestAnimationFrame(()=>position(card));}
  function hide(){clearTimeout(showTimer);clearTimeout(hideTimer);pop?.classList.remove('is-open','is-below');}
  function bind(card,d){
    card.addEventListener('pointerenter',()=>{clearTimeout(hideTimer);showTimer=setTimeout(()=>show(card,d),85);});
    card.addEventListener('pointerleave',()=>{clearTimeout(showTimer);hideTimer=setTimeout(hide,150);});
  }

  function apply(){
    const insight=findPanel('Insight automático dos fundos');
    const projection=findPanel('Projeção futura');
    if(!insight || !projection || insight===projection) return false;
    if(insight.classList.contains('ql-overview-ip-card-v1360') || projection.classList.contains('ql-overview-ip-card-v1360')) return true;

    addStyles();
    if(!pop){pop=document.createElement('div');pop.className='ql-overview-ip-pop-v1360';pop.setAttribute('role','tooltip');document.body.appendChild(pop);pop.addEventListener('pointerenter',()=>clearTimeout(hideTimer));pop.addEventListener('pointerleave',()=>{hideTimer=setTimeout(hide,120);});}

    const di=captureInsight(insight), dp=captureProjection(projection);
    data.set(insight,di);data.set(projection,dp);
    compactInsight(insight,di);compactProjection(projection,dp);
    bind(insight,di);bind(projection,dp);
    window.addEventListener('scroll',hide,{passive:true});window.addEventListener('resize',hide);
    console.info('[QuotaLab V136.0] Insight e Projeção compactados com popover.');
    return true;
  }

  function boot(){if(apply())return;let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>240)clearInterval(timer);},125);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
