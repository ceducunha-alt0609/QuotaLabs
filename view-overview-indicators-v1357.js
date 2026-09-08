/* QuotaLab V135.7 — Visão Geral: indicadores integrados ao painel principal
   Desktop only
   - Move a faixa de 5 indicadores (Despesas, Reserva, Obras, Inadimplência, Total/mês)
     para dentro do painel principal, logo abaixo da Sugestão de arredondamento.
   - Mantém o estilo original dos indicadores.
   - Reduz apenas um pouco o comprimento horizontal da faixa.
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_OVERVIEW_INDICATORS_V1357__) return;
  window.__QL_OVERVIEW_INDICATORS_V1357__ = true;

  const norm = s => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ').trim().toLowerCase();

  const visible = el => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');

  function findVisibleExact(text){
    const target = norm(text);
    const nodes = document.querySelectorAll('div,span,p,strong,b,h1,h2,h3,h4,h5,label');
    for (const el of nodes){
      if (!visible(el)) continue;
      if (norm(el.textContent) === target) return el;
    }
    return null;
  }

  function lowestCommonAncestor(nodes){
    if (!nodes.length || nodes.some(n => !n)) return null;
    let cur = nodes[0].parentElement;
    while (cur && cur !== document.body){
      if (nodes.every(n => cur.contains(n))) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function findSuggestionBlock(){
    const title = [...document.querySelectorAll('div,span,p,strong,b')]
      .find(el => visible(el) && norm(el.textContent).includes('sugestao de arredondamento'));
    if (!title) return null;
    const btn = [...document.querySelectorAll('button,a')]
      .find(el => visible(el) && /^usar\s+r\$/i.test((el.textContent || '').trim()));
    if (!btn) return null;
    let cur = title.parentElement;
    while (cur && cur !== document.body){
      if (cur.contains(btn)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  function addStyles(){
    if (document.getElementById('ql-overview-indicators-v1357-css')) return;
    const st = document.createElement('style');
    st.id = 'ql-overview-indicators-v1357-css';
    st.textContent = `
      @media (min-width:901px){
        .ql-overview-indicators-v1357{
          width:96%!important;
          max-width:980px!important;
          margin:12px 0 0!important;
          gap:8px!important;
          box-sizing:border-box!important;
        }
        .ql-overview-indicators-v1357 > *{
          min-width:0!important;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function apply(){
    const labels = ['DESPESAS','F. RESERVA','F. OBRAS','INADIMPLÊNCIA','TOTAL / MÊS'];
    const labelNodes = labels.map(findVisibleExact);
    if (labelNodes.some(n => !n)) return false;

    let strip = lowestCommonAncestor(labelNodes);
    if (!strip) return false;

    /* Proteção: queremos apenas a faixa compacta, não um container grande da página. */
    while (strip.parentElement && strip.children.length < 5 && strip.parentElement !== document.body){
      const p = strip.parentElement;
      if (labelNodes.every(n => p.contains(n)) && p.children.length <= 7) strip = p;
      else break;
    }

    const suggestion = findSuggestionBlock();
    if (!suggestion || suggestion.contains(strip) || strip.contains(suggestion)) return false;

    const destination = suggestion.parentElement;
    if (!destination) return false;

    addStyles();
    strip.classList.add('ql-overview-indicators-v1357');
    suggestion.insertAdjacentElement('afterend', strip);

    console.info('[QuotaLab V135.7] Indicadores da Visão Geral integrados ao painel principal.');
    return true;
  }

  function boot(){
    if (apply()) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (apply() || tries > 200) clearInterval(timer);
    }, 125);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
