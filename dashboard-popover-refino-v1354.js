/* QuotaLab V135.4 — Indicadores Principais em popover contextual
   - Desktop only
   - Substitui abertura em modal por painel flutuante no hover/foco
   - Clique fixa/desfixa o popover; clique fora/Esc fecha
   - 4 indicadores financeiros usam resumo textual compacto
   - Evolução histórica e inadimplência usam miniaturas compactas dos gráficos
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_POPOVER_REF_V1354__) return;
  window.__QL_POPOVER_REF_V1354__ = true;

  let pinned = false;
  let activeIndex = -1;
  let showTimer = null;
  let hideTimer = null;
  let cards = [];
  let sourceCards = [];
  let pop = null;

  const money = text => [...String(text||'').matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0].replace(/\s+/g,' '));
  const pct = text => [...String(text||'').matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]);
  const clean = s => String(s||'').replace(/\s+/g,' ').trim();
  const stripIds = root => { if(root.id) root.removeAttribute('id'); root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id')); };

  function addStyles(){
    if(document.getElementById('ql-popover-v1354-css')) return;
    const st=document.createElement('style');
    st.id='ql-popover-v1354-css';
    st.textContent=`
      @media (min-width:901px){
        /* O modal legado continua existindo para compatibilidade, mas não participa mais desta UX. */
        body > .ql-exec-modal-v1350{display:none!important;pointer-events:none!important;}

        body > .ql-indicator-popover-v1354{
          position:fixed!important;z-index:2147482500!important;display:none;
          width:340px;max-width:calc(100vw - 28px);box-sizing:border-box;
          border:1px solid var(--border);border-radius:16px;
          background:linear-gradient(180deg,var(--bg2),rgba(8,17,34,.98));
          color:var(--text);box-shadow:0 20px 55px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);
          padding:15px 16px 14px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          opacity:0;transform:translateY(4px) scale(.985);transform-origin:50% 100%;
          transition:opacity .12s ease,transform .12s ease;
        }
        body > .ql-indicator-popover-v1354.is-open{display:block;opacity:1;transform:translateY(0) scale(1);}
        body > .ql-indicator-popover-v1354.is-wide{width:500px;}
        body > .ql-indicator-popover-v1354::after{
          content:'';position:absolute;width:10px;height:10px;background:var(--bg2);border-right:1px solid var(--border);border-bottom:1px solid var(--border);transform:rotate(45deg);
          left:var(--arrow-x,50%);margin-left:-5px;bottom:-6px;
        }
        body > .ql-indicator-popover-v1354.is-below::after{bottom:auto;top:-6px;transform:rotate(225deg);}
        .ql-pop-head-v1354{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:11px;}
        .ql-pop-title-v1354{font-size:10px;line-height:1.2;text-transform:uppercase;letter-spacing:.055em;color:var(--text3);font-weight:850;}
        .ql-pop-pin-v1354{font-size:9px;color:var(--text3);opacity:.72;white-space:nowrap;}
        .ql-pop-main-v1354{font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:25px;line-height:1;color:var(--text);margin:2px 0 12px;}
        .ql-pop-list-v1354{display:grid;gap:7px;}
        .ql-pop-row-v1354{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding-top:7px;border-top:1px solid rgba(255,255,255,.055);}
        .ql-pop-row-v1354:first-child{border-top:0;padding-top:0;}
        .ql-pop-row-v1354 span{font-size:11px;color:var(--text3);}
        .ql-pop-row-v1354 strong{font-size:12px;color:var(--text);font-weight:780;text-align:right;}
        .ql-pop-row-v1354 strong.blue{color:var(--blue2);}.ql-pop-row-v1354 strong.green{color:var(--green);}.ql-pop-row-v1354 strong.gold{color:#d29922;}
        .ql-pop-chart-v1354{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;margin:0!important;min-height:0!important;height:auto!important;width:100%!important;}
        .ql-pop-chart-v1354 .db-c-label{display:none!important;}
        .ql-pop-chart-v1354 .db-quick-read,.ql-pop-chart-v1354 .db-read,.ql-pop-chart-v1354 [class*="quick"]{font-size:10.5px!important;line-height:1.35!important;margin:0 0 9px!important;padding:0!important;}
        .ql-pop-chart-v1354 svg{max-width:100%!important;height:auto!important;}
        .ql-pop-chart-v1354 canvas{max-width:100%!important;height:auto!important;}
        .ql-pop-chart-v1354 .db-chart,.ql-pop-chart-v1354 [class*="chart"]{max-height:160px!important;}
        #page-dashboard .ql-exec-card-v1350{cursor:default!important;}
        #page-dashboard .ql-exec-card-v1350:hover{border-color:rgba(88,166,255,.32)!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function findSources(){
    const rows=[...document.querySelectorAll('#page-dashboard .ql-original-row-hidden-v1350')];
    const out=[];
    rows.forEach(row=>{
      [...row.children].forEach(el=>{ if(el.classList?.contains('db-c')) out.push(el); });
    });
    return out.slice(0,6);
  }

  function buildSimple(index,src){
    const text=clean(src?.innerText||src?.textContent||'');
    const ms=money(text), ps=pct(text);
    if(index===0){
      const proposed=ms[ms.length-1]||ms[0]||'—';
      const current=ms.length>1?ms[ms.length-2]:'—';
      let adjust='—';
      const a=((parseFloat(proposed.replace(/[^\d,]/g,'').replace(',','.'))/parseFloat(current.replace(/[^\d,]/g,'').replace(',','.')))-1)*100;
      if(Number.isFinite(a)) adjust=(a>=0?'+':'')+a.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
      return `<div class="ql-pop-head-v1354"><div class="ql-pop-title-v1354">Cota atual vs proposta</div><div class="ql-pop-pin-v1354">clique para fixar</div></div>
        <div class="ql-pop-main-v1354">${proposed}</div>
        <div class="ql-pop-list-v1354">
          <div class="ql-pop-row-v1354"><span>Vigente</span><strong>${current}</strong></div>
          <div class="ql-pop-row-v1354"><span>Proposta</span><strong class="blue">${proposed}</strong></div>
          <div class="ql-pop-row-v1354"><span>Ajuste</span><strong>${adjust}</strong></div>
        </div>`;
    }
    if(index===1){
      const total=ms[0]||'—';
      const vals=ps.slice(0,4);
      const labels=['Despesas','Fdo. Reserva','Fdo. Obras','Inadimplência'];
      return `<div class="ql-pop-head-v1354"><div class="ql-pop-title-v1354">Composição da cota</div><div class="ql-pop-pin-v1354">clique para fixar</div></div>
        <div class="ql-pop-main-v1354">${total}</div>
        <div class="ql-pop-list-v1354">${labels.map((l,i)=>`<div class="ql-pop-row-v1354"><span>${l}</span><strong>${vals[i]||'—'}</strong></div>`).join('')}</div>`;
    }
    if(index===2){
      return `<div class="ql-pop-head-v1354"><div class="ql-pop-title-v1354">Fundo de Reserva</div><div class="ql-pop-pin-v1354">clique para fixar</div></div>
        <div class="ql-pop-main-v1354">${ps[0]||'—'} <span style="font-family:inherit;font-size:11px;color:var(--text3)">da meta</span></div>
        <div class="ql-pop-list-v1354">
          <div class="ql-pop-row-v1354"><span>Saldo atual</span><strong class="blue">${ms[0]||'—'}</strong></div>
          <div class="ql-pop-row-v1354"><span>Meta</span><strong>${ms[1]||'—'}</strong></div>
          <div class="ql-pop-row-v1354"><span>Meses p/ meta</span><strong class="gold">${(text.match(/\d+\s+meses/i)||['—'])[0]}</strong></div>
        </div>`;
    }
    return `<div class="ql-pop-head-v1354"><div class="ql-pop-title-v1354">Fundo de Obras</div><div class="ql-pop-pin-v1354">clique para fixar</div></div>
      <div class="ql-pop-main-v1354">${ps[0]||'—'} <span style="font-family:inherit;font-size:11px;color:var(--text3)">das despesas</span></div>
      <div class="ql-pop-list-v1354">
        <div class="ql-pop-row-v1354"><span>Contribuição</span><strong class="green">${ms[0]||'—'}${/mês/i.test(text)?'/mês':''}</strong></div>
        <div class="ql-pop-row-v1354"><span>% sobre despesas</span><strong>${ps[0]||'—'}</strong></div>
        <div class="ql-pop-row-v1354"><span>Anual acumulado</span><strong class="gold">${ms[1]||'—'}${/ano/i.test(text)?'/ano':''}</strong></div>
      </div>`;
  }

  function buildChart(index,src){
    const wrap=document.createElement('div');
    wrap.innerHTML=`<div class="ql-pop-head-v1354"><div class="ql-pop-title-v1354">${index===4?'Evolução histórica':'Inadimplência'}</div><div class="ql-pop-pin-v1354">clique para fixar</div></div>`;
    const clone=src.cloneNode(true); stripIds(clone); clone.classList.add('ql-pop-chart-v1354');
    wrap.appendChild(clone);
    return wrap;
  }

  function render(index){
    const src=sourceCards[index];
    if(!src||!pop) return;
    pop.classList.toggle('is-wide',index>=4);
    pop.innerHTML='';
    if(index<4) pop.innerHTML=buildSimple(index,src);
    else pop.appendChild(buildChart(index,src));
  }

  function positionFor(card){
    if(!pop||!card) return;
    const r=card.getBoundingClientRect();
    const gap=10;
    const pw=pop.offsetWidth||340, ph=pop.offsetHeight||180;
    let left=r.left+(r.width-pw)/2;
    left=Math.max(14,Math.min(left,window.innerWidth-pw-14));
    const roomAbove=r.top-gap;
    let top,below=false;
    if(roomAbove>=ph+12){ top=r.top-ph-gap; }
    else { below=true; top=r.bottom+gap; top=Math.min(top,window.innerHeight-ph-14); }
    pop.style.left=Math.round(left)+'px'; pop.style.top=Math.round(Math.max(14,top))+'px';
    pop.classList.toggle('is-below',below);
    const arrow=Math.max(18,Math.min(pw-18,(r.left+r.width/2)-left));
    pop.style.setProperty('--arrow-x',arrow+'px');
  }

  function show(index,card,asPinned=false){
    clearTimeout(hideTimer); clearTimeout(showTimer);
    activeIndex=index; if(asPinned) pinned=true;
    render(index);
    pop.classList.add('is-open');
    requestAnimationFrame(()=>positionFor(card));
  }
  function hide(force=false){
    if(pinned&&!force) return;
    clearTimeout(showTimer); clearTimeout(hideTimer);
    pinned=false; activeIndex=-1;
    pop?.classList.remove('is-open','is-below');
  }
  function scheduleShow(index,card){
    if(pinned) return;
    clearTimeout(hideTimer); clearTimeout(showTimer);
    showTimer=setTimeout(()=>show(index,card,false),110);
  }
  function scheduleHide(){
    if(pinned) return;
    clearTimeout(showTimer); clearTimeout(hideTimer);
    hideTimer=setTimeout(()=>hide(false),180);
  }

  function bind(){
    const host=document.getElementById('ql-exec-cards-v1350');
    if(!host) return false;
    cards=[...host.querySelectorAll('.ql-exec-card-v1350')];
    sourceCards=findSources();
    if(cards.length<6||sourceCards.length<6) return false;

    addStyles();
    document.body.classList.remove('ql-exec-modal-open-v1350');
    document.querySelectorAll('body > .ql-exec-modal-v1350').forEach(m=>m.classList.remove('is-open'));

    if(!document.querySelector('body > .ql-indicator-popover-v1354')){
      pop=document.createElement('div'); pop.className='ql-indicator-popover-v1354'; pop.setAttribute('role','tooltip'); document.body.appendChild(pop);
    } else pop=document.querySelector('body > .ql-indicator-popover-v1354');

    cards.forEach((card,index)=>{
      if(card.__qlPopoverV1354) return;
      card.__qlPopoverV1354=true;
      card.setAttribute('title','Passe o mouse para ver os detalhes');
      card.addEventListener('pointerenter',()=>scheduleShow(index,card));
      card.addEventListener('pointerleave',scheduleHide);
      card.addEventListener('focus',()=>scheduleShow(index,card));
      card.addEventListener('blur',scheduleHide);
    });

    pop.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
    pop.addEventListener('pointerleave',scheduleHide);

    /* Captura antes dos listeners antigos da V135.0: impede que o modal legado seja aberto. */
    host.addEventListener('click',e=>{
      const card=e.target.closest('.ql-exec-card-v1350'); if(!card) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const index=cards.indexOf(card);
      if(pinned&&activeIndex===index){ hide(true); return; }
      pinned=true; show(index,card,true);
    },true);
    host.addEventListener('keydown',e=>{
      const card=e.target.closest('.ql-exec-card-v1350'); if(!card||!(e.key==='Enter'||e.key===' ')) return;
      e.preventDefault();e.stopImmediatePropagation();
      const index=cards.indexOf(card); pinned=true;show(index,card,true);
    },true);

    document.addEventListener('pointerdown',e=>{
      if(!pinned) return;
      if(pop.contains(e.target)||host.contains(e.target)) return;
      hide(true);
    },true);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hide(true);});
    window.addEventListener('resize',()=>{if(activeIndex>=0)positionFor(cards[activeIndex]);});
    window.addEventListener('scroll',()=>{if(!pinned)hide(true);else if(activeIndex>=0)positionFor(cards[activeIndex]);},{passive:true});

    console.info('[QuotaLab V135.4] Modais substituídos por popovers contextuais nos 6 indicadores.');
    return true;
  }

  function boot(){if(bind())return;let n=0;const t=setInterval(()=>{n++;if(bind()||n>160)clearInterval(t);},125);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
