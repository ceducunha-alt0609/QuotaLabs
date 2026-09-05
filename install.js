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

  function readySW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(reg => console.log('[QuotaLab] Service Worker ativo:', reg.scope))
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
    btn.style.cssText = `
      position: fixed;
      right: 18px;
      bottom: 18px;
      z-index: 99999;
      display: none;
      border: 1px solid rgba(255,211,0,.75);
      border-radius: 999px;
      padding: 10px 14px;
      background: #0a0a0f;
      color: #ffd300;
      font: 700 13px Merriweather, Georgia, serif;
      box-shadow: 0 12px 30px rgba(0,0,0,.35);
      cursor: pointer;
    `;

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
  readySW();
})();
