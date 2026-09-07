/* QuotaLab V134.5 — Diagnóstico técnico da edificação
   Refino exclusivo do Dashboard desktop:
   - transforma a antiga "Leitura técnica da edificação" em card mais compacto
   - renomeia para "Diagnóstico técnico da edificação"
   - reduz o peso visual do título sem alterar os dados internos
   - não altera topbar, sidebar ou mobile
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_TECH_REF_V1345__) return;
  window.__QL_TECH_REF_V1345__ = true;

  function norm(v){
    return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  }

  function addStyles(){
    if (document.getElementById('ql-tech-refino-v1345-css')) return;
    const style = document.createElement('style');
    style.id = 'ql-tech-refino-v1345-css';
    style.textContent = `
      @media (min-width:901px){
        #page-dashboard .ql-tech-card-refino{
          margin:0 0 14px!important;
          padding:18px 20px!important;
          border-radius:18px!important;
          border:1px solid var(--border)!important;
          background:var(--bg2)!important;
          box-shadow:0 10px 28px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.025)!important;
        }
        #page-dashboard .ql-tech-card-refino .ql-tech-title-refino{
          font-size:24px!important;
          line-height:1.12!important;
          letter-spacing:-.025em!important;
          margin:0!important;
          font-weight:850!important;
        }
        #page-dashboard .ql-tech-card-refino .ql-tech-sub-refino{
          font-size:13px!important;
          line-height:1.45!important;
          margin-top:4px!important;
          color:var(--text2)!important;
        }
        #page-dashboard .ql-tech-card-refino .ql-tech-desc-refino{
          font-size:12.5px!important;
          line-height:1.5!important;
          margin-top:12px!important;
          margin-bottom:14px!important;
          color:var(--text2)!important;
        }
        #page-dashboard .ql-tech-card-refino .ql-tech-icon-refino{
          transform:scale(.86);
          transform-origin:center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function findTitle(page){
    const candidates = Array.from(page.querySelectorAll('h1,h2,h3,h4,.db-title,.db-tech-title,[class*="title"]'));
    return candidates.find(el => {
      const t = norm(el.textContent);
      return t === 'leitura tecnica da edificacao' || t === 'diagnostico tecnico da edificacao';
    }) || Array.from(page.querySelectorAll('*')).find(el => norm(el.textContent) === 'leitura tecnica da edificacao');
  }

  function apply(){
    const page = document.getElementById('page-dashboard');
    if (!page) return false;
    const title = findTitle(page);
    if (!title) return false;

    const section = title.closest('section') || title.closest('.db-c') || title.closest('.card') || title.parentElement?.parentElement;
    if (!section) return false;

    addStyles();
    section.classList.add('ql-tech-card-refino');
    title.classList.add('ql-tech-title-refino');
    title.textContent = 'Diagnóstico técnico da edificação';

    const parent = title.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const idx = siblings.indexOf(title);
      if (idx >= 0 && siblings[idx + 1]) siblings[idx + 1].classList.add('ql-tech-sub-refino');
    }

    const texts = Array.from(section.querySelectorAll('p,div'));
    const desc = texts.find(el => {
      const t = norm(el.textContent);
      return t.startsWith('informacoes tecnicas fundamentais para decisoes responsaveis');
    });
    if (desc) desc.classList.add('ql-tech-desc-refino');

    const icon = section.querySelector('[class*="icon"], [class*="ico"]');
    if (icon) icon.classList.add('ql-tech-icon-refino');

    console.info('[QuotaLab V134.5] Diagnóstico técnico convertido para card compacto no desktop.');
    return true;
  }

  function boot(){
    if (apply()) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (apply() || tries > 80) clearInterval(timer);
    }, 125);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
