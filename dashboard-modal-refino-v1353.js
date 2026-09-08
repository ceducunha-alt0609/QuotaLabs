/* QuotaLab V135.3 — correção de congelamento + emagrecimento proporcional dos modais
   - Desktop only
   - Corrige loop do MutationObserver da V135.2
   - Mantém os tamanhos proporcionais por tipo de conteúdo
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_MODAL_REF_V1353__) return;
  window.__QL_MODAL_REF_V1353__ = true;

  const norm = s => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();

  function addStyles(){
    if(document.getElementById('ql-modal-refino-v1353-css')) return;
    const st=document.createElement('style');
    st.id='ql-modal-refino-v1353-css';
    st.textContent=`
      @media (min-width:901px){
        body > .ql-exec-modal-v1350 .ql-exec-modal-panel-v1350{
          width:min(860px,calc(100vw - 70px))!important;
          max-height:calc(100vh - 90px)!important;
          border-radius:20px!important;
        }
        body > .ql-exec-modal-v1350 .ql-exec-modal-content-v1350{padding:16px!important;}
        body > .ql-exec-modal-v1350 .ql-exec-modal-copy-v1350{
          box-sizing:border-box!important;min-height:0!important;height:auto!important;
          padding:20px 22px!important;margin:0!important;
        }
        body > .ql-exec-modal-v1350 .ql-exec-modal-copy-v1350 .db-c-label{margin-bottom:14px!important;}

        body > .ql-exec-modal-v1350.ql-modal-cota .ql-exec-modal-panel-v1350{width:min(820px,calc(100vw - 70px))!important;}
        body > .ql-exec-modal-v1350.ql-modal-cota .ql-exec-modal-copy-v1350{padding:20px 24px 18px!important;}
        body > .ql-exec-modal-v1350.ql-modal-cota .db-gauge-outer{margin-top:2px!important;}

        body > .ql-exec-modal-v1350.ql-modal-composicao .ql-exec-modal-panel-v1350{width:min(660px,calc(100vw - 70px))!important;}
        body > .ql-exec-modal-v1350.ql-modal-composicao .ql-exec-modal-copy-v1350{padding:20px 24px!important;}
        body > .ql-exec-modal-v1350.ql-modal-composicao .db-donut-outer{justify-content:flex-start!important;gap:26px!important;width:auto!important;}

        body > .ql-exec-modal-v1350.ql-modal-reserva .ql-exec-modal-panel-v1350,
        body > .ql-exec-modal-v1350.ql-modal-obras .ql-exec-modal-panel-v1350{width:min(560px,calc(100vw - 70px))!important;}
        body > .ql-exec-modal-v1350.ql-modal-reserva .ql-exec-modal-copy-v1350,
        body > .ql-exec-modal-v1350.ql-modal-obras .ql-exec-modal-copy-v1350{padding:20px 24px 22px!important;}

        body > .ql-exec-modal-v1350.ql-modal-historico .ql-exec-modal-panel-v1350,
        body > .ql-exec-modal-v1350.ql-modal-inad .ql-exec-modal-panel-v1350{
          width:min(980px,calc(100vw - 70px))!important;max-height:calc(100vh - 80px)!important;
        }
        body > .ql-exec-modal-v1350.ql-modal-historico .ql-exec-modal-copy-v1350,
        body > .ql-exec-modal-v1350.ql-modal-inad .ql-exec-modal-copy-v1350{padding:20px 24px 18px!important;}
        body > .ql-exec-modal-v1350.ql-modal-historico .ql-exec-modal-copy-v1350 p,
        body > .ql-exec-modal-v1350.ql-modal-inad .ql-exec-modal-copy-v1350 p{
          margin-top:6px!important;margin-bottom:10px!important;line-height:1.4!important;
        }

        body > .ql-exec-modal-v1350 .ql-exec-modal-close-v1350{
          top:10px!important;right:10px!important;margin:10px 10px -44px 0!important;
          width:34px!important;height:34px!important;border-radius:11px!important;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function classify(modal){
    if(!modal) return;
    const classes=['ql-modal-cota','ql-modal-composicao','ql-modal-reserva','ql-modal-obras','ql-modal-historico','ql-modal-inad'];
    const copy=modal.querySelector('.ql-exec-modal-copy-v1350');
    let target='';
    if(copy){
      const label=norm(copy.querySelector('.db-c-label')?.textContent || copy.textContent);
      if(label.includes('cota atual vs proposta')) target='ql-modal-cota';
      else if(label.includes('composicao da cota')) target='ql-modal-composicao';
      else if(label.includes('fundo de reserva')) target='ql-modal-reserva';
      else if(label.includes('fundo de obras')) target='ql-modal-obras';
      else if(label.includes('evolucao historica')) target='ql-modal-historico';
      else if(label.includes('inadimplencia')) target='ql-modal-inad';
    }
    classes.forEach(c=>{ if(c!==target && modal.classList.contains(c)) modal.classList.remove(c); });
    if(target && !modal.classList.contains(target)) modal.classList.add(target);
  }

  function hook(){
    const modal=document.querySelector('body > .ql-exec-modal-v1350');
    if(!modal) return false;
    addStyles();
    classify(modal);
    if(!modal.__qlModalObserverV1353){
      const content=modal.querySelector('.ql-exec-modal-content-v1350');
      if(!content) return false;
      const obs=new MutationObserver(()=>classify(modal));
      /* IMPORTANTE: observar apenas troca de conteúdo. Não observar atributos/classes,
         pois a própria classificação altera classes do modal. */
      obs.observe(content,{subtree:true,childList:true});
      modal.__qlModalObserverV1353=obs;
    }
    console.info('[QuotaLab V135.3] Modais refinados sem loop de observação.');
    return true;
  }

  function boot(){
    if(hook()) return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(hook()||tries>160)clearInterval(timer);},125);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
