/* QuotaLab - instalador PWA mobile/PC */
(() => {
  let deferredPrompt = null;

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
  }

  function readySW() {
    if (!('serviceWorker' in navigator)) return;
    let reloadedForController = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloadedForController) return;
      if (sessionStorage.getItem('ql_sw_reload_1350') === '1') return;
      reloadedForController = true;
      sessionStorage.setItem('ql_sw_reload_1350', '1');
      location.reload();
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js?v=1350-1', { scope: './', updateViaCache: 'none' })
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
    document.body.appendChild(btn);
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

  loadMobileRefinement();
  loadDesktopDashboardRefinement();
  readySW();
})();
