/* QuotaLab V135.2 — Emagrecimento proporcional dos modais de Indicadores Principais
   - Desktop only
   - Mantém a lógica/modal V135.0
   - Ajusta cada modal ao volume real de conteúdo
   - Compactos: Fundo de Reserva / Fundo de Obras
   - Médios: Cota / Composição
   - Amplos: Evolução histórica / Inadimplência
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_MODAL_REF_V1352__) return;
  window.__QL_MODAL_REF_V1352__ = true;

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();

  function addStyles(){
    if(document.getElementById('ql-modal-refino-v1352-css')) return;
    const st=document.createElement('style');
    st.id='ql-modal-refino-v1352-css';
    st.textContent=`
      @media (min-width:901px){
        body > .ql-exec-modal-v1350 .ql-exec-modal-panel-v1350{
          width:min(860px,calc(100vw - 70px))!important;
          max-height:calc(100vh - 90px)!important;
          border-radius:20px!important;
        }
        body > .ql-exec-modal-v1350 .ql-exec-modal-content-v1350{
          padding:16px!important;
        }
        body > .ql-exec-modal-v1350 .ql-exec-modal-copy-v1350{
          box-sizing:border-box!important;
          min-height:0!important;
          height:auto!important;
          padding:20px 22px!important;
          margin:0!important;
        }
        body > .ql-exec-modal-v1350 .ql-exec-modal-copy-v1350 .db-c-label{
          margin-bottom:14px!important;
        }

        /* Cota: médio, suficiente para gauge + comparação */
        body > .ql-exec-modal-v1350.ql-modal-cota .ql-exec-modal-panel-v1350{
          width:min(820px,calc(100vw - 70px))!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-cota .ql-exec-modal-copy-v1350{
          padding:20px 24px 18px!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-cota .db-gauge-outer{
          margin-top:2px!important;
        }

        /* Composição: médio compacto, aproxima donut/legenda/percentuais */
        body > .ql-exec-modal-v1350.ql-modal-composicao .ql-exec-modal-panel-v1350{
          width:min(660px,calc(100vw - 70px))!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-composicao .ql-exec-modal-copy-v1350{
          padding:20px 24px!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-composicao .db-donut-outer{
          justify-content:flex-start!important;
          gap:26px!important;
          width:auto!important;
        }

        /* Reserva/Obras: modais realmente compactos */
        body > .ql-exec-modal-v1350.ql-modal-reserva .ql-exec-modal-panel-v1350,
        body > .ql-exec-modal-v1350.ql-modal-obras .ql-exec-modal-panel-v1350{
          width:min(560px,calc(100vw - 70px))!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-reserva .ql-exec-modal-copy-v1350,
        body > .ql-exec-modal-v1350.ql-modal-obras .ql-exec-modal-copy-v1350{
          padding:20px 24px 22px!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-reserva .ql-exec-modal-copy-v1350 > :last-child,
        body > .ql-exec-modal-v1350.ql-modal-obras .ql-exec-modal-copy-v1350 > :last-child{
          margin-bottom:0!important;
        }

        /* Históricos: mantêm largura útil para gráfico, mas perdem excesso vertical */
        body > .ql-exec-modal-v1350.ql-modal-historico .ql-exec-modal-panel-v1350,
        body > .ql-exec-modal-v1350.ql-modal-inad .ql-exec-modal-panel-v1350{
          width:min(980px,calc(100vw - 70px))!important;
          max-height:calc(100vh - 80px)!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-historico .ql-exec-modal-copy-v1350,
        body > .ql-exec-modal-v1350.ql-modal-inad .ql-exec-modal-copy-v1350{
          padding:20px 24px 18px!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-historico .ql-exec-modal-copy-v1350 p,
        body > .ql-exec-modal-v1350.ql-modal-inad .ql-exec-modal-copy-v1350 p{
          margin-top:6px!important;
          margin-bottom:10px!important;
          line-height:1.4!important;
        }

        /* Fechar mais próximo do conteúdo */
        body > .ql-exec-modal-v1350 .ql-exec-modal-close-v1350{
          top:10px!important;
          right:10px!important;
          margin:10px 10px -44px 0!important;
          width:34px!important;
          height:34px!important;
          border-radius:11px!important;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function classify(modal){
    if(!modal) return;
    modal.classList.remove('ql-modal-cota','ql-modal-composicao','ql-modal-reserva','ql-modal-obras','ql-modal-historico','ql-modal-inad');
    const copy=modal.querySelector('.ql-exec-modal-copy-v1350');
    if(!copy) return;
    const label=norm(copy.querySelector('.db-c-label')?.textContent || copy.textContent);
    if(label.includes('cota atual vs proposta')) modal.classList.add('ql-modal-cota');
    else if(label.includes('composicao da cota')) modal.classList.add('ql-modal-composicao');
    else if(label.includes('fundo de reserva')) modal.classList.add('ql-modal-reserva');
    else if(label.includes('fundo de obras')) modal.classList.add('ql-modal-obras');
    else if(label.includes('evolucao historica')) modal.classList.add('ql-modal-historico');
    else if(label.includes('inadimplencia')) modal.classList.add('ql-modal-inad');
  }

  function hook(){
    const modal=document.querySelector('body > .ql-exec-modal-v1350');
    if(!modal) return false;
    addStyles();
    classify(modal);
    if(!modal.__qlModalObserverV1352){
      const obs=new MutationObserver(()=>classify(modal));
      obs.observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      modal.__qlModalObserverV1352=obs;
    }
    console.info('[QuotaLab V135.2] Modais dos Indicadores Principais refinados por conteúdo.');
    return true;
  }

  function boot(){
    if(hook()) return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(hook()||tries>160)clearInterval(timer);},125);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
