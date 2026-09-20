/* QuotaLab V1362 — Marco de Estabilidade da Persistência
   Camada mínima e isolada. Não altera layout, login, splash, navegação ou Rateio.
*/
(() => {
  'use strict';

  if (window.__QL_PERSIST_STABILITY_V1362__) return;
  window.__QL_PERSIST_STABILITY_V1362__ = true;

  const PATCH = 'v1362-persistence-stability';

  function isoNow(){
    return new Date().toISOString();
  }

  function setInput(id, value){
    if (value == null) return;
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function syncPercentLabel(inputId, labelIds){
    const el = document.getElementById(inputId);
    if (!el) return;
    const n = Number(el.value);
    if (!Number.isFinite(n)) return;
    labelIds.forEach(id => {
      const out = document.getElementById(id);
      if (out) out.textContent = n.toFixed(1) + '%';
    });
  }

  function install(){
    if (typeof window.buildAppData !== 'function' ||
        typeof window.applyAppData !== 'function' ||
        typeof window._doAutoSave !== 'function') {
      return false;
    }

    const originalBuild = window.buildAppData;
    const originalApply = window.applyAppData;
    const originalDoSave = window._doAutoSave;

    window.buildAppData = function(){
      const data = originalBuild.apply(this, arguments);
      if (!data || typeof data !== 'object') return data;

      data.version = Math.max(Number(data.version) || 0, 5);
      data.savedAt = isoNow();
      data.persistencePatch = PATCH;

      data.config = data.config || {};
      const frMeta = document.getElementById('fr_meta');
      const frHorizonte = document.getElementById('fr_horizonte');
      if (frMeta) data.config.frMeta = frMeta.value;
      if (frHorizonte) data.config.frHorizonte = frHorizonte.value;

      return data;
    };

    window.applyAppData = function(d){
      const result = originalApply.apply(this, arguments);

      try{
        const cfg = d && d.config ? d.config : {};

        /* Corrige campos que o restaurador antigo tratava por truthiness.
           Valor 0 é válido e deve ser restaurado. */
        setInput('inadimplencia', cfg.inadimplencia);
        setInput('fundo_reserva', cfg.fundoReserva);
        setInput('fundo_obras', cfg.fundoObras);
        setInput('fr_saldo', cfg.frSaldo);
        setInput('fr_taxa', cfg.frTaxa);
        setInput('fr_meta', cfg.frMeta);
        setInput('fr_horizonte', cfg.frHorizonte);
        setInput('modo_rateio', cfg.modoRateio);

        syncPercentLabel('inadimplencia', ['inadimpl_lbl','inadimpl_val']);
        syncPercentLabel('fundo_reserva', ['fr_lbl','fr_val']);
        syncPercentLabel('fundo_obras', ['fo_lbl','fo_val']);

        if (typeof window.syncFrTaxa === 'function') window.syncFrTaxa();
        if (typeof window.calcular === 'function') window.calcular();
      }catch(e){
        console.warn('[QuotaLab V1362] Ajuste pós-restauração não concluído:', e);
      }

      return result;
    };

    function persistNow(reason){
      try{
        const snap = window.buildAppData();
        localStorage.setItem('condocalc_v3', JSON.stringify(snap));

        try{
          localStorage.setItem('ql_last_local_save_v1362', JSON.stringify({
            at: snap.savedAt || isoNow(),
            reason: reason || 'autosave',
            patch: PATCH
          }));
        }catch(_){}

        try{
          if (typeof window.saved === 'function') window.saved();
          if (typeof window.saveSnapshot === 'function') window.saveSnapshot(window._lastCalc);
          if (typeof window.scheduleSupabaseAutoSync === 'function') window.scheduleSupabaseAutoSync();
        }catch(e){
          console.warn('[QuotaLab V1362] Estado local salvo; complemento pós-save falhou:', e);
        }

        return true;
      }catch(e){
        console.error('[QuotaLab V1362] Falha real ao gravar dados locais:', e);
        try{
          if (typeof window.showToast === 'function') {
            window.showToast('Não foi possível salvar os dados locais.','error',3200);
          }
        }catch(_){}
        return false;
      }
    }

    window._doAutoSave = function(){
      return persistNow('autosave');
    };

    window.salvarDados = function(){
      const ok = persistNow('manual');

      const navTxt = document.getElementById('nav-salvar-txt');
      if (navTxt){
        navTxt.textContent = ok ? 'Salvo ✓' : 'Erro ao salvar';
        setTimeout(() => {
          navTxt.textContent = 'Salvar dados';
        }, 2200);
      }

      return ok;
    };

    function flush(reason){
      persistNow(reason || 'flush');
    }

    window.addEventListener('pagehide', () => flush('pagehide'));
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush('hidden');
    });

    window.qlPersistenceAuditV1362 = function(){
      let state = null;
      try{ state = JSON.parse(localStorage.getItem('condocalc_v3') || 'null'); }catch(e){}
      return {
        patch: PATCH,
        hasState: !!state,
        savedAt: state && (state.savedAt || state.exportedAt) || null,
        frMetaSaved: !!(state && state.config && Object.prototype.hasOwnProperty.call(state.config, 'frMeta')),
        frHorizonteSaved: !!(state && state.config && Object.prototype.hasOwnProperty.call(state.config, 'frHorizonte')),
        version: state && state.version || null
      };
    };

    console.info('[QuotaLab] Marco de Estabilidade da Persistência ativo:', PATCH);
    return true;
  }

  function boot(){
    if (install()) return;
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (install() || tries >= 80) clearInterval(timer);
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
