/* QuotaLab V134 — Refino desktop do Dashboard
   - Mantém topbar/sidebar intactos
   - Move o ajuste percentual para junto da cota vigente
   - Leva o Índice de Saúde para o canto direito do hero
   - Abre o detalhamento do índice em modal sob demanda
   - Não altera a experiência mobile
*/
(() => {
  'use strict';

  const mqDesktop = window.matchMedia('(min-width: 901px)');
  if (!mqDesktop.matches) return;
  if (window.__QL_DASH_REF_V134__) return;
  window.__QL_DASH_REF_V134__ = true;

  function addStyles() {
    if (document.getElementById('ql-dashboard-refino-v134-css')) return;
    const style = document.createElement('style');
    style.id = 'ql-dashboard-refino-v134-css';
    style.textContent = `
      @media (min-width:901px){
        #page-dashboard .db-hero{
          grid-template-columns:minmax(0,1fr) 142px!important;
          align-items:center!important;
          gap:28px!important;
        }
        #page-dashboard .db-hero-meta{
          align-items:flex-end!important;
          flex-wrap:wrap!important;
          row-gap:10px!important;
        }
        #page-dashboard .ql-hero-delta-meta .db-delta-pill{
          margin:0!important;
          white-space:nowrap;
          padding:4px 10px!important;
          font-size:12px!important;
        }
        #page-dashboard .db-hero-right{
          min-width:126px;
          display:flex!important;
          flex-direction:column;
          align-items:center!important;
          justify-content:center!important;
          text-align:center!important;
          gap:2px;
        }
        #page-dashboard .ql-health-hero{
          --health-color:#3fb950;
          --health-rgb:63,185,80;
          width:126px;
          min-height:126px;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:center;
          cursor:pointer;
          border-radius:18px;
          transition:transform .16s ease, background .16s ease, box-shadow .16s ease;
          outline:none;
          position:relative;
        }
        #page-dashboard .ql-health-hero:hover,
        #page-dashboard .ql-health-hero:focus-visible{
          transform:translateY(-2px);
          background:rgba(var(--health-rgb),.055);
          box-shadow:0 10px 24px rgba(0,0,0,.12), inset 0 0 0 1px rgba(var(--health-rgb),.16);
        }
        #page-dashboard .ql-health-hero.saude{--health-color:#3fb950;--health-rgb:63,185,80;}
        #page-dashboard .ql-health-hero.atencao{--health-color:#d29922;--health-rgb:210,153,34;}
        #page-dashboard .ql-health-hero.alerta{--health-color:#ff9f43;--health-rgb:255,159,67;}
        #page-dashboard .ql-health-hero.risco{--health-color:#f85149;--health-rgb:248,81,73;}
        #page-dashboard .ql-health-hero-label{
          font-size:9px;
          line-height:1;
          color:var(--text3);
          text-transform:uppercase;
          letter-spacing:.10em;
          font-weight:800;
          margin-bottom:2px;
        }
        #page-dashboard .ql-health-hero .db-health-scorebox{
          width:96px!important;
          height:96px!important;
          justify-self:auto!important;
          flex:0 0 96px;
        }
        #page-dashboard .ql-health-hero .db-health-ring{
          width:96px!important;
          height:96px!important;
        }
        #page-dashboard .ql-health-hero .db-health-score{
          font-size:34px!important;
        }
        #page-dashboard .ql-health-hero .db-health-status{
          margin-top:4px!important;
          font-size:9px!important;
        }
        #page-dashboard .ql-health-hero-hint{
          margin-top:0;
          font-size:9px;
          line-height:1;
          color:var(--text3);
          opacity:.82;
          letter-spacing:.02em;
        }
        #page-dashboard .ql-health-modal{
          position:fixed;
          inset:0;
          z-index:10050;
          display:none;
          align-items:center;
          justify-content:center;
          padding:34px;
          background:rgba(2,8,20,.74);
          backdrop-filter:blur(8px);
          -webkit-backdrop-filter:blur(8px);
        }
        #page-dashboard .ql-health-modal.is-open{display:flex;}
        #page-dashboard .ql-health-modal-panel{
          width:min(1040px,calc(100vw - 80px));
          max-height:calc(100vh - 72px);
          overflow:auto;
          position:relative;
          border-radius:22px;
          box-shadow:0 30px 90px rgba(0,0,0,.48);
        }
        #page-dashboard .ql-health-modal-close{
          position:absolute;
          top:12px;
          right:12px;
          z-index:4;
          width:36px;
          height:36px;
          border-radius:12px;
          border:1px solid var(--border);
          background:var(--bg3);
          color:var(--text);
          display:grid;
          place-items:center;
          font-size:21px;
          line-height:1;
          cursor:pointer;
          box-shadow:0 8px 18px rgba(0,0,0,.16);
        }
        #page-dashboard .ql-health-modal-close:hover{filter:brightness(1.08);}
        #page-dashboard .ql-health-modal-panel #db-health-card{
          margin:0!important;
          padding-top:24px!important;
        }
        #page-dashboard .ql-health-modal-panel #db-health-card .db-health-main{
          grid-template-columns:1fr!important;
          padding-right:44px;
        }
        body.ql-health-modal-open{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(style);
  }

  function syncHealthTone(card, heroHealth) {
    const tones = ['saude','atencao','alerta','risco'];
    heroHealth.classList.remove(...tones);
    const active = tones.find(cls => card.classList.contains(cls)) || 'saude';
    heroHealth.classList.add(active);
  }

  function init() {
    const page = document.getElementById('page-dashboard');
    const hero = page && page.querySelector('.db-hero');
    const meta = hero && hero.querySelector('.db-hero-meta');
    const right = hero && hero.querySelector('.db-hero-right');
    const delta = document.getElementById('db-delta-pill');
    const healthCard = document.getElementById('db-health-card');
    const scoreBox = healthCard && healthCard.querySelector('.db-health-scorebox');

    if (!page || !hero || !meta || !right || !delta || !healthCard || !scoreBox) {
      return false;
    }
    if (document.getElementById('ql-health-hero-v134')) return true;

    addStyles();

    // 1) Percentual de ajuste passa a integrar o grupo de metadados da cota.
    const deltaMeta = document.createElement('div');
    deltaMeta.className = 'db-hero-meta-item ql-hero-delta-meta';
    const deltaLabel = document.createElement('span');
    deltaLabel.className = 'db-hero-meta-label';
    deltaLabel.textContent = 'Ajuste sugerido';
    deltaMeta.appendChild(deltaLabel);
    deltaMeta.appendChild(delta);
    meta.appendChild(deltaMeta);

    // 2) Score executivo ocupa o espaço visual do antigo percentual.
    const healthHero = document.createElement('div');
    healthHero.id = 'ql-health-hero-v134';
    healthHero.className = 'ql-health-hero';
    healthHero.setAttribute('role','button');
    healthHero.setAttribute('tabindex','0');
    healthHero.setAttribute('aria-label','Abrir detalhes do Índice de Saúde do Condomínio');

    const label = document.createElement('div');
    label.className = 'ql-health-hero-label';
    label.textContent = 'Índice de saúde';
    const hint = document.createElement('div');
    hint.className = 'ql-health-hero-hint';
    hint.textContent = 'ver análise';

    healthHero.appendChild(label);
    healthHero.appendChild(scoreBox);
    healthHero.appendChild(hint);

    const timestamp = document.getElementById('db-timestamp');
    right.innerHTML = '';
    right.appendChild(healthHero);
    if (timestamp) right.appendChild(timestamp);

    syncHealthTone(healthCard, healthHero);

    // 3) O painel completo deixa o fluxo vertical e vira detalhamento sob demanda.
    const modal = document.createElement('div');
    modal.className = 'ql-health-modal';
    modal.id = 'ql-health-modal-v134';
    modal.setAttribute('aria-hidden','true');

    const panel = document.createElement('div');
    panel.className = 'ql-health-modal-panel';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-modal','true');
    panel.setAttribute('aria-label','Detalhes do Índice de Saúde do Condomínio');

    const close = document.createElement('button');
    close.className = 'ql-health-modal-close';
    close.type = 'button';
    close.setAttribute('aria-label','Fechar');
    close.textContent = '×';

    panel.appendChild(close);
    panel.appendChild(healthCard);
    modal.appendChild(panel);
    page.appendChild(modal);

    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      document.body.classList.add('ql-health-modal-open');
      close.focus({preventScroll:true});
    }
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
      document.body.classList.remove('ql-health-modal-open');
      healthHero.focus({preventScroll:true});
    }

    healthHero.addEventListener('click', openModal);
    healthHero.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal();
      }
    });
    close.addEventListener('click', closeModal);
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    const observer = new MutationObserver(() => syncHealthTone(healthCard, healthHero));
    observer.observe(healthCard, {attributes:true, attributeFilter:['class','data-glow-tone','data-glow-level']});

    console.info('[QuotaLab V134] Dashboard desktop refinado: ajuste junto à cota + Índice de Saúde no hero/modal.');
    return true;
  }

  function boot() {
    if (init()) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (init() || tries > 80) clearInterval(timer);
    }, 125);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
