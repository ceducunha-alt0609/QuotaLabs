/* QuotaLab - instalador PWA mobile/PC */
(() => {
  let deferredPrompt = null;

  /* V1363 — trava visual de autenticação.
     Impede qualquer guia interna de aparecer entre o splash e o login. */
  function installAuthBootLock(){
    try{
      document.documentElement.classList.add('ql-auth-boot-lock');
      if(!document.getElementById('qlAuthBootLockStyleV1363')){
        const style=document.createElement('style');
        style.id='qlAuthBootLockStyleV1363';
        style.textContent = \
          'html.ql-auth-boot-lock body > *:not(#ql-splash):not(#ql-login):not(script):not(style){visibility:hidden!important;}'+
          'html.ql-auth-boot-lock #ql-login,html.ql-auth-boot-lock #ql-splash{visibility:visible!important;}';
        (document.head||document.documentElement).appendChild(style);
      }

      const syncLock=()=>{
        const login=document.getElementById('ql-login');
        const splash=document.getElementById('ql-splash');
        const loginShown=!!(login && login.classList.contains('show'));
        const splashVisible=!!(splash && splash.style.display!=='none' && !splash.classList.contains('hidden'));
        const runtimeAccess=sessionStorage.getItem('ql_runtime_access')==='1';

        /* Enquanto splash ou login estiverem ativos, app segue invisível.
           Quando há acesso runtime e login não está visível, libera o app. */
        if(runtimeAccess && !loginShown && !splashVisible){
          document.documentElement.classList.remove('ql-auth-boot-lock');
        }else{
          document.documentElement.classList.add('ql-auth-boot-lock');
        }
      };

      const startObserver=()=>{
        const login=document.getElementById('ql-login');
        const splash=document.getElementById('ql-splash');
        const obs=new MutationObserver(syncLock);
        if(login) obs.observe(login,{attributes:true,attributeFilter:['class','style']});
        if(splash) obs.observe(splash,{attributes:true,attributeFilter:['class','style']});
        window.addEventListener('storage',syncLock);
        window.addEventListener('pageshow',syncLock);
        setInterval(syncLock,250);
        syncLock();
      };

      if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',startObserver,{once:true});
      else startObserver();
    }catch(e){
      console.warn('[QuotaLab V1363] Falha na trava visual de autenticação:',e);
    }
  }

  function loadPersistenceReliability() {
    if (document.getElementById('qlPersistenceAccessV1362')) return;
    const script = document.createElement('script');
    script.id = 'qlPersistenceAccessV1362';
    script.src = './persistence-access-v1362.js?v=1362-1';
    script.defer = true;
    document.head.appendChild(script);
  }

  function loadMobileRefinement() {
    if (document.getElementById('qlMobileRefinoV1336')) return;
    const link = document.createElement('link');
    link.id = 'qlMobileRefinoV1336';
    link.rel = 'stylesheet';
    link.href = './mobile-v1336.css?v=1336-1';
    link.media = '(max-width: 700px)';
    document.head.appendChild(link);
  }

  function loadDesktopDashboardRefinement() {
    if (!document.getElementById('qlDashboardRefinoV1344')) {
      const script = document.createElement('script');
      script.id = 'qlDashboardRefinoV1344';
      script.src = './dashboard-refino-v1344.js?v=1344-1';
      script.defer = true;
      document.head.appendChild(script);
    }
    if (!document.getElementById('qlDashboardTechRefinoV1345')) {
      const tech = document.createElement('script');
      tech.id = 'qlDashboardTechRefinoV1345';
      tech.src = './dashboard-tech-refino-v1345.js?v=1345-1';
      tech.defer = true;
      document.head.appendChild(tech);
    }
    if (!document.getElementById('qlDashboardActionRefinoV1346')) {
      const action = document.createElement('script');
      action.id = 'qlDashboardActionRefinoV1346';
      action.src = './dashboard-action-refino-v1346.js?v=1346-2';
      action.defer = true;
      document.head.appendChild(action);
    }
    if (!document.getElementById('qlDashboardCardsRefinoV1350')) {
      const cards = document.createElement('script');
      cards.id = 'qlDashboardCardsRefinoV1350';
      cards.src = './dashboard-cards-refino-v1350.js?v=1350-1';
      cards.defer = true;
      document.head.appendChild(cards);
    }
    if (!document.getElementById('qlDashboardCardsPanelV1351')) {
      const panel = document.createElement('script');
      panel.id = 'qlDashboardCardsPanelV1351';
      panel.src = './dashboard-cards-panel-v1351.js?v=1351-1';
      panel.defer = true;
      document.head.appendChild(panel);
    }
    if (!document.getElementById('qlDashboardPopoverRefinoV1356')) {
      const popover = document.createElement('script');
      popover.id = 'qlDashboardPopoverRefinoV1356';
      popover.src = './dashboard-popover-refino-v1356.js?v=1356-1';
      popover.defer = true;
      document.head.appendChild(popover);
    }
    if (!document.getElementById('qlOverviewIndicatorsV1358')) {
      const overviewIndicators = document.createElement('script');
      overviewIndicators.id = 'qlOverviewIndicatorsV1358';
      overviewIndicators.src = './view-overview-indicators-v1358.js?v=1358-1';
      overviewIndicators.defer = true;
      document.head.appendChild(overviewIndicators);
    }
    if (!document.getElementById('qlOverviewFundsV1359')) {
      const overviewFunds = document.createElement('script');
      overviewFunds.id = 'qlOverviewFundsV1359';
      overviewFunds.src = './view-overview-funds-v1359.js?v=1359-1';
      overviewFunds.defer = true;
      document.head.appendChild(overviewFunds);
    }
    if (!document.getElementById('qlOverviewInsightProjectionV1360')) {
      const overviewIP = document.createElement('script');
      overviewIP.id = 'qlOverviewInsightProjectionV1360';
      overviewIP.src = './view-overview-insights-projection-v1360.js?v=1360-1';
      overviewIP.defer = true;
      document.head.appendChild(overviewIP);
    }
    if (!document.getElementById('qlOverviewAlertsV1361')) {
      const overviewAlerts = document.createElement('script');
      overviewAlerts.id = 'qlOverviewAlertsV1361';
      overviewAlerts.src = './view-overview-alerts-v1361.js?v=1361-1';
      overviewAlerts.defer = true;
      document.head.appendChild(overviewAlerts);
    }
  }

  function readySW() {
    if (!('serviceWorker' in navigator)) return;
    let reloadedForController = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadedForController) return;
      if (sessionStorage.getItem('ql_sw_reload_1363') === '1') return;
      reloadedForController = true;
      sessionStorage.setItem('ql_sw_reload_1363', '1');
      location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=1363-1', { scope: './', updateViaCache: 'none' })
        .then(reg => reg.update().catch(() => undefined).then(() => console.log('[QuotaLab] Service Worker ativo:', reg.scope)))
        .catch(err => console.warn('[QuotaLab] Falha ao registrar Service Worker:', err));
    });
  }

  function createInstallButton() {
    if (document.getElementById('qlInstallBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'qlInstallBtn';
    btn.type = 'button';
    btn.textContent = 'Instalar QuotaLab';
    btn.setAttribute('aria-label', 'Instalar QuotaLab no dispositivo');
    btn.style.cssText = `position:fixed;right:18px;bottom:18px;z-index:99999;display:none;border:1px solid rgba(255,211,0,.75);border-radius:999px;padding:10px 14px;background:#0a0a0f;color:#ffd300;font:700 13px Merriweather,Georgia,serif;box-shadow:0 12px 30px rgba(0,0,0,.35);cursor:pointer;`;
    btn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        alert('No celular: abra pelo Chrome/Edge e use “Adicionar à tela inicial”. No PC: use o ícone de instalação na barra do navegador.');
        return;
      }
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      btn.style.display = 'none';
    });
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    createInstallButton();
    const btn = document.getElementById('qlInstallBtn');
    if (btn) btn.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', () => {
    const btn = document.getElementById('qlInstallBtn');
    if (btn) btn.style.display = 'none';
    console.log('[QuotaLab] Aplicativo instalado.');
  });

  installAuthBootLock();
  loadPersistenceReliability();
  loadMobileRefinement();
  loadDesktopDashboardRefinement();
  readySW();
})();
