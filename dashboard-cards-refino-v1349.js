/* QuotaLab V134.9 — 6 cards executivos compactos do Dashboard
   - Desktop only
   - Localiza somente os blocos abaixo do Modo Decisão Rápida
   - Usa posição + geometria visual, evitando títulos repetidos em outras seções
   - Conteúdo original completo permanece disponível em modal
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_CARDS_REF_V1349__) return;
  window.__QL_DASH_CARDS_REF_V1349__ = true;

  const defs = [
    {key:'quota', title:'Cota proposta', aliases:['cota atual vs proposta'], icon:'↗'},
    {key:'comp', title:'Composição da cota', aliases:['composição da cota','composicao da cota'], icon:'◔'},
    {key:'fr', title:'Fundo de Reserva', aliases:['fundo de reserva'], icon:'◉'},
    {key:'fo', title:'Fundo de Obras', aliases:['fundo de obras'], icon:'◉'},
    {key:'hist', title:'Evolução histórica', aliases:['evolução histórica','evolucao historica'], icon:'⌁'},
    {key:'inad', title:'Inadimplência', aliases:['inadimplência','inadimplencia'], icon:'!'}
  ];

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const stripIds = root => { if (root.id) root.removeAttribute('id'); root.querySelectorAll('[id]').forEach(el => el.removeAttribute('id')); };

  function addStyles(){
    if (document.getElementById('ql-dashboard-cards-v1349-css')) return;
    const st = document.createElement('style');
    st.id = 'ql-dashboard-cards-v1349-css';
    st.textContent = `
      @media (min-width:901px){
        #page-dashboard .ql-exec-cards-v1349{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:10px!important;margin:14px 0 16px!important;width:100%!important;}
        #page-dashboard .ql-exec-card-v1349{min-width:0!important;min-height:106px!important;border:1px solid var(--border)!important;border-radius:17px!important;background:linear-gradient(180deg,rgba(255,255,255,.026),rgba(255,255,255,.012))!important;padding:13px 13px 11px!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;cursor:pointer!important;position:relative!important;overflow:hidden!important;transition:transform .16s ease,filter .16s ease,border-color .16s ease,box-shadow .16s ease!important;}
        #page-dashboard .ql-exec-card-v1349:hover,#page-dashboard .ql-exec-card-v1349:focus-visible{transform:translateY(-2px)!important;filter:brightness(1.05)!important;border-color:rgba(88,166,255,.30)!important;box-shadow:0 14px 30px rgba(0,0,0,.18)!important;outline:none!important;}
        #page-dashboard .ql-exec-card-v1349::after{content:'›';position:absolute;right:11px;bottom:7px;font-size:18px;color:var(--text3);opacity:.52;}
        #page-dashboard .ql-exec-card-head{display:flex;align-items:center;gap:7px;min-width:0;}
        #page-dashboard .ql-exec-card-icon{width:22px;height:22px;display:grid;place-items:center;border-radius:8px;background:rgba(88,166,255,.08);color:#58a6ff;font-size:12px;font-weight:900;flex:0 0 auto;}
        #page-dashboard .ql-exec-card-title{font-size:9.5px!important;line-height:1.15!important;text-transform:uppercase!important;letter-spacing:.045em!important;color:var(--text3)!important;font-weight:850!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-value{font-family:'DM Serif Display','Merriweather',Georgia,serif!important;font-size:22px!important;line-height:1!important;font-weight:800!important;color:var(--text)!important;letter-spacing:-.02em!important;margin:9px 0 4px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;}
        #page-dashboard .ql-exec-card-sub{font-size:9.5px!important;line-height:1.2!important;color:var(--text3)!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;padding-right:17px!important;}
        #page-dashboard .ql-source-hidden-v1349{display:none!important;}
        body > .ql-exec-modal-v1349{position:fixed!important;inset:0!important;z-index:2147483000!important;display:none!important;align-items:center!important;justify-content:center!important;padding:30px!important;background:rgba(2,8,20,.76)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
        body > .ql-exec-modal-v1349.is-open{display:flex!important;}
        body > .ql-exec-modal-v1349 .ql-exec-modal-panel{width:min(1080px,calc(100vw - 60px))!important;max-height:calc(100vh - 60px)!important;overflow:auto!important;position:relative!important;border-radius:22px!important;background:var(--bg2)!important;box-shadow:0 30px 90px rgba(0,0,0,.52)!important;}
        body > .ql-exec-modal-v1349 .ql-exec-modal-close{position:sticky!important;float:right!important;top:12px!important;right:12px!important;z-index:10!important;width:36px!important;height:36px!important;margin:12px 12px -48px 0!important;border-radius:12px!important;border:1px solid var(--border)!important;background:var(--bg3)!important;color:var(--text)!important;display:grid!important;place-items:center!important;font-size:21px!important;cursor:pointer!important;}
        body > .ql-exec-modal-v1349 .ql-exec-modal-content{padding:16px!important;clear:both!important;}
        body > .ql-exec-modal-v1349 .ql-exec-modal-copy{display:block!important;visibility:visible!important;opacity:1!important;margin:0!important;width:100%!important;max-width:none!important;height:auto!important;min-height:unset!important;transform:none!important;}
        body.ql-exec-modal-open{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function decisionBottom(page){
    const btn = document.getElementById('db-decision-btn');
    if (!btn) return null;
    let n = btn;
    let card = null;
    for (let i=0; i<9 && n && n!==page; i++, n=n.parentElement){
      const r = n.getBoundingClientRect();
      if (r.width > 600 && r.height > 180 && r.height < 600) card = n;
    }
    return card ? card.getBoundingClientRect().bottom : btn.getBoundingClientRect().bottom;
  }

  function findMarker(page, aliases, minTop){
    const targets = aliases.map(norm);
    const all = [...page.querySelectorAll('*')];
    const matches = all.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0 || r.top < minTop - 4) return false;
      const t = norm(el.textContent);
      return targets.some(a => t === a || t.startsWith(a + ' ') || t.includes(a));
    });
    matches.sort((a,b) => {
      const ta = norm(a.textContent), tb = norm(b.textContent);
      const exactA = targets.includes(ta) ? 0 : 1;
      const exactB = targets.includes(tb) ? 0 : 1;
      if (exactA !== exactB) return exactA - exactB;
      if (ta.length !== tb.length) return ta.length - tb.length;
      const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
      return (ra.width*ra.height) - (rb.width*rb.height);
    });
    return matches[0] || null;
  }

  function findVisualCard(marker, page, minTop){
    if (!marker) return null;
    let n = marker;
    for (let i=0; i<10 && n && n!==page; i++, n=n.parentElement){
      const r = n.getBoundingClientRect();
      if (r.top < minTop - 8) continue;
      const cs = getComputedStyle(n);
      const radius = parseFloat(cs.borderTopLeftRadius) || 0;
      const border = parseFloat(cs.borderTopWidth) || 0;
      const plausible = r.width >= 220 && r.height >= 150 && r.height <= 520;
      const visual = radius >= 10 && (border > 0 || cs.backgroundColor !== 'rgba(0, 0, 0, 0)');
      if (plausible && visual) return n;
    }
    return null;
  }

  function moneyMatches(text){ return [...text.matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0]); }
  function percentMatches(text){ return [...text.matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]); }
  function summaryFor(def, card){
    const text = (card.innerText || card.textContent || '').replace(/\s+/g,' ').trim();
    if (def.key==='quota'){
      const m=moneyMatches(text); return {value:m.find(x=>/719[,\.]35/.test(x)) || m[m.length-1] || m[0] || '—', sub:'proposta atual'};
    }
    if (def.key==='comp'){
      const m=moneyMatches(text); return {value:m.find(x=>/56\.109|56,109/.test(x)) || m[0] || '—', sub:'total mensal'};
    }
    if (def.key==='fr'){
      const p=percentMatches(text); return {value:(p[0]||'—').replace('.',','), sub:'da meta'};
    }
    if (def.key==='fo'){
      const p=percentMatches(text); return {value:(p[0]||'—').replace('.',','), sub:'sobre despesas'};
    }
    if (def.key==='hist'){
      const t=norm(text); return {value:(t.includes('cresceu mais do que a cota')||t.includes('pressao sobre a cobertura'))?'Despesa em alta':'Ver evolução', sub:'série histórica'};
    }
    if (def.key==='inad'){
      const p=percentMatches(text); return {value:(p[p.length-1]||p[0]||'—').replace('.',','), sub:/aten[cç][aã]o/i.test(text)?'Atenção':'ver análise'};
    }
    return {value:'Ver análise',sub:'detalhes'};
  }

  function init(){
    const page = document.getElementById('page-dashboard');
    if (!page) return false;
    if (document.getElementById('ql-exec-cards-v1349')) return true;

    const minTop = decisionBottom(page);
    if (minTop == null) return false;

    const items=[];
    for (const def of defs){
      const marker = findMarker(page, def.aliases, minTop);
      const card = findVisualCard(marker, page, minTop);
      if (!marker || !card){
        console.warn('[QuotaLab V134.9] Não localizou após Decisão Rápida:', def.title, marker, card);
        return false;
      }
      items.push({def,card});
    }

    if (new Set(items.map(i=>i.card)).size !== 6){
      console.warn('[QuotaLab V134.9] Os seis cards visuais ainda não ficaram únicos.');
      return false;
    }

    addStyles();
    const host = document.createElement('div');
    host.id='ql-exec-cards-v1349';
    host.className='ql-exec-cards-v1349';

    const first = items.slice().sort((a,b)=>a.card.getBoundingClientRect().top-b.card.getBoundingClientRect().top || a.card.getBoundingClientRect().left-b.card.getBoundingClientRect().left)[0].card;
    const parent = first.parentElement;
    parent.insertBefore(host, first);

    document.querySelectorAll('body > .ql-exec-modal-v1349').forEach(el=>el.remove());
    const modal=document.createElement('div'); modal.className='ql-exec-modal-v1349'; modal.setAttribute('aria-hidden','true');
    const panel=document.createElement('div'); panel.className='ql-exec-modal-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true');
    const close=document.createElement('button'); close.className='ql-exec-modal-close'; close.type='button'; close.textContent='×'; close.setAttribute('aria-label','Fechar');
    const content=document.createElement('div'); content.className='ql-exec-modal-content';
    panel.append(close,content); modal.appendChild(panel); document.body.appendChild(modal);

    function openFor(item){
      content.innerHTML='';
      const copy=item.card.cloneNode(true); copy.classList.remove('ql-source-hidden-v1349'); copy.classList.add('ql-exec-modal-copy'); stripIds(copy); content.appendChild(copy);
      modal.classList.add('is-open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('ql-exec-modal-open'); requestAnimationFrame(()=>panel.scrollTop=0);
    }
    function shut(){ modal.classList.remove('is-open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('ql-exec-modal-open'); content.innerHTML=''; }
    close.addEventListener('click',shut); modal.addEventListener('click',e=>{if(e.target===modal)shut();}); document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))shut();});

    items.forEach(item=>{
      const s=summaryFor(item.def,item.card);
      const c=document.createElement('div'); c.className='ql-exec-card-v1349'; c.setAttribute('role','button'); c.setAttribute('tabindex','0'); c.setAttribute('aria-label',`Abrir detalhes de ${item.def.title}`);
      c.innerHTML=`<div class="ql-exec-card-head"><span class="ql-exec-card-icon">${item.def.icon}</span><span class="ql-exec-card-title">${item.def.title}</span></div><div class="ql-exec-card-value">${s.value}</div><div class="ql-exec-card-sub">${s.sub}</div>`;
      c.addEventListener('click',()=>openFor(item)); c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openFor(item);}});
      host.appendChild(c); item.card.classList.add('ql-source-hidden-v1349');
    });

    console.info('[QuotaLab V134.9] 6 cards executivos localizados por posição/geometria e consolidados.');
    return true;
  }

  function boot(){ if(init()) return; let t=0; const timer=setInterval(()=>{t++;if(init()||t>140)clearInterval(timer);},150); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
