/* QuotaLab V134.3 — Refino desktop do Dashboard
   - Mantém topbar/sidebar intactos
   - Ajuste percentual junto da cota vigente, sem pílula
   - Índice de Saúde no canto direito do hero
   - Modal usa cópia atualizada do painel completo no momento do clique
   - Não altera a experiência mobile
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_REF_V1343__) return;
  window.__QL_DASH_REF_V1343__ = true;

  function addStyles(){
    ['ql-dashboard-refino-v134-css','ql-dashboard-refino-v1341-css','ql-dashboard-refino-v1343-css'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
    const style=document.createElement('style');
    style.id='ql-dashboard-refino-v1343-css';
    style.textContent=`
      @media (min-width:901px){
        #page-dashboard .db-hero{grid-template-columns:minmax(0,1fr) 142px!important;align-items:center!important;gap:28px!important;}
        #page-dashboard .db-hero-meta{align-items:stretch!important;flex-wrap:wrap!important;row-gap:10px!important;}
        #page-dashboard .ql-hero-delta-meta{justify-content:center!important;}
        #page-dashboard .ql-hero-delta-meta .db-delta-pill{margin:0!important;padding:0!important;min-height:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;font-size:14px!important;line-height:1.2!important;white-space:nowrap!important;}
        #page-dashboard .db-hero-right{min-width:126px;display:flex!important;flex-direction:column;align-items:center!important;justify-content:center!important;text-align:center!important;gap:2px;}
        #page-dashboard .ql-health-hero{--health-color:#3fb950;--health-rgb:63,185,80;width:126px;min-height:126px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;border-radius:18px;outline:none;position:relative;transition:transform .16s ease,background .16s ease,box-shadow .16s ease;}
        #page-dashboard .ql-health-hero:hover,#page-dashboard .ql-health-hero:focus-visible{transform:translateY(-2px);background:rgba(var(--health-rgb),.055);box-shadow:0 10px 24px rgba(0,0,0,.12),inset 0 0 0 1px rgba(var(--health-rgb),.16);}
        #page-dashboard .ql-health-hero.saude{--health-color:#3fb950;--health-rgb:63,185,80;}#page-dashboard .ql-health-hero.atencao{--health-color:#d29922;--health-rgb:210,153,34;}#page-dashboard .ql-health-hero.alerta{--health-color:#ff9f43;--health-rgb:255,159,67;}#page-dashboard .ql-health-hero.risco{--health-color:#f85149;--health-rgb:248,81,73;}
        #page-dashboard .ql-health-hero-label{font-size:9px;line-height:1;color:var(--text3);text-transform:uppercase;letter-spacing:.10em;font-weight:800;margin-bottom:2px;}
        #page-dashboard .ql-health-hero-scorebox{position:relative;width:96px;height:96px;display:grid;place-items:center;flex:0 0 96px;}
        #page-dashboard .ql-health-hero-ring{position:absolute;inset:0;width:96px;height:96px;transform:rotate(-90deg);overflow:visible;}
        #page-dashboard .ql-health-hero-ring-bg{fill:none;stroke:rgba(255,255,255,.075);stroke-width:12;}
        #page-dashboard .ql-health-hero-ring-val{fill:none;stroke:var(--health-color);stroke-width:12;stroke-linecap:round;stroke-dasharray:301.59;stroke-dashoffset:301.59;filter:drop-shadow(0 0 12px rgba(var(--health-rgb),.32));transition:stroke-dashoffset .35s ease,stroke .25s ease;}
        #page-dashboard .ql-health-hero-score-inner{text-align:center;position:relative;z-index:1;}
        #page-dashboard .ql-health-hero-score{font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:34px;line-height:.95;color:var(--text);font-weight:980;letter-spacing:-.05em;}
        #page-dashboard .ql-health-hero-status{margin-top:4px;font-size:9px;text-transform:uppercase;letter-spacing:.09em;font-weight:900;color:var(--health-color);}
        #page-dashboard .ql-health-hero-hint{margin-top:0;font-size:9px;line-height:1;color:var(--text3);opacity:.82;letter-spacing:.02em;}
        #page-dashboard .ql-health-source-hidden{display:none!important;}
        #page-dashboard .ql-health-modal{position:fixed;inset:0;z-index:10050;display:none;align-items:center;justify-content:center;padding:34px;background:rgba(2,8,20,.74);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
        #page-dashboard .ql-health-modal.is-open{display:flex!important;}
        #page-dashboard .ql-health-modal-panel{width:min(1040px,calc(100vw - 80px));max-height:calc(100vh - 72px);overflow:auto;position:relative;border-radius:22px;box-shadow:0 30px 90px rgba(0,0,0,.48);background:var(--bg2);}
        #page-dashboard .ql-health-modal-close{position:absolute;top:12px;right:12px;z-index:20;width:36px;height:36px;border-radius:12px;border:1px solid var(--border);background:var(--bg3);color:var(--text);display:grid;place-items:center;font-size:21px;line-height:1;cursor:pointer;box-shadow:0 8px 18px rgba(0,0,0,.16);}
        #page-dashboard .ql-health-modal-content{padding:0;}
        #page-dashboard .ql-health-modal-copy{display:block!important;visibility:visible!important;opacity:1!important;margin:0!important;padding:24px 18px 18px!important;position:relative!important;transform:none!important;}
        #page-dashboard .ql-health-modal-copy .db-health-main{grid-template-columns:minmax(0,1fr) 132px!important;padding-right:44px;}
        body.ql-health-modal-open{overflow:hidden!important;}
      }
    `;
    document.head.appendChild(style);
  }

  const stripIds=root=>{if(root.id)root.removeAttribute('id');root.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));};
  const tones=['saude','atencao','alerta','risco'];
  function syncTone(card,hero){hero.classList.remove(...tones);hero.classList.add(tones.find(c=>card.classList.contains(c))||'saude');}
  function buildHeroScore(){const box=document.createElement('div');box.className='ql-health-hero-scorebox';box.innerHTML='<svg class="ql-health-hero-ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="48" class="ql-health-hero-ring-bg"></circle><circle cx="60" cy="60" r="48" class="ql-health-hero-ring-val"></circle></svg><div class="ql-health-hero-score-inner"><div class="ql-health-hero-score">—</div><div class="ql-health-hero-status">Calculando</div></div>';return box;}
  function syncHero(card,hero){const s=card.querySelector('#db-health-score'),st=card.querySelector('#db-health-status'),r=card.querySelector('#db-health-ring-val'),ds=hero.querySelector('.ql-health-hero-score'),dst=hero.querySelector('.ql-health-hero-status'),dr=hero.querySelector('.ql-health-hero-ring-val');if(s&&ds)ds.textContent=s.textContent;if(st&&dst)dst.textContent=st.textContent;if(r&&dr){const cs=getComputedStyle(r);dr.style.strokeDashoffset=cs.strokeDashoffset||r.style.strokeDashoffset||'301.59';}syncTone(card,hero);}

  function init(){
    const page=document.getElementById('page-dashboard');
    const hero=page&&page.querySelector('.db-hero');
    const meta=hero&&hero.querySelector('.db-hero-meta');
    const right=hero&&hero.querySelector('.db-hero-right');
    const delta=document.getElementById('db-delta-pill');
    const healthCard=document.getElementById('db-health-card');
    if(!page||!hero||!meta||!right||!delta||!healthCard)return false;
    if(document.getElementById('ql-health-hero-v1343'))return true;
    addStyles();

    const oldDelta=meta.querySelector('.ql-hero-delta-meta');if(oldDelta&&oldDelta!==delta.parentElement)oldDelta.remove();
    const deltaMeta=document.createElement('div');deltaMeta.className='db-hero-meta-item ql-hero-delta-meta';const deltaLabel=document.createElement('span');deltaLabel.className='db-hero-meta-label';deltaLabel.textContent='Ajuste sugerido';deltaMeta.append(deltaLabel,delta);meta.appendChild(deltaMeta);

    const healthHero=document.createElement('div');healthHero.id='ql-health-hero-v1343';healthHero.className='ql-health-hero';healthHero.setAttribute('role','button');healthHero.setAttribute('tabindex','0');healthHero.setAttribute('aria-label','Abrir detalhes do Índice de Saúde do Condomínio');const label=document.createElement('div');label.className='ql-health-hero-label';label.textContent='Índice de saúde';const hint=document.createElement('div');hint.className='ql-health-hero-hint';hint.textContent='ver análise';healthHero.append(label,buildHeroScore(),hint);
    const timestamp=document.getElementById('db-timestamp');right.innerHTML='';right.appendChild(healthHero);if(timestamp)right.appendChild(timestamp);

    healthCard.classList.add('ql-health-source-hidden');

    const modal=document.createElement('div');modal.className='ql-health-modal';modal.id='ql-health-modal-v1343';modal.setAttribute('aria-hidden','true');const panel=document.createElement('div');panel.className='ql-health-modal-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Detalhes do Índice de Saúde do Condomínio');const close=document.createElement('button');close.className='ql-health-modal-close';close.type='button';close.setAttribute('aria-label','Fechar');close.textContent='×';const content=document.createElement('div');content.className='ql-health-modal-content';panel.append(close,content);modal.appendChild(panel);page.appendChild(modal);

    function rebuildModal(){content.innerHTML='';const copy=healthCard.cloneNode(true);copy.classList.remove('ql-health-source-hidden');copy.classList.add('ql-health-modal-copy');stripIds(copy);content.appendChild(copy);}
    function open(){syncHero(healthCard,healthHero);rebuildModal();modal.classList.add('is-open');modal.setAttribute('aria-hidden','false');document.body.classList.add('ql-health-modal-open');}
    function shut(){modal.classList.remove('is-open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('ql-health-modal-open');content.innerHTML='';}
    healthHero.addEventListener('click',open);healthHero.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}});close.addEventListener('click',shut);modal.addEventListener('click',e=>{if(e.target===modal)shut();});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('is-open'))shut();});
    syncHero(healthCard,healthHero);
    new MutationObserver(()=>syncHero(healthCard,healthHero)).observe(healthCard,{subtree:true,childList:true,characterData:true,attributes:true});
    console.info('[QuotaLab V134.3] Dashboard desktop: ajuste sem pílula + modal por cópia atualizada.');
    return true;
  }
  function boot(){if(init())return;let t=0;const timer=setInterval(()=>{t++;if(init()||t>80)clearInterval(timer);},125);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
