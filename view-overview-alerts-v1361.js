/* QuotaLab V136.1 — Visão Geral: Alertas Inteligentes compactos com popover
   Desktop only
   - Compacta o painel Alertas Inteligentes
   - Mantém na capa apenas prioridade/quantidade e o alerta principal
   - Exibe os dois alertas completos no hover, sem modal e sem clique
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_OVERVIEW_ALERTS_V1361__) return;
  window.__QL_OVERVIEW_ALERTS_V1361__ = true;

  const norm = s => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const visible = el => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');

  let pop = null;
  let showTimer = null;
  let hideTimer = null;

  function findPanel(){
    const all = [...document.querySelectorAll('section,article,div')]
      .filter(visible)
      .filter(el => norm(el.innerText || el.textContent || '').includes('alertas inteligentes'))
      .map(el => ({el, r:el.getBoundingClientRect()}))
      .filter(x => x.r.width > 700 && x.r.height > 120)
      .sort((a,b)=>(a.r.width*a.r.height)-(b.r.width*b.r.height));
    return all[0]?.el || null;
  }

  function capture(panel){
    const text = clean(panel.innerText || panel.textContent || '');
    const countMatch = text.match(/(\d+)\s*alertas?/i);
    const priority = /prioridade\s*alta/i.test(text) ? 'Prioridade alta' : 'Alertas';

    const candidates = [...panel.querySelectorAll('div,article,section')]
      .filter(visible)
      .map(el => ({el, t:clean(el.innerText || el.textContent || ''), r:el.getBoundingClientRect()}))
      .filter(x => x.t.length > 35 && x.t.length < 700)
      .filter(x => /prioridade\s*\d+|reserva em zona de atencao|crescimento da reserva lento/i.test(norm(x.t)))
      .sort((a,b)=>(a.r.width*a.r.height)-(b.r.width*b.r.height));

    const items=[];
    const seen=new Set();
    for(const c of candidates){
      const key=norm(c.t);
      if(seen.has(key)) continue;
      seen.add(key);
      if(items.some(it => norm(it.text).includes(key) || key.includes(norm(it.text)))) continue;
      const clone=c.el.cloneNode(true);
      clone.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));
      clone.removeAttribute('id');
      items.push({text:c.t, clone});
      if(items.length===2) break;
    }

    const primaryText = items[0]?.text || text;
    let primary = primaryText
      .replace(/prioridade\s*\d+/ig,'')
      .replace(/alto|medio|médio/ig,'')
      .trim();
    primary = primary.split(/Reserva atual|Mantendo a arrecadação|Ação sugerida/i)[0].trim() || 'Reserva em zona de atenção';

    return {
      count: countMatch ? Number(countMatch[1]) : (items.length || 2),
      priority,
      primary,
      items
    };
  }

  function addStyles(){
    if(document.getElementById('ql-overview-alerts-v1361-css')) return;
    const st=document.createElement('style');
    st.id='ql-overview-alerts-v1361-css';
    st.textContent=`
      @media (min-width:901px){
        .ql-overview-alerts-card-v1361{
          min-height:94px!important;height:auto!important;padding:15px 18px!important;
          display:flex!important;flex-direction:column!important;justify-content:center!important;
          cursor:default!important;overflow:visible!important;
        }
        .ql-alerts-top-v1361{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:7px;}
        .ql-alerts-label-v1361{font-size:11px;font-weight:850;letter-spacing:.055em;text-transform:uppercase;color:var(--text3);}
        .ql-alerts-badge-v1361{font-size:10px;font-weight:850;border:1px solid rgba(210,153,34,.5);color:#d29922;border-radius:999px;padding:5px 9px;white-space:nowrap;}
        .ql-alerts-main-v1361{font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:21px;line-height:1.08;color:var(--text);margin-bottom:4px;}
        .ql-alerts-sub-v1361{font-size:11px;color:var(--text3);line-height:1.3;}
        .ql-overview-alerts-card-v1361:hover{border-color:rgba(210,153,34,.4)!important;transform:translateY(-1px);transition:.12s ease;}

        body > .ql-overview-alerts-pop-v1361{
          position:fixed;z-index:2147482390;display:none;width:520px;max-width:calc(100vw - 28px);
          box-sizing:border-box;border:1px solid var(--border);border-radius:15px;
          background:linear-gradient(180deg,var(--bg2),rgba(8,17,34,.985));color:var(--text);
          box-shadow:0 18px 50px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);
          padding:14px 15px 13px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          opacity:0;transform:translateY(4px) scale(.985);transition:opacity .12s ease,transform .12s ease;
        }
        body > .ql-overview-alerts-pop-v1361.is-open{display:block;opacity:1;transform:translateY(0) scale(1);}
        body > .ql-overview-alerts-pop-v1361::after{content:'';position:absolute;width:10px;height:10px;background:var(--bg2);border-right:1px solid var(--border);border-bottom:1px solid var(--border);transform:rotate(45deg);left:var(--arrow-x,50%);margin-left:-5px;bottom:-6px;}
        body > .ql-overview-alerts-pop-v1361.is-below::after{bottom:auto;top:-6px;transform:rotate(225deg);}
        .ql-alerts-pop-head-v1361{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;}
        .ql-alerts-pop-title-v1361{font-size:9.5px;text-transform:uppercase;letter-spacing:.055em;color:var(--text3);font-weight:850;}
        .ql-alerts-pop-hint-v1361{font-size:9px;color:var(--text3);opacity:.65;}
        .ql-alerts-pop-list-v1361{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
        .ql-alerts-pop-item-v1361{min-width:0!important;width:auto!important;max-width:none!important;height:auto!important;min-height:0!important;margin:0!important;padding:10px 11px!important;box-sizing:border-box!important;border-radius:11px!important;}
        .ql-alerts-pop-item-v1361 *{max-width:100%!important;}
        .ql-alerts-pop-item-v1361 p,.ql-alerts-pop-item-v1361 div,.ql-alerts-pop-item-v1361 span{line-height:1.28;}
      }
    `;
    document.head.appendChild(st);
  }

  function renderPopover(d){
    if(!pop) return;
    pop.innerHTML='<div class="ql-alerts-pop-head-v1361"><div class="ql-alerts-pop-title-v1361">Alertas inteligentes</div><div class="ql-alerts-pop-hint-v1361">consulta rápida</div></div><div class="ql-alerts-pop-list-v1361"></div>';
    const list=pop.querySelector('.ql-alerts-pop-list-v1361');
    if(d.items.length){
      d.items.forEach(item=>{
        const clone=item.clone.cloneNode(true);
        clone.classList.add('ql-alerts-pop-item-v1361');
        list.appendChild(clone);
      });
    } else {
      const fallback=document.createElement('div');
      fallback.className='ql-alerts-pop-item-v1361';
      fallback.textContent='Passe o mouse sobre os alertas para consultar os detalhes.';
      list.appendChild(fallback);
    }
  }

  function position(card){
    const r=card.getBoundingClientRect(), gap=9;
    const pw=pop.offsetWidth||520, ph=pop.offsetHeight||230;
    let left=Math.max(14,Math.min(r.left+(r.width-pw)/2,window.innerWidth-pw-14));
    let below=false, top;
    if(r.top-gap>=ph+10) top=r.top-ph-gap; else {below=true;top=Math.min(r.bottom+gap,window.innerHeight-ph-14);}
    pop.style.left=Math.round(left)+'px';
    pop.style.top=Math.round(Math.max(14,top))+'px';
    pop.classList.toggle('is-below',below);
    pop.style.setProperty('--arrow-x',Math.max(18,Math.min(pw-18,(r.left+r.width/2)-left))+'px');
  }

  function show(card,d){
    clearTimeout(hideTimer);clearTimeout(showTimer);
    renderPopover(d);
    pop.classList.add('is-open');
    requestAnimationFrame(()=>position(card));
  }
  function hide(){clearTimeout(showTimer);clearTimeout(hideTimer);pop?.classList.remove('is-open','is-below');}

  function apply(){
    const panel=findPanel();
    if(!panel) return false;
    if(panel.classList.contains('ql-overview-alerts-card-v1361')) return true;

    const d=capture(panel);
    addStyles();
    if(!pop){
      pop=document.createElement('div');
      pop.className='ql-overview-alerts-pop-v1361';
      pop.setAttribute('role','tooltip');
      document.body.appendChild(pop);
      pop.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
      pop.addEventListener('pointerleave',()=>{hideTimer=setTimeout(hide,120);});
    }

    panel.classList.add('ql-overview-alerts-card-v1361');
    panel.innerHTML=`
      <div class="ql-alerts-top-v1361">
        <div class="ql-alerts-label-v1361">Alertas inteligentes</div>
        <div class="ql-alerts-badge-v1361">⚠ ${d.priority} · ${d.count} alertas</div>
      </div>
      <div class="ql-alerts-main-v1361">${d.primary}</div>
      <div class="ql-alerts-sub-v1361">Passe o mouse para ver os alertas e ações sugeridas.</div>`;

    panel.addEventListener('pointerenter',()=>{clearTimeout(hideTimer);showTimer=setTimeout(()=>show(panel,d),85);});
    panel.addEventListener('pointerleave',()=>{clearTimeout(showTimer);hideTimer=setTimeout(hide,150);});
    window.addEventListener('scroll',hide,{passive:true});
    window.addEventListener('resize',hide);

    console.info('[QuotaLab V136.1] Alertas Inteligentes compactados com popover.');
    return true;
  }

  function boot(){
    if(apply()) return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(apply()||tries>240)clearInterval(timer);},125);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
