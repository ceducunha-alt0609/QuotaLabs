/* QuotaLab V135.1 — painel agrupador dos 6 indicadores principais
   - Desktop only
   - Mantém os 6 cards e seus modais da V135.0
   - Apenas agrupa visualmente no mesmo padrão dos demais painéis do Dashboard
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_DASH_CARDS_PANEL_V1351__) return;
  window.__QL_DASH_CARDS_PANEL_V1351__ = true;

  function addStyles(){
    if(document.getElementById('ql-dashboard-cards-panel-v1351-css')) return;
    const st=document.createElement('style');
    st.id='ql-dashboard-cards-panel-v1351-css';
    st.textContent=`
      @media (min-width:901px){
        #page-dashboard .ql-exec-panel-v1351{
          margin:0 0 16px!important;
          padding:16px!important;
        }
        #page-dashboard .ql-exec-panel-head-v1351{
          display:flex!important;
          align-items:flex-end!important;
          justify-content:space-between!important;
          gap:16px!important;
          margin:0 0 13px!important;
        }
        #page-dashboard .ql-exec-panel-title-v1351{
          font-size:11px!important;
          line-height:1.2!important;
          text-transform:uppercase!important;
          letter-spacing:.065em!important;
          color:var(--text2)!important;
          font-weight:850!important;
        }
        #page-dashboard .ql-exec-panel-sub-v1351{
          font-size:10px!important;
          line-height:1.25!important;
          color:var(--text3)!important;
          text-align:right!important;
          white-space:nowrap!important;
        }
        #page-dashboard .ql-exec-panel-v1351 #ql-exec-cards-v1350{
          margin:0!important;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function apply(){
    const page=document.getElementById('page-dashboard');
    const cards=document.getElementById('ql-exec-cards-v1350');
    if(!page || !cards) return false;
    if(document.getElementById('ql-exec-panel-v1351')) return true;

    addStyles();

    const panel=document.createElement('section');
    panel.id='ql-exec-panel-v1351';
    panel.className='db-c ql-exec-panel-v1351';
    panel.setAttribute('aria-label','Indicadores principais');

    const head=document.createElement('div');
    head.className='ql-exec-panel-head-v1351';

    const title=document.createElement('div');
    title.className='ql-exec-panel-title-v1351';
    title.textContent='Indicadores principais';

    const sub=document.createElement('div');
    sub.className='ql-exec-panel-sub-v1351';
    sub.textContent='Clique em um indicador para ver o detalhamento';

    head.append(title,sub);
    cards.parentElement.insertBefore(panel,cards);
    panel.append(head,cards);

    console.info('[QuotaLab V135.1] Painel "Indicadores principais" aplicado aos 6 cards.');
    return true;
  }

  function boot(){
    if(apply()) return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(apply()||tries>160)clearInterval(timer);},125);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
