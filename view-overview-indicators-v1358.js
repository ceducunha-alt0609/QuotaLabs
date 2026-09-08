/* QuotaLab V135.8 — Visão Geral: integração robusta dos 5 indicadores ao painel principal
   Desktop only
   - Localiza o painel principal pela proposta condominial
   - Localiza a faixa pelos 5 conteúdos simultâneos, sem depender de texto exato
   - Move a faixa para dentro do painel, logo abaixo da sugestão de arredondamento
   - Mantém o visual original e reduz levemente a largura horizontal
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_OVERVIEW_INDICATORS_V1358__) return;
  window.__QL_OVERVIEW_INDICATORS_V1358__ = true;

  const norm = s => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();

  const visible = el => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');

  function textHas(el, terms){
    const t = norm(el?.innerText || el?.textContent || '');
    return terms.every(term => t.includes(norm(term)));
  }

  function candidatesContaining(terms){
    return [...document.querySelectorAll('section,article,div')]
      .filter(visible)
      .filter(el => textHas(el, terms));
  }

  function smallestCandidate(terms, guard){
    const list = candidatesContaining(terms)
      .filter(el => !guard || guard(el))
      .map(el => ({el, r: el.getBoundingClientRect()}))
      .filter(x => x.r.width > 150 && x.r.height > 30)
      .sort((a,b) => (a.r.width*a.r.height) - (b.r.width*b.r.height));
    return list[0]?.el || null;
  }

  function findHero(){
    return smallestCandidate(['proposta condominial','r$ 719'], el => {
      const r = el.getBoundingClientRect();
      return r.width > 700 && r.height > 140;
    }) || smallestCandidate(['proposta condominial','sugestao de arredondamento']);
  }

  function findSuggestion(hero){
    if (!hero) return null;
    const list = [...hero.querySelectorAll('div,section,article')]
      .filter(visible)
      .filter(el => textHas(el,['sugestao de arredondamento']))
      .map(el => ({el, r:el.getBoundingClientRect()}))
      .filter(x => x.r.width > 250 && x.r.height > 45)
      .sort((a,b)=>(a.r.width*a.r.height)-(b.r.width*b.r.height));
    return list[0]?.el || null;
  }

  function findStrip(hero){
    const terms=['despesas','f. reserva','f. obras','inadimpl','total / mes'];
    let list = candidatesContaining(terms)
      .filter(el => !hero?.contains(el))
      .map(el => ({el, r:el.getBoundingClientRect()}))
      .filter(x => x.r.width > 700 && x.r.height >= 45 && x.r.height < 140)
      .sort((a,b) => a.r.height - b.r.height || a.r.width - b.r.width);

    if (list.length) return list[0].el;

    /* fallback tolera rótulos sem pontuação/abreviações diferentes */
    const all=[...document.querySelectorAll('section,article,div')].filter(visible);
    list=all.map(el=>({el,t:norm(el.innerText||el.textContent||''),r:el.getBoundingClientRect()}))
      .filter(x=>!hero?.contains(x.el))
      .filter(x=>x.t.includes('despesas') && x.t.includes('reserva') && x.t.includes('obras') && x.t.includes('inadimpl') && x.t.includes('total'))
      .filter(x=>x.r.width>700 && x.r.height>=45 && x.r.height<150)
      .sort((a,b)=>a.r.height-b.r.height || a.r.width-b.r.width);
    return list[0]?.el || null;
  }

  function addStyles(){
    if (document.getElementById('ql-overview-indicators-v1358-css')) return;
    const st=document.createElement('style');
    st.id='ql-overview-indicators-v1358-css';
    st.textContent=`
      @media (min-width:901px){
        .ql-overview-indicators-v1358{
          width:94%!important;
          max-width:1050px!important;
          margin:12px 0 0!important;
          gap:8px!important;
          box-sizing:border-box!important;
        }
        .ql-overview-indicators-v1358 > *{min-width:0!important;}
      }
    `;
    document.head.appendChild(st);
  }

  function apply(){
    const hero=findHero();
    if(!hero) return false;
    const suggestion=findSuggestion(hero);
    const strip=findStrip(hero);
    if(!suggestion || !strip || hero.contains(strip)) return false;

    addStyles();
    strip.classList.remove('ql-overview-indicators-v1357');
    strip.classList.add('ql-overview-indicators-v1358');
    suggestion.insertAdjacentElement('afterend',strip);

    console.info('[QuotaLab V135.8] Indicadores movidos para dentro do painel principal da Visão Geral.');
    return true;
  }

  function boot(){
    if(apply()) return;
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(apply() || tries>240) clearInterval(timer);
    },125);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
