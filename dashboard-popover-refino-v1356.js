/* QuotaLab V135.6 — Indicadores Principais hover-only + correção Meses p/ meta
   - Desktop only
   - Mantém a UX hover-only da V135.5
   - Corrige captura de meses do Fundo de Reserva para evitar "000 Meses"
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_POPOVER_REF_V1356__) return;
  window.__QL_POPOVER_REF_V1356__ = true;

  let cards=[];
  let sourceCards=[];
  let pop=null;
  let activeIndex=-1;
  let showTimer=null;
  let hideTimer=null;

  const money=text=>[...String(text||'').matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0].replace(/\s+/g,' '));
  const pct=text=>[...String(text||'').matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]);
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const stripIds=root=>{if(root.id)root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));};
  const monthsToGoal=text=>{
    const direct=String(text||'').match(/meses\s*p\/?\s*meta\s*(\d+)\s*meses/i);
    if(direct) return direct[1]+' meses';
    const all=[...String(text||'').matchAll(/\b\d+\s+meses\b/gi)].map(m=>m[0]);
    return all.length?all[all.length-1]:'—';
  };

  function addStyles(){
    if(document.getElementById('ql-popover-v1356-css')) return;
    const st=document.createElement('style');
    st.id='ql-popover-v1356-css';
    st.textContent=`
      @media (min-width:901px){
        body > .ql-exec-modal-v1350{display:none!important;pointer-events:none!important;}
        #page-dashboard .ql-exec-card-v1350{cursor:default!important;}
        #page-dashboard .ql-exec-card-v1350::after{display:none!important;}
        #page-dashboard .ql-exec-card-v1350:hover{border-color:rgba(88,166,255,.34)!important;transform:translateY(-1px)!important;}

        body > .ql-indicator-popover-v1356{
          position:fixed!important;z-index:2147482500!important;display:none;
          width:320px;max-width:calc(100vw - 28px);box-sizing:border-box;
          border:1px solid var(--border);border-radius:15px;
          background:linear-gradient(180deg,var(--bg2),rgba(8,17,34,.985));
          color:var(--text);box-shadow:0 18px 50px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);
          padding:14px 15px 13px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          opacity:0;transform:translateY(4px) scale(.985);transition:opacity .12s ease,transform .12s ease;
          pointer-events:auto;
        }
        body > .ql-indicator-popover-v1356.is-open{display:block;opacity:1;transform:translateY(0) scale(1);}
        body > .ql-indicator-popover-v1356.is-wide{width:455px;}
        body > .ql-indicator-popover-v1356::after{
          content:'';position:absolute;width:10px;height:10px;background:var(--bg2);border-right:1px solid var(--border);border-bottom:1px solid var(--border);
          transform:rotate(45deg);left:var(--arrow-x,50%);margin-left:-5px;bottom:-6px;
        }
        body > .ql-indicator-popover-v1356.is-below::after{bottom:auto;top:-6px;transform:rotate(225deg);}
        .ql-pop-head-v1356{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px;}
        .ql-pop-title-v1356{font-size:9.5px;line-height:1.2;text-transform:uppercase;letter-spacing:.055em;color:var(--text3);font-weight:850;}
        .ql-pop-hint-v1356{font-size:9px;color:var(--text3);opacity:.65;}
        .ql-pop-main-v1356{font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:23px;line-height:1;color:var(--text);margin:2px 0 10px;}
        .ql-pop-list-v1356{display:grid;gap:6px;}
        .ql-pop-row-v1356{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;padding-top:6px;border-top:1px solid rgba(255,255,255,.055);}
        .ql-pop-row-v1356:first-child{border-top:0;padding-top:0;}
        .ql-pop-row-v1356 span{font-size:10.5px;color:var(--text3);}
        .ql-pop-row-v1356 strong{font-size:11.5px;color:var(--text);font-weight:780;text-align:right;}
        .ql-pop-row-v1356 strong.blue{color:var(--blue2)}
        .ql-pop-row-v1356 strong.green{color:var(--green)}
        .ql-pop-row-v1356 strong.gold{color:#d29922}
        .ql-pop-chart-v1356{padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:0!important;margin:0!important;min-height:0!important;height:auto!important;width:100%!important;}
        .ql-pop-chart-v1356 .db-c-label{display:none!important;}
        .ql-pop-chart-v1356 svg{max-width:100%!important;height:auto!important;}
        .ql-pop-chart-v1356 canvas{max-width:100%!important;height:auto!important;}
        .ql-pop-chart-v1356 .db-chart,.ql-pop-chart-v1356 [class*="chart"]{max-height:135px!important;}
        .ql-pop-chart-v1356 p,.ql-pop-chart-v1356 .db-quick-read,.ql-pop-chart-v1356 .db-read,.ql-pop-chart-v1356 [class*="quick"]{font-size:10px!important;line-height:1.3!important;margin:0 0 7px!important;padding:0!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function findSources(){
    const rows=[...document.querySelectorAll('#page-dashboard .ql-original-row-hidden-v1350')];
    const out=[];
    rows.forEach(row=>[...row.children].forEach(el=>{if(el.classList?.contains('db-c'))out.push(el);}));
    return out.slice(0,6);
  }

  function simple(index,src){
    const text=clean(src?.innerText||src?.textContent||'');
    const ms=money(text), ps=pct(text);
    const head=t=>`<div class="ql-pop-head-v1356"><div class="ql-pop-title-v1356">${t}</div><div class="ql-pop-hint-v1356">consulta rápida</div></div>`;
    if(index===0){
      const proposed=ms[ms.length-1]||ms[0]||'—';
      const current=ms.length>1?ms[ms.length-2]:'—';
      let adjust='—';
      const pv=parseFloat(proposed.replace(/[^\d,]/g,'').replace(',','.'));
      const cv=parseFloat(current.replace(/[^\d,]/g,'').replace(',','.'));
      const a=cv?((pv/cv)-1)*100:NaN;
      if(Number.isFinite(a))adjust=(a>=0?'+':'')+a.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
      return head('Cota atual vs proposta')+`<div class="ql-pop-main-v1356">${proposed}</div><div class="ql-pop-list-v1356"><div class="ql-pop-row-v1356"><span>Vigente</span><strong>${current}</strong></div><div class="ql-pop-row-v1356"><span>Proposta</span><strong class="blue">${proposed}</strong></div><div class="ql-pop-row-v1356"><span>Ajuste</span><strong>${adjust}</strong></div></div>`;
    }
    if(index===1){
      const labels=['Despesas','Fdo. Reserva','Fdo. Obras','Inadimplência'];
      const vals=ps.slice(0,4);
      return head('Composição da cota')+`<div class="ql-pop-main-v1356">${ms[0]||'—'}</div><div class="ql-pop-list-v1356">${labels.map((l,i)=>`<div class="ql-pop-row-v1356"><span>${l}</span><strong>${vals[i]||'—'}</strong></div>`).join('')}</div>`;
    }
    if(index===2){
      return head('Fundo de Reserva')+`<div class="ql-pop-main-v1356">${ps[0]||'—'} <span style="font-family:inherit;font-size:10px;color:var(--text3)">da meta</span></div><div class="ql-pop-list-v1356"><div class="ql-pop-row-v1356"><span>Saldo atual</span><strong class="blue">${ms[0]||'—'}</strong></div><div class="ql-pop-row-v1356"><span>Meta</span><strong>${ms[1]||'—'}</strong></div><div class="ql-pop-row-v1356"><span>Meses p/ meta</span><strong class="gold">${monthsToGoal(text)}</strong></div></div>`;
    }
    return head('Fundo de Obras')+`<div class="ql-pop-main-v1356">${ps[0]||'—'} <span style="font-family:inherit;font-size:10px;color:var(--text3)">das despesas</span></div><div class="ql-pop-list-v1356"><div class="ql-pop-row-v1356"><span>Contribuição</span><strong class="green">${ms[0]||'—'}${/mês/i.test(text)?'/mês':''}</strong></div><div class="ql-pop-row-v1356"><span>% sobre despesas</span><strong>${ps[0]||'—'}</strong></div><div class="ql-pop-row-v1356"><span>Anual acumulado</span><strong class="gold">${ms[1]||'—'}${/ano/i.test(text)?'/ano':''}</strong></div></div>`;
  }

  function chart(index,src){
    const wrap=document.createElement('div');
    wrap.innerHTML=`<div class="ql-pop-head-v1356"><div class="ql-pop-title-v1356">${index===4?'Evolução histórica':'Inadimplência'}</div><div class="ql-pop-hint-v1356">consulta rápida</div></div>`;
    const clone=src.cloneNode(true);stripIds(clone);clone.classList.add('ql-pop-chart-v1356');wrap.appendChild(clone);return wrap;
  }

  function render(index){
    const src=sourceCards[index];if(!src||!pop)return;
    pop.classList.toggle('is-wide',index>=4);pop.innerHTML='';
    if(index<4)pop.innerHTML=simple(index,src);else pop.appendChild(chart(index,src));
  }

  function position(card){
    const r=card.getBoundingClientRect();const gap=9;const pw=pop.offsetWidth||320,ph=pop.offsetHeight||170;
    let left=Math.max(14,Math.min(r.left+(r.width-pw)/2,window.innerWidth-pw-14));
    let below=false,top;
    if(r.top-gap>=ph+10)top=r.top-ph-gap;else{below=true;top=Math.min(r.bottom+gap,window.innerHeight-ph-14);}
    pop.style.left=Math.round(left)+'px';pop.style.top=Math.round(Math.max(14,top))+'px';pop.classList.toggle('is-below',below);
    pop.style.setProperty('--arrow-x',Math.max(18,Math.min(pw-18,(r.left+r.width/2)-left))+'px');
  }

  function show(index,card){clearTimeout(hideTimer);clearTimeout(showTimer);activeIndex=index;render(index);pop.classList.add('is-open');requestAnimationFrame(()=>position(card));}
  function hide(){clearTimeout(showTimer);clearTimeout(hideTimer);activeIndex=-1;pop?.classList.remove('is-open','is-below');}
  function scheduleShow(index,card){clearTimeout(hideTimer);clearTimeout(showTimer);showTimer=setTimeout(()=>show(index,card),90);}
  function scheduleHide(){clearTimeout(showTimer);clearTimeout(hideTimer);hideTimer=setTimeout(hide,150);}

  function bind(){
    const host=document.getElementById('ql-exec-cards-v1350');if(!host)return false;
    const originals=[...host.querySelectorAll('.ql-exec-card-v1350')];sourceCards=findSources();
    if(originals.length<6||sourceCards.length<6)return false;

    addStyles();
    document.body.classList.remove('ql-exec-modal-open-v1350');
    document.querySelectorAll('body > .ql-exec-modal-v1350').forEach(m=>m.classList.remove('is-open'));

    cards=originals.map((old,index)=>{
      const fresh=old.cloneNode(true);
      fresh.removeAttribute('role');fresh.removeAttribute('tabindex');fresh.removeAttribute('title');
      fresh.setAttribute('aria-label',fresh.querySelector('.ql-exec-card-title-v1350')?.textContent?.trim()||'Indicador');
      old.replaceWith(fresh);
      fresh.addEventListener('pointerenter',()=>scheduleShow(index,fresh));
      fresh.addEventListener('pointerleave',scheduleHide);
      return fresh;
    });

    pop=document.querySelector('body > .ql-indicator-popover-v1356');
    if(!pop){pop=document.createElement('div');pop.className='ql-indicator-popover-v1356';pop.setAttribute('role','tooltip');document.body.appendChild(pop);}
    pop.addEventListener('pointerenter',()=>clearTimeout(hideTimer));
    pop.addEventListener('pointerleave',scheduleHide);

    host.addEventListener('click',e=>{if(e.target.closest('.ql-exec-card-v1350')){e.preventDefault();e.stopImmediatePropagation();}},true);
    host.addEventListener('keydown',e=>{if(e.target.closest('.ql-exec-card-v1350')&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopImmediatePropagation();}},true);
    window.addEventListener('scroll',hide,{passive:true});window.addEventListener('resize',hide);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});

    console.info('[QuotaLab V135.6] Dashboard concluído: popovers hover-only + correção de meses do Fundo de Reserva.');
    return true;
  }

  function boot(){if(bind())return;let tries=0;const timer=setInterval(()=>{tries++;if(bind()||tries>160)clearInterval(timer);},125);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
