/* QuotaLab V135.0 — consolidação estrutural dos 6 painéis principais do Dashboard
   CORREÇÃO: os 6 painéis-alvo ficam ACIMA do Modo Decisão Rápida.
   A seleção agora usa a estrutura real do HTML:
   - primeira .db-row-3 que contém "Cota atual vs proposta" = 4 cards
   - .db-row seguinte = 2 cards (Evolução histórica + Inadimplência)
   Não depende mais da posição do bloco "O que fazer agora?".
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_CARDS_REF_V1350__) return;
  window.__QL_DASH_CARDS_REF_V1350__ = true;

  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const stripIds=root=>{if(root.id)root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));};

  function addStyles(){
    if(document.getElementById('ql-dashboard-cards-v1350-css')) return;
    const st=document.createElement('style');
    st.id='ql-dashboard-cards-v1350-css';
    st.textContent=`
      @media (min-width:901px){
        #page-dashboard .ql-exec-cards-v1350{
          display:grid!important;
          grid-template-columns:repeat(6,minmax(0,1fr))!important;
          gap:10px!important;
          width:100%!important;
          margin:0 0 16px!important;
        }
        #page-dashboard .ql-exec-card-v1350{
          min-width:0!important;
          min-height:106px!important;
          border:1px solid var(--border)!important;
          border-radius:17px!important;
          background:linear-gradient(180deg,rgba(255,255,255,.028),rgba(255,255,255,.012))!important;
          padding:13px 13px 11px!important;
          display:flex!important;
          flex-direction:column!important;
          justify-content:space-between!important;
          position:relative!important;
          overflow:hidden!important;
          cursor:pointer!important;
          box-shadow:0 8px 20px rgba(0,0,0,.08)!important;
          transition:transform .16s ease,filter .16s ease,border-color .16s ease,box-shadow .16s ease!important;
        }
        #page-dashboard .ql-exec-card-v1350:hover,#page-dashboard .ql-exec-card-v1350:focus-visible{
          transform:translateY(-2px)!important;
          filter:brightness(1.05)!important;
          border-color:rgba(88,166,255,.30)!important;
          box-shadow:0 14px 30px rgba(0,0,0,.18)!important;
          outline:none!important;
        }
        #page-dashboard .ql-exec-card-v1350::after{content:'›';position:absolute;right:11px;bottom:7px;font-size:18px;color:var(--text3);opacity:.52;}
        #page-dashboard .ql-exec-card-head-v1350{display:flex;align-items:center;gap:7px;min-width:0;}
        #page-dashboard .ql-exec-card-icon-v1350{width:22px;height:22px;display:grid;place-items:center;border-radius:8px;background:rgba(88,166,255,.08);color:#58a6ff;font-size:12px;font-weight:900;flex:0 0 auto;}
        #page-dashboard .ql-exec-card-title-v1350{font-size:9.5px!important;line-height:1.15!important;text-transform:uppercase!important;letter-spacing:.045em!important;color:var(--text3)!important;font-weight:850!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-value-v1350{font-family:'DM Serif Display','Merriweather',Georgia,serif!important;font-size:21px!important;line-height:1!important;font-weight:800!important;color:var(--text)!important;letter-spacing:-.02em!important;margin:9px 0 4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-sub-v1350{font-size:9.5px!important;line-height:1.2!important;color:var(--text3)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;padding-right:17px!important;}
        #page-dashboard .ql-original-row-hidden-v1350{display:none!important;}

        body > .ql-exec-modal-v1350{position:fixed!important;inset:0!important;z-index:2147483000!important;display:none!important;align-items:center!important;justify-content:center!important;padding:30px!important;background:rgba(2,8,20,.76)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
        body > .ql-exec-modal-v1350.is-open{display:flex!important;}
        body > .ql-exec-modal-v1350 .ql-exec-modal-panel-v1350{width:min(1080px,calc(100vw - 60px))!important;max-height:calc(100vh - 60px)!important;overflow:auto!important;position:relative!important;border:1px solid var(--border)!important;border-radius:22px!important;background:var(--bg2)!important;box-shadow:0 30px 90px rgba(0,0,0,.52)!important;}
        body > .ql-exec-modal-v1350 .ql-exec-modal-close-v1350{position:sticky!important;float:right!important;top:12px!important;right:12px!important;z-index:10!important;width:36px!important;height:36px!important;margin:12px 12px -48px 0!important;border-radius:12px!important;border:1px solid var(--border)!important;background:var(--bg3)!important;color:var(--text)!important;display:grid!important;place-items:center!important;font-size:21px!important;cursor:pointer!important;}
        body > .ql-exec-modal-v1350 .ql-exec-modal-content-v1350{padding:16px!important;clear:both!important;}
        body > .ql-exec-modal-v1350 .ql-exec-modal-copy-v1350{display:block!important;visibility:visible!important;opacity:1!important;margin:0!important;width:100%!important;max-width:none!important;height:auto!important;min-height:unset!important;transform:none!important;}
        body.ql-exec-modal-open-v1350{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function labelOf(card){
    const lbl=card.querySelector('.db-c-label');
    return (lbl?.textContent||'Análise').replace(/\s+/g,' ').trim();
  }

  function money(text){return [...text.matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0]);}
  function pct(text){return [...text.matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]);}

  function summary(card,index){
    const text=(card.innerText||card.textContent||'').replace(/\s+/g,' ').trim();
    const m=money(text), p=pct(text);
    if(index===0) return {title:'Cota proposta',icon:'↗',value:m[m.length-1]||m[0]||'Ver',sub:'atual x proposta'};
    if(index===1) return {title:'Composição da cota',icon:'◔',value:m[0]||'Ver',sub:'composição mensal'};
    if(index===2) return {title:labelOf(card)||'Fundo de Reserva',icon:'◉',value:p[0]||m[0]||'Ver',sub:'reserva'};
    if(index===3) return {title:labelOf(card)||'Fundo de Obras',icon:'◉',value:p[0]||m[0]||'Ver',sub:'obras'};
    if(index===4) return {title:'Evolução histórica',icon:'⌁',value:'Ver evolução',sub:'série histórica'};
    return {title:'Inadimplência',icon:'!',value:p[p.length-1]||p[0]||m[0]||'Ver',sub:'situação atual'};
  }

  function findRows(page){
    const rows3=[...page.querySelectorAll('.db-row-3')];
    const row1=rows3.find(row=>{
      const labels=[...row.querySelectorAll(':scope > .db-c > .db-c-label')].map(x=>norm(x.textContent));
      return labels.some(x=>x.includes('cota atual vs proposta'));
    });
    if(!row1) return null;

    let row2=row1.nextElementSibling;
    while(row2 && !(row2.classList && row2.classList.contains('db-row'))) row2=row2.nextElementSibling;
    if(!row2) return null;

    const first=[...row1.children].filter(el=>el.classList?.contains('db-c'));
    const second=[...row2.children].filter(el=>el.classList?.contains('db-c'));
    if(first.length<4 || second.length<2) return null;
    return {row1,row2,cards:[...first.slice(0,4),...second.slice(0,2)]};
  }

  function init(){
    const page=document.getElementById('page-dashboard');
    if(!page) return false;
    if(document.getElementById('ql-exec-cards-v1350')) return true;

    const found=findRows(page);
    if(!found){console.warn('[QuotaLab V135.0] Estrutura dos 6 cards principais ainda não disponível.');return false;}

    addStyles();

    const host=document.createElement('div');
    host.id='ql-exec-cards-v1350';
    host.className='ql-exec-cards-v1350';
    found.row1.parentElement.insertBefore(host,found.row1);

    const modal=document.createElement('div');
    modal.className='ql-exec-modal-v1350';
    modal.setAttribute('aria-hidden','true');
    const panel=document.createElement('div');
    panel.className='ql-exec-modal-panel-v1350';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    const close=document.createElement('button');
    close.type='button';close.className='ql-exec-modal-close-v1350';close.textContent='×';close.setAttribute('aria-label','Fechar');
    const content=document.createElement('div');content.className='ql-exec-modal-content-v1350';
    panel.append(close,content);modal.appendChild(panel);document.body.appendChild(modal);

    function shut(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('ql-exec-modal-open-v1350');content.innerHTML='';}
    function openCard(card){
      content.innerHTML='';
      const copy=card.cloneNode(true);stripIds(copy);copy.classList.add('ql-exec-modal-copy-v1350');content.appendChild(copy);
      modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('ql-exec-modal-open-v1350');panel.scrollTop=0;
    }
    close.addEventListener('click',shut);
    modal.addEventListener('click',e=>{if(e.target===modal)shut();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))shut();});

    found.cards.forEach((card,index)=>{
      const s=summary(card,index);
      const el=document.createElement('div');
      el.className='ql-exec-card-v1350';
      el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',`Abrir detalhes de ${s.title}`);
      el.innerHTML=`<div class="ql-exec-card-head-v1350"><span class="ql-exec-card-icon-v1350">${s.icon}</span><span class="ql-exec-card-title-v1350">${s.title}</span></div><div class="ql-exec-card-value-v1350">${s.value}</div><div class="ql-exec-card-sub-v1350">${s.sub}</div>`;
      el.addEventListener('click',()=>openCard(card));
      el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard(card);}});
      host.appendChild(el);
    });

    found.row1.classList.add('ql-original-row-hidden-v1350');
    found.row2.classList.add('ql-original-row-hidden-v1350');

    console.info('[QuotaLab V135.0] 6 painéis principais consolidados pela estrutura real: 4 da ROW 1 + 2 da ROW 2.');
    return true;
  }

  function boot(){if(init())return;let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>160)clearInterval(timer);},125);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
