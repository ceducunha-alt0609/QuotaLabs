/* QuotaLab V134.6 — Refino do botão de ação do Modo Decisão Rápida
   - Desktop only
   - Mantém a lógica existente do clique
   - Renomeia para "Analisar agora"
   - Adiciona ícone de sincronização e reforça affordance visual
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_ACTION_REF_V1346__) return;
  window.__QL_DASH_ACTION_REF_V1346__ = true;

  function addStyles(){
    if (document.getElementById('ql-dashboard-action-v1346-css')) return;
    const style=document.createElement('style');
    style.id='ql-dashboard-action-v1346-css';
    style.textContent=`
      @media (min-width:901px){
        #page-dashboard .ql-action-now-btn{
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          gap:8px!important;
          min-height:40px!important;
          padding:8px 16px!important;
          border-radius:14px!important;
          cursor:pointer!important;
          font-weight:850!important;
          letter-spacing:.01em!important;
          border:1px solid rgba(224,170,58,.48)!important;
          background:linear-gradient(180deg,rgba(224,170,58,.24),rgba(224,170,58,.11))!important;
          box-shadow:0 10px 24px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.05)!important;
          transition:transform .16s ease,filter .16s ease,box-shadow .16s ease!important;
        }
        #page-dashboard .ql-action-now-btn:hover,
        #page-dashboard .ql-action-now-btn:focus-visible{
          transform:translateY(-1px)!important;
          filter:brightness(1.08)!important;
          box-shadow:0 12px 28px rgba(0,0,0,.20),0 0 0 1px rgba(224,170,58,.10) inset!important;
          outline:none!important;
        }
        #page-dashboard .ql-action-now-btn:active{transform:translateY(0)!important;}
        #page-dashboard .ql-action-now-icon{
          display:inline-flex!important;
          width:16px!important;
          height:16px!important;
          align-items:center!important;
          justify-content:center!important;
          font-size:16px!important;
          line-height:1!important;
          transform-origin:center!important;
        }
        #page-dashboard .ql-action-now-btn.is-running .ql-action-now-icon{
          animation:qlActionSpin .75s linear infinite!important;
        }
      }
      @keyframes qlActionSpin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(style);
  }

  function isTarget(el){
    const txt=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
    if(txt==='o que fazer agora?' || txt==='analisar agora') return true;
    return el.id==='db-decision-btn';
  }

  function findButton(){
    const root=document.getElementById('db-decision-card') || document.getElementById('page-dashboard');
    if(!root) return null;
    const els=[...root.querySelectorAll('button,a,[role="button"]')];
    return els.find(isTarget) || null;
  }

  function refine(){
    const btn=findButton();
    if(!btn) return false;
    if(btn.classList.contains('ql-action-now-btn')) return true;

    addStyles();
    btn.classList.add('ql-action-now-btn');
    btn.setAttribute('aria-label','Analisar agora e atualizar as prioridades de ação');
    btn.setAttribute('title','Recalcular a análise e atualizar as prioridades');

    const originalClick=()=>{
      btn.classList.add('is-running');
      setTimeout(()=>btn.classList.remove('is-running'),700);
    };
    btn.addEventListener('click',originalClick,{passive:true});

    btn.textContent='';
    const icon=document.createElement('span');
    icon.className='ql-action-now-icon';
    icon.setAttribute('aria-hidden','true');
    icon.textContent='↻';
    const label=document.createElement('span');
    label.textContent='Analisar agora';
    btn.append(icon,label);

    console.info('[QuotaLab V134.6] Botão do Modo Decisão Rápida refinado para "Analisar agora".');
    return true;
  }

  function boot(){
    if(refine()) return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(refine()||tries>80)clearInterval(timer);},125);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
