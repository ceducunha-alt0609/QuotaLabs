/* QuotaLab V134.7 — Cards executivos compactos do Dashboard
   - Desktop only
   - Consolida 6 blocos em uma única linha de cards-resumo clicáveis
   - Mantém o conteúdo completo original em modal sob demanda
   - Não altera a experiência mobile
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_CARDS_REF_V1347__) return;
  window.__QL_DASH_CARDS_REF_V1347__ = true;

  const defs = [
    {key:'quota', title:'Cota proposta', aliases:['cota atual vs proposta'], icon:'↗'},
    {key:'comp', title:'Composição da cota', aliases:['composição da cota','composicao da cota'], icon:'◔'},
    {key:'fr', title:'Fundo de Reserva', aliases:['fundo de reserva'], icon:'◉'},
    {key:'fo', title:'Fundo de Obras', aliases:['fundo de obras'], icon:'◉'},
    {key:'hist', title:'Evolução histórica', aliases:['evolução histórica','evolucao historica'], icon:'⌁'},
    {key:'inad', title:'Inadimplência', aliases:['inadimplência','inadimplencia'], icon:'!'}
  ];

  function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();}
  function stripIds(root){if(root.id)root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));}

  function addStyles(){
    if(document.getElementById('ql-dashboard-cards-v1347-css')) return;
    const st=document.createElement('style');
    st.id='ql-dashboard-cards-v1347-css';
    st.textContent=`
      @media (min-width:901px){
        #page-dashboard .ql-exec-cards-v1347{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:12px!important;margin:14px 0 16px!important;}
        #page-dashboard .ql-exec-card-v1347{min-height:112px!important;border:1px solid var(--border)!important;border-radius:18px!important;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.012))!important;padding:14px 14px 12px!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;cursor:pointer!important;position:relative!important;overflow:hidden!important;transition:transform .16s ease,filter .16s ease,border-color .16s ease,box-shadow .16s ease!important;}
        #page-dashboard .ql-exec-card-v1347:hover,#page-dashboard .ql-exec-card-v1347:focus-visible{transform:translateY(-2px)!important;filter:brightness(1.05)!important;border-color:rgba(88,166,255,.28)!important;box-shadow:0 14px 30px rgba(0,0,0,.18)!important;outline:none!important;}
        #page-dashboard .ql-exec-card-v1347::after{content:'›';position:absolute;right:12px;bottom:8px;font-size:18px;color:var(--text3);opacity:.55;}
        #page-dashboard .ql-exec-card-head{display:flex;align-items:center;gap:7px;min-width:0;}
        #page-dashboard .ql-exec-card-icon{width:22px;height:22px;display:grid;place-items:center;border-radius:8px;background:rgba(88,166,255,.08);color:#58a6ff;font-size:12px;font-weight:900;flex:0 0 auto;}
        #page-dashboard .ql-exec-card-title{font-size:10px!important;line-height:1.15!important;text-transform:uppercase!important;letter-spacing:.055em!important;color:var(--text3)!important;font-weight:850!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-value{font-family:'DM Serif Display','Merriweather',Georgia,serif!important;font-size:24px!important;line-height:1!important;font-weight:800!important;color:var(--text)!important;letter-spacing:-.025em!important;margin:10px 0 4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-sub{font-size:10px!important;line-height:1.2!important;color:var(--text3)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;padding-right:18px!important;}
        #page-dashboard .ql-source-hidden-v1347{display:none!important;}

        body > .ql-exec-modal-v1347{position:fixed!important;inset:0!important;z-index:2147483000!important;display:none!important;align-items:center!important;justify-content:center!important;padding:30px!important;background:rgba(2,8,20,.76)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
        body > .ql-exec-modal-v1347.is-open{display:flex!important;}
        body > .ql-exec-modal-v1347 .ql-exec-modal-panel{width:min(1080px,calc(100vw - 60px))!important;max-height:calc(100vh - 60px)!important;overflow:auto!important;position:relative!important;border-radius:22px!important;background:var(--bg2)!important;box-shadow:0 30px 90px rgba(0,0,0,.52)!important;}
        body > .ql-exec-modal-v1347 .ql-exec-modal-close{position:sticky!important;float:right!important;top:12px!important;right:12px!important;z-index:10!important;width:36px!important;height:36px!important;margin:12px 12px -48px 0!important;border-radius:12px!important;border:1px solid var(--border)!important;background:var(--bg3)!important;color:var(--text)!important;display:grid!important;place-items:center!important;font-size:21px!important;cursor:pointer!important;}
        body > .ql-exec-modal-v1347 .ql-exec-modal-content{padding:16px!important;clear:both!important;}
        body > .ql-exec-modal-v1347 .ql-exec-modal-copy{display:block!important;visibility:visible!important;opacity:1!important;margin:0!important;width:100%!important;max-width:none!important;height:auto!important;min-height:unset!important;transform:none!important;}
        body.ql-exec-modal-open{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function findHeading(page, aliases){
    const targets=aliases.map(norm);
    const els=[...page.querySelectorAll('h1,h2,h3,h4,h5,h6,.title,.card-title,[class*="title"],strong,span,div')];
    return els.find(el=>targets.includes(norm(el.textContent)) && el.children.length<=3) || null;
  }

  function findCardFromHeading(el,page){
    if(!el) return null;
    let n=el;
    for(let i=0;i<7 && n && n!==page;i++,n=n.parentElement){
      const cls=(n.className||'').toString().toLowerCase();
      const txt=norm(n.textContent);
      if((/card|panel|box|widget|dash/.test(cls)) && txt.length<1800) return n;
    }
    n=el;
    for(let i=0;i<5 && n.parentElement && n.parentElement!==page;i++,n=n.parentElement){}
    return n!==el?n:null;
  }

  function moneyMatches(text){return [...text.matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0]);}
  function percentMatches(text){return [...text.matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]);}

  function summaryFor(def,card){
    const text=(card.innerText||card.textContent||'').replace(/\s+/g,' ').trim();
    if(def.key==='quota'){
      const m=moneyMatches(text); return {value:m[0]||'—',sub:'vigente x proposta'};
    }
    if(def.key==='comp'){
      const m=moneyMatches(text); return {value:m[0]||'—',sub:'composição mensal'};
    }
    if(def.key==='fr'){
      const p=percentMatches(text); return {value:(p[0]||'—').replace('.',','),sub:'da meta atual'};
    }
    if(def.key==='fo'){
      const p=percentMatches(text); return {value:(p[0]||'—').replace('.',','),sub:'sobre despesas'};
    }
    if(def.key==='hist'){
      const t=norm(text);
      let v='Ver evolução';
      if(t.includes('cresceu mais do que a cota')||t.includes('pressao sobre a cobertura')) v='Despesa em alta';
      return {value:v,sub:'série histórica'};
    }
    if(def.key==='inad'){
      const p=percentMatches(text); const v=(p[p.length-1]||p[0]||'—').replace('.',',');
      const status=/aten[cç][aã]o/i.test(text)?'Atenção':'ver análise';
      return {value:v,sub:status};
    }
    return {value:'Ver análise',sub:'detalhes'};
  }

  function init(){
    const page=document.getElementById('page-dashboard');
    if(!page) return false;
    if(document.getElementById('ql-exec-cards-v1347')) return true;

    const items=[];
    for(const def of defs){
      const heading=findHeading(page,def.aliases);
      const card=findCardFromHeading(heading,page);
      if(!heading||!card) return false;
      items.push({def,card});
    }

    addStyles();

    const first=items[0].card;
    const host=document.createElement('div');
    host.id='ql-exec-cards-v1347';
    host.className='ql-exec-cards-v1347';
    first.parentElement.insertBefore(host,first);

    document.querySelectorAll('body > .ql-exec-modal-v1347').forEach(el=>el.remove());
    const modal=document.createElement('div');modal.className='ql-exec-modal-v1347';modal.setAttribute('aria-hidden','true');
    const panel=document.createElement('div');panel.className='ql-exec-modal-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    const close=document.createElement('button');close.className='ql-exec-modal-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar');
    const content=document.createElement('div');content.className='ql-exec-modal-content';
    panel.append(close,content);modal.appendChild(panel);document.body.appendChild(modal);

    let current=null;
    function openFor(item){
      current=item;
      content.innerHTML='';
      const copy=item.card.cloneNode(true);
      copy.classList.remove('ql-source-hidden-v1347');
      copy.classList.add('ql-exec-modal-copy');
      stripIds(copy);
      content.appendChild(copy);
      modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('ql-exec-modal-open');
      requestAnimationFrame(()=>panel.scrollTop=0);
    }
    function shut(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('ql-exec-modal-open');content.innerHTML='';current=null;}
    close.addEventListener('click',shut);modal.addEventListener('click',e=>{if(e.target===modal)shut();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))shut();});

    items.forEach(item=>{
      const s=summaryFor(item.def,item.card);
      const c=document.createElement('div');
      c.className='ql-exec-card-v1347';c.setAttribute('role','button');c.setAttribute('tabindex','0');c.setAttribute('aria-label',`Abrir detalhes de ${item.def.title}`);
      c.innerHTML=`<div class="ql-exec-card-head"><span class="ql-exec-card-icon">${item.def.icon}</span><span class="ql-exec-card-title">${item.def.title}</span></div><div class="ql-exec-card-value">${s.value}</div><div class="ql-exec-card-sub">${s.sub}</div>`;
      c.addEventListener('click',()=>openFor(item));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFor(item);}});
      host.appendChild(c);
      item.card.classList.add('ql-source-hidden-v1347');
    });

    console.info('[QuotaLab V134.7] 6 blocos do Dashboard consolidados em cards executivos clicáveis.');
    return true;
  }

  function boot(){if(init())return;let t=0;const timer=setInterval(()=>{t++;if(init()||t>100)clearInterval(timer);},150);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
