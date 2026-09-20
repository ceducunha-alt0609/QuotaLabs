/* QuotaLab V1362 — persistência confiável + acesso local Admin
   Objetivos:
   - separar perfil/acesso de dados;
   - impedir que dados demo do código reapareçam quando não há estado salvo;
   - salvar imediatamente mudanças relevantes e no fechamento;
   - registrar data/hora do último estado local;
   - comparar local x Supabase (quando autosync estiver configurado) sem sobrescrever dado novo por velho;
   - transformar o antigo "modo demonstração" no acesso local Administrador, preservando a simulação dos 4 perfis.
*/
(() => {
  'use strict';

  const PATCH = 'v1362-persistence-admin-local';
  const DATA_KEY = 'condocalc_v3';
  const META_KEY = 'ql_state_meta_v1362';
  const EMPTY_MARK_KEY = 'ql_empty_initialized_v1362';
  const LOCAL_ADMIN_KEY = 'ql_local_admin_access';
  let saveTimer = null;
  let cloudTimer = null;
  let applyingRemote = false;
  let bootDone = false;

  function nowIso(){ return new Date().toISOString(); }

  function safeJson(raw, fallback=null){
    try{ return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; }
  }

  function getMeta(){
    return safeJson(localStorage.getItem(META_KEY), {}) || {};
  }

  function setMeta(extra){
    try{
      const old = getMeta();
      localStorage.setItem(META_KEY, JSON.stringify(Object.assign({}, old, extra || {}, {patch: PATCH})));
    }catch(e){
      console.warn('[QuotaLab V1362] Falha ao gravar metadados:', e);
    }
  }

  function getLocalState(){
    try{
      const raw = localStorage.getItem(DATA_KEY);
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(!data || !data.config || !Array.isArray(data.despesas)) return null;
      return data;
    }catch(e){
      console.warn('[QuotaLab V1362] Estado local inválido:', e);
      return null;
    }
  }

  function localTimestamp(data){
    const meta = getMeta();
    const candidates = [
      meta.updatedAt,
      data && data.updatedAt,
      data && data.exportedAt
    ].filter(Boolean).map(v => Date.parse(v)).filter(Number.isFinite);
    return candidates.length ? Math.max.apply(null, candidates) : 0;
  }

  function buildSnapshot(){
    if(typeof buildAppData !== 'function') return null;
    const snap = buildAppData();
    const stamp = nowIso();
    snap.updatedAt = stamp;
    snap.exportedAt = stamp;
    snap.stateSource = 'local';
    snap.statePatch = PATCH;
    return snap;
  }

  function saveNow(options){
    options = options || {};
    if(applyingRemote && !options.force) return false;
    try{
      const snap = buildSnapshot();
      if(!snap) return false;
      localStorage.setItem(DATA_KEY, JSON.stringify(snap));
      const stamp = snap.updatedAt || nowIso();
      setMeta({
        updatedAt: stamp,
        source: options.source || 'local',
        lastSaveReason: options.reason || 'change',
        saveOk: true
      });
      try{ localStorage.setItem('ql_cloud_pending','1'); }catch(e){}
      try{
        if(typeof saved === 'function') saved();
        if(typeof saveSnapshot === 'function' && typeof _lastCalc !== 'undefined') saveSnapshot(_lastCalc);
      }catch(e){}
      if(!options.skipCloud) scheduleCloudPush();
      return true;
    }catch(e){
      setMeta({saveOk:false,lastError:String(e && e.message || e),lastErrorAt:nowIso()});
      console.error('[QuotaLab V1362] Falha ao salvar estado:', e);
      try{
        if(typeof showToast === 'function') showToast('Não foi possível salvar os dados. Verifique o armazenamento do navegador.','error',4200);
      }catch(_){}
      return false;
    }
  }

  function scheduleSave(reason){
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveNow({reason: reason || 'change'}), 350);
  }

  function cloudCfg(){
    try{
      if(typeof getSupabaseCfg !== 'function') return null;
      const cfg = getSupabaseCfg();
      if(!cfg || !cfg.autoSync || !cfg.url || !cfg.key || !cfg.docKey) return null;
      return cfg;
    }catch(e){ return null; }
  }

  function scheduleCloudPush(){
    const cfg = cloudCfg();
    if(!cfg) return;
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => {
      try{
        if(typeof supabasePush === 'function') supabasePush(true);
      }catch(e){
        console.warn('[QuotaLab V1362] Autosync Supabase indisponível:', e);
      }
    }, 900);
  }

  async function reconcileCloud(){
    const cfg = cloudCfg();
    if(!cfg || !navigator.onLine) return;
    const table = (typeof SB_TABLE !== 'undefined' && SB_TABLE) ? SB_TABLE : 'quotalab_sync';
    try{
      const url = `${cfg.url}/rest/v1/${table}?doc_key=eq.${encodeURIComponent(cfg.docKey)}&select=payload,updated_at,updated_by`;
      const res = await fetch(url, {
        headers:{
          apikey: cfg.key,
          Authorization: 'Bearer ' + cfg.key
        },
        cache:'no-store'
      });
      if(!res.ok) return;
      const rows = await res.json();
      if(!rows || !rows.length || !rows[0].payload) return;

      const remote = rows[0].payload;
      const remoteTs = Date.parse(rows[0].updated_at || remote.updatedAt || remote.exportedAt || '') || 0;
      const local = getLocalState();
      const localTs = localTimestamp(local);

      if(remoteTs > localTs + 1000 && typeof applyAppData === 'function'){
        applyingRemote = true;
        try{
          applyAppData(remote);
          const stamp = rows[0].updated_at || remote.updatedAt || remote.exportedAt || nowIso();
          localStorage.setItem(DATA_KEY, JSON.stringify(Object.assign({}, remote, {
            updatedAt: stamp,
            stateSource:'supabase',
            statePatch:PATCH
          })));
          setMeta({updatedAt:stamp,source:'supabase',saveOk:true,remoteUpdatedBy:rows[0].updated_by || ''});
          try{ localStorage.setItem('ql_cloud_pending','0'); }catch(e){}
        }finally{
          applyingRemote = false;
        }
        try{
          if(typeof showToast === 'function') showToast('Últimos dados restaurados da nuvem.','success',2200);
        }catch(e){}
      } else if(localTs > remoteTs + 1000){
        scheduleCloudPush();
      }
    }catch(e){
      console.warn('[QuotaLab V1362] Reconciliação com Supabase não concluída:', e);
    }
  }

  function clearEmbeddedDemoIfNoSavedState(){
    if(getLocalState()) return;
    try{
      if(typeof despesas !== 'undefined' && Array.isArray(despesas)) despesas.length = 0;
      if(typeof rateios !== 'undefined' && Array.isArray(rateios)) rateios.length = 0;
      if(typeof historico !== 'undefined' && Array.isArray(historico)) historico.length = 0;
      if(typeof despComp !== 'undefined' && Array.isArray(despComp)) despComp.length = 0;
      if(typeof renderDespesas === 'function') renderDespesas();
      if(typeof renderHistorico === 'function') renderHistorico();
      if(typeof renderDespComp === 'function') renderDespComp();
      if(typeof renderRateios === 'function') renderRateios();
      if(typeof toggleRateio === 'function') toggleRateio();
      if(typeof calcular === 'function') calcular();
      localStorage.setItem(EMPTY_MARK_KEY, '1');
      saveNow({force:true,skipCloud:false,source:'first-empty',reason:'remove-demo-seed'});
      console.info('[QuotaLab V1362] Nenhum estado anterior encontrado; dados demo removidos.');
    }catch(e){
      console.warn('[QuotaLab V1362] Não foi possível limpar seed demo:', e);
    }
  }

  function relevantTarget(el){
    if(!el || !el.closest) return false;
    if(el.closest('#ql-login, #modal-demo-role')) return false;
    return !!el.closest('input, select, textarea, [contenteditable="true"], button');
  }

  function installPersistenceListeners(){
    document.addEventListener('input', e => {
      if(relevantTarget(e.target)) scheduleSave('input');
    }, true);
    document.addEventListener('change', e => {
      if(relevantTarget(e.target)) saveNow({reason:'change'});
    }, true);
    document.addEventListener('click', e => {
      const btn = e.target && e.target.closest ? e.target.closest('button') : null;
      if(!btn) return;
      if(btn.closest('#ql-login, #modal-demo-role')) return;
      setTimeout(() => saveNow({reason:'button'}), 0);
    }, true);
    window.addEventListener('pagehide', () => saveNow({force:true,skipCloud:true,reason:'pagehide'}));
    window.addEventListener('beforeunload', () => saveNow({force:true,skipCloud:true,reason:'beforeunload'}));
    document.addEventListener('visibilitychange', () => {
      if(document.visibilityState === 'hidden') saveNow({force:true,skipCloud:true,reason:'hidden'});
    });
    window.addEventListener('online', () => setTimeout(reconcileCloud, 600));
  }

  function tuneLoginForLocalAdmin(){
    try{
      const demoBtn = document.getElementById('ql-login-demo');
      if(demoBtn){
        demoBtn.textContent = 'Entrar como Administrador';
        demoBtn.setAttribute('aria-label','Entrar localmente como Administrador');
        demoBtn.addEventListener('click', () => {
          try{
            localStorage.setItem('ql_demo_role','admin');
            localStorage.setItem('ql_demo_access','1');
            localStorage.setItem(LOCAL_ADMIN_KEY,'1');
            if(!localStorage.getItem('ql_demo_user')) localStorage.setItem('ql_demo_user','Administrador');
          }catch(e){}
        }, true);
      }

      const intro = document.querySelector('.ql-login-form > p');
      if(intro) intro.textContent = 'Use seu acesso Supabase ou entre localmente como Administrador neste dispositivo.';

      const showcaseText = document.querySelector('.ql-login-hero p');
      if(showcaseText) showcaseText.textContent = 'Base azul moderna como padrão, com acesso administrativo local e estrutura pronta para perfis por usuário.';

      document.querySelectorAll('.ql-login-metric').forEach(card => {
        const strong = card.querySelector('strong');
        const span = card.querySelector('span');
        if(strong && strong.textContent.trim() === 'Perfis' && span){
          span.textContent = 'Admin, zeladoria, portaria e morador prontos para simulação e permissões';
        }
      });
    }catch(e){
      console.warn('[QuotaLab V1362] Ajuste do login não aplicado:', e);
    }
  }

  function addProfileSimulationEntry(){
    try{
      if(document.getElementById('ql-sim-profile-v1362')) return;
      const pill = document.getElementById('ql-user-pill');
      if(!pill || !pill.parentElement) return;
      const btn = document.createElement('button');
      btn.id = 'ql-sim-profile-v1362';
      btn.type = 'button';
      btn.title = 'Simular outro perfil';
      btn.setAttribute('aria-label','Simular outro perfil');
      btn.innerHTML = '◫';
      btn.style.cssText = 'width:30px;height:30px;border-radius:10px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.035);color:var(--text2);cursor:pointer;font-size:15px;display:inline-flex;align-items:center;justify-content:center;';
      btn.addEventListener('click', () => {
        try{
          if(typeof openModal === 'function') openModal('modal-demo-role');
          else{
            const m = document.getElementById('modal-demo-role');
            if(m) m.style.display = 'flex';
          }
        }catch(e){}
      });
      pill.parentElement.insertBefore(btn, pill);
    }catch(e){}
  }

  function boot(){
    if(bootDone) return;
    bootDone = true;
    tuneLoginForLocalAdmin();
    clearEmbeddedDemoIfNoSavedState();
    installPersistenceListeners();
    setTimeout(addProfileSimulationEntry, 650);
    setTimeout(reconcileCloud, 1200);
    console.info('[QuotaLab] camada ativa:', PATCH);
  }

  window.qlSaveNowV1362 = saveNow;
  window.qlReconcileCloudV1362 = reconcileCloud;
  window.qlPersistenceStatusV1362 = function(){
    const data = getLocalState();
    const meta = getMeta();
    return {
      patch: PATCH,
      hasLocalState: !!data,
      updatedAt: meta.updatedAt || (data && (data.updatedAt || data.exportedAt)) || null,
      source: meta.source || (data && data.stateSource) || 'unknown',
      saveOk: meta.saveOk !== false,
      lastError: meta.lastError || null,
      cloudConfigured: !!cloudCfg()
    };
  };

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else setTimeout(boot, 0);
})();