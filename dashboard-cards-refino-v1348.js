/* QuotaLab V134.8 — Cards executivos compactos do Dashboard
   - Desktop only
   - Localização robusta dos 6 blocos pela estrutura/texto real
   - Consolida os blocos em uma linha de cards-resumo clicáveis
   - Mantém conteúdo completo em modal sob demanda
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_CARDS_REF_V1348__) return;
  window.__QL_DASH_CARDS_REF_V1348__ = true;

  const defs=[
    {key:'quota',title:'Cota proposta',aliases:['cota atual vs proposta'],icon:'↗'},
    {key:'comp',title:'Composição da cota',aliases:['composição da cota','composicao da cota'],icon:'◔'},
    {key:'fr',title:'Fundo de Reserva',aliases:['fundo de reserva'],icon:'◉'},
    {key:'fo',title:'Fundo de Obras',aliases:['fundo de obras'],icon:'◉'},
    {key:'hist',title:'Evolução histórica',aliases:['evolução histórica','evolucao historica'],icon:'⌁'},
    {key:'inad',title:'Inadimplência',aliases:['inadimplência','inadimplencia'],icon:'!'}
  ];

  const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const stripIds=root=>{if(root.id)root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));};

  function addStyles(){
    if(document.getElementById('ql-dashboard-cards-v1348-css')) return;
    const st=document.createElement('style');
    st.id='ql-dashboard-cards-v1348-css';
    st.textContent=`
      @media (min-width:901px){
        #page-dashboard .ql-exec-cards-v1348{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:10px!important;margin:14px 0 16px!important;}
        #page-dashboard .ql-exec-card-v1348{min-height:108px!important;border:1px solid var(--border)!important;border-radius:17px!important;background:linear-gradient(180deg,rgba(255,255,255,.026),rgba(255,255,255,.012))!important;padding:13px 13px 11px!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;cursor:pointer!important;position:relative!important;overflow:hidden!important;transition:transform .16s ease,filter .16s ease,border-color .16s ease,box-shadow .16s ease!important;}
        #page-dashboard .ql-exec-card-v1348:hover,#page-dashboard .ql-exec-card-v1348:focus-visible{transform:translateY(-2px)!important;filter:brightness(1.05)!important;border-color:rgba(88,166,255,.30)!important;box-shadow:0 14px 30px rgba(0,0,0,.18)!important;outline:none!important;}
        #page-dashboard .ql-exec-card-v1348::after{content:'›';position:absolute;right:11px;bottom:7px;font-size:18px;color:var(--text3);opacity:.52;}
        #page-dashboard .ql-exec-card-head{display:flex;align-items:center;gap:7px;min-width:0;}
        #page-dashboard .ql-exec-card-icon{width:22px;height:22px;display:grid;place-items:center;border-radius:8px;background:rgba(88,166,255,.08);color:#58a6ff;font-size:12px;font-weight:900;flex:0 0 auto;}
        #page-dashboard .ql-exec-card-title{font-size:9.5px!important;line-height:1.15!important;text-transform:uppercase!important;letter-spacing:.045em!important;color:var(--text3)!important;font-weight:850!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-value{font-family:'DM Serif Display','Merriweather',Georgia,serif!important;font-size:22px!important;line-height:1!important;font-weight:800!important;color:var(--text)!important;letter-spacing:-.02em!important;margin:9px 0 4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-sub{font-size:9.5px!important;line-height:1.2!important;color:var(--text3)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;padding-right:17px!important;}
        #page-dashboard .ql-source-hidden-v1348{display:none!important;}
        body > .ql-exec-modal-v1348{position:fixed!important;inset:0!important;z-index:2147483000!important;display:none!important;align-items:center!important;justify-content:center!important;padding:30px!important;background:rgba(2,8,20,.76)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
        body > .ql-exec-modal-v1348.is-open{display:flex!important;}
        body > .ql-exec-modal-v1348 .ql-exec-modal-panel{width:min(1080px,calc(100vw - 60px))!important;max-height:calc(100vh - 60px)!important;overflow:auto!important;position:relative!important;border-radius:22px!important;background:var(--bg2)!important;box-shadow:0 30px 90px rgba(0,0,0,.52)!important;}
        body > .ql-exec-modal-v1348 .ql-exec-modal-close{position:sticky!important;float:right!important;top:12px!important;right:12px!important;z-index:10!important;width:36px!important;height:36px!important;margin:12px 12px -48px 0!important;border-radius:12px!important;border:1px solid var(--border)!important;background:var(--bg3)!important;color:var(--text)!important;display:grid!important;place-items:center!important;font-size:21px!important;cursor:pointer!important;}
        body > .ql-exec-modal-v1348 .ql-exec-modal-content{padding:16px!important;clear:both!important;}
        body > .ql-exec-modal-v1348 .ql-exec-modal-copy{display:block!important;visibility:visible!important;opacity:1!important;margin:0!important;width:100%!important;max-width:none!important;height:auto!important;min-height:unset!important;transform:none!important;}
        body.ql-exec-modal-open{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function containsAlias(el,aliases){
    const t=norm(el.textContent);
    return aliases.some(a=>t.includes(norm(a)));
  }

  function findTextNodeElement(page,aliases){
    const all=[...page.querySelectorAll('*')];
    const candidates=all.filter(el=>{
      if(!containsAlias(el,aliases)) return false;
      const own=[...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>norm(n.textContent)).join(' ');
      return aliases.some(a=>own.includes(norm(a))) || el.children.length<=2;
    });
    candidates.sort((a,b)=>a.textContent.length-b.textContent.length);
    return candidates[0]||null;
  }

  function findCard(el,page){
    if(!el) return null;
    let n=el;
    let best=null;
    for(let i=0;i<9 && n && n!==page;i++,n=n.parentElement){
      const r=n.getBoundingClientRect();
      const txt=(n.innerText||n.textContent||'').trim();
      const cls=(n.className||'').toString().toLowerCase();
      const plausible=r.width>180 && r.height>120 && r.height<520 && txt.length<2400;
      if(plausible) best=n;
      if(plausible && /card|panel|box|widget|metric|dash/.test(cls)) return n;
      if(plausible && n.parentElement){
        const siblings=[...n.parentElement.children].filter(x=>x.nodeType===1);
        if(siblings.length>=2 && siblings.length<=8) return n;
      }
    }
    return best;
  }

  function moneyMatches(text){return [...text.matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0]);}
  function percentMatches(text){return [...text.matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]);}
  function summaryFor(def,card){
    const text=(card.innerText||card.textContent||'').replace(/\s+/g,' ').trim();
    if(def.key==='quota'){
      const m=moneyMatches(text); const proposed=m.find(x=>/719[,\.]35/.test(x))||m[m.length-1]||m[0];
      return {value:proposed||'—',sub:'proposta atual'};
    }
    if(def.key==='comp'){
      const m=moneyMatches(text); return {value:m.find(x=>/56\.109|56,109/.test(x))||m[0]||'—',sub:'total mensal'};
    }
    if(def.key==='fr'){
      const p=percentMatches(text); return {value:(p[0]||'—').replace('.',','),sub:'da meta'};
    }
    if(def.key==='fo'){
      const p=percentMatches(text); return {value:(p[0]||'—').replace('.',','),sub:'sobre despesas'};
    }
    if(def.key==='hist'){
      const t=norm(text); return {value:(t.includes('cresceu mais do que a cota')||t.includes('pressao sobre a cobertura'))?'Despesa em alta':'Ver evolução',sub:'série histórica'};
    }
    if(def.key==='inad'){
      const p=percentMatches(text); const v=(p[p.length-1]||p[0]||'—').replace('.',',');
      return {value:v,sub:/aten[cç][aã]o/i.test(text)?'Atenção':'ver análise'};
    }
    return {value:'Ver análise',sub:'detalhes'};
  }

  function init(){
    const page=document.getElementById('page-dashboard');
    if(!page) return false;
    if(document.getElementById('ql-exec-cards-v1348')) return true;

    const items=[];
    for(const def of defs){
      const marker=findTextNodeElement(page,def.aliases);
      const card=findCard(marker,page);
      if(!marker||!card){
        console.warn('[QuotaLab V134.8] Não localizou bloco:',def.title,marker,card);
        return false;
      }
      items.push({def,card});
    }

    const unique=new Set(items.map(i=>i.card));
    if(unique.size!==6){console.warn('[QuotaLab V134.8] Blocos duplicados detectados; aguardando estrutura final.');return false;}

    addStyles();
    const first=items[0].card;
    const host=document.createElement('div');host.id='ql-exec-cards-v1348';host.className='ql-exec-cards-v1348';
    first.parentElement.insertBefore(host,first);

    document.querySelectorAll('body > .ql-exec-modal-v1348').forEach(el=>el.remove());
    const modal=document.createElement('div');modal.className='ql-exec-modal-v1348';modal.setAttribute('aria-hidden','true');
    const panel=document.createElement('div');panel.className='ql-exec-modal-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
    const close=document.createElement('button');close.className='ql-exec-modal-close';close.type='button';close.textContent='×';close.setAttribute('aria-label','Fechar');
    const content=document.createElement('div');content.className='ql-exec-modal-content';
    panel.append(close,content);modal.appendChild(panel);document.body.appendChild(modal);

    function openFor(item){
      content.innerHTML='';
      const copy=item.card.cloneNode(true);copy.classList.remove('ql-source-hidden-v1348');copy.classList.add('ql-exec-modal-copy');stripIds(copy);content.appendChild(copy);
      modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('ql-exec-modal-open');requestAnimationFrame(()=>panel.scrollTop=0);
    }
    function shut(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('ql-exec-modal-open');content.innerHTML='';}
    close.addEventListener('click',shut);modal.addEventListener('click',e=>{if(e.target===modal)shut();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))shut();});

    items.forEach(item=>{
      const s=summaryFor(item.def,item.card);
      const c=document.createElement('div');c.className='ql-exec-card-v1348';c.setAttribute('role','button');c.setAttribute('tabindex','0');c.setAttribute('aria-label',`Abrir detalhes de ${item.def.title}`);
      c.innerHTML=`<div class="ql-exec-card-head"><span class="ql-exec-card-icon">${item.def.icon}</span><span class="ql-exec-card-title">${item.def.title}</span></div><div class="ql-exec-card-value">${s.value}</div><div class="ql-exec-card-sub">${s.sub}</div>`;
      c.addEventListener('click',()=>openFor(item));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFor(item);}});
      host.appendChild(c);item.card.classList.add('ql-source-hidden-v1348');
    });

    console.info('[QuotaLab V134.8] 6 blocos consolidados em cards executivos clicáveis.');
    return true;
  }

  function boot(){if(init())return;let t=0;const timer=setInterval(()=>{t++;if(init()||t>120)clearInterval(timer);},150);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
