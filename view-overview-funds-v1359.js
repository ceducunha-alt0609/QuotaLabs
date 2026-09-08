/* QuotaLab V135.9 — Visão Geral: Fundo de Reserva/Obras compactos + popover
   Desktop only
   - Mantém os dois fundos separados
   - Capa mostra apenas título, valor principal e percentual
   - Detalhes aparecem somente no hover, em popover contextual
*/
(() => {
  'use strict';
  if (!window.matchMedia('(min-width: 901px)').matches) return;
  if (window.__QL_OVERVIEW_FUNDS_V1359__) return;
  window.__QL_OVERVIEW_FUNDS_V1359__ = true;

  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  const visible = el => !!(el && el.isConnected && el.getClientRects().length && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden');
  const clean = s => String(s || '').replace(/\s+/g,' ').trim();
  const money = s => [...String(s||'').matchAll(/R\$\s?[\d\.]+(?:,\d{2})?/g)].map(m=>m[0].replace(/\s+/g,' '));
  const pct = s => [...String(s||'').matchAll(/\d+(?:[\.,]\d+)?%/g)].map(m=>m[0]);

  function addStyles(){
    if(document.getElementById('ql-overview-funds-v1359-css')) return;
    const st=document.createElement('style');
    st.id='ql-overview-funds-v1359-css';
    st.textContent=`
      @media (min-width:901px){
        .ql-fund-compact-v1359{
          min-height:118px!important;height:auto!important;padding:18px 20px!important;
          display:flex!important;align-items:center!important;justify-content:space-between!important;
          gap:18px!important;cursor:default!important;overflow:visible!important;
        }
        .ql-fund-compact-v1359 .ql-fund-main-v1359{min-width:0;}
        .ql-fund-compact-v1359 .ql-fund-eyebrow-v1359{
          font-size:10px;line-height:1.2;text-transform:uppercase;letter-spacing:.08em;font-weight:850;
          color:var(--text3);margin-bottom:5px;
        }
        .ql-fund-compact-v1359 .ql-fund-title-v1359{
          font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:18px;line-height:1.1;color:var(--text);margin-bottom:9px;
        }
        .ql-fund-compact-v1359 .ql-fund-value-v1359{
          font-family:'DM Serif Display','Merriweather',Georgia,serif;font-size:34px;line-height:1;color:var(--text);white-space:nowrap;
        }
        .ql-fund-compact-v1359 .ql-fund-badge-v1359{
          flex:0 0 auto;border:1px solid currentColor;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:800;
          background:rgba(255,255,255,.03);
        }
        .ql-fund-compact-v1359.ql-fund-reserva-v1359 .ql-fund-badge-v1359{color:var(--blue2);}
        .ql-fund-compact-v1359.ql-fund-obras-v1359 .ql-fund-badge-v1359{color:#d58a28;}
        .ql-fund-compact-v1359:hover{transform:translateY(-1px);}

        body > .ql-fund-pop-v1359{
          position:fixed;z-index:2147482600;display:none;width:330px;max-width:calc(100vw - 28px);box-sizing:border-box;
          border:1px solid var(--border);border-radius:15px;padding:14px 15px 13px;
          background:linear-gradient(180deg,var(--bg2),rgba(8,17,34,.985));color:var(--text);
          box-shadow:0 18px 50px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.035);
          backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
          opacity:0;transform:translateY(4px) scale(.985);transition:opacity .12s ease,transform .12s ease;
        }
        body > .ql-fund-pop-v1359.is-open{display:block;opacity:1;transform:translateY(0) scale(1);}
        body > .ql-fund-pop-v1359::after{
          content:'';position:absolute;width:10px;height:10px;background:var(--bg2);border-right:1px solid var(--border);border-bottom:1px solid var(--border);
          transform:rotate(45deg);left:var(--arrow-x,50%);margin-left:-5px;bottom:-6px;
        }
        body > .ql-fund-pop-v1359.is-below::after{bottom:auto;top:-6px;transform:rotate(225deg);}
        .ql-fund-pop-head-v1359{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px;}
        .ql-fund-pop-title-v1359{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--text3);font-weight:850;}
        .ql-fund-pop-hint-v1359{font-size:9px;color:var(--text3);opacity:.65;}
        .ql-fund-pop-list-v1359{display:grid;gap:6px;}
        .ql-fund-pop-row-v1359{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding-top:7px;border-top:1px solid rgba(255,255,255,.055);}
        .ql-fund-pop-row-v1359:first-child{border-top:0;padding-top:0;}
        .ql-fund-pop-row-v1359 span{font-size:10.5px;color:var(--text3);}
        .ql-fund-pop-row-v1359 strong{font-size:11.5px;color:var(--text);font-weight:780;text-align:right;}
        .ql-fund-pop-row-v1359 strong.blue{color:var(--blue2);}.ql-fund-pop-row-v1359 strong.green{color:var(--green);}.ql-fund-pop-row-v1359 strong.gold{color:#d29922;}
        .ql-fund-pop-note-v1359{margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.055);font-size:10.5px;line-height:1.35;color:var(--text2);}
      }
    `;
    document.head.appendChild(st);
  }

  function findPanel(kind){
    const isReserva=kind==='reserva';
    const required=isReserva
      ? ['fundo de reserva','por unidade','saldo/meta','progresso da meta']
      : ['fundo de obras','por unidade','peso fundos','participacao no total'];
    const candidates=[...document.querySelectorAll('section,article,div')]
      .filter(visible)
      .map(el=>({el,t:norm(el.innerText||el.textContent||''),r:el.getBoundingClientRect()}))
      .filter(x=>required.every(term=>x.t.includes(term)))
      .filter(x=>x.r.width>420&&x.r.height>140&&x.r.height<520)
      .sort((a,b)=>(a.r.width*a.r.height)-(b.r.width*b.r.height));
    return candidates[0]?.el||null;
  }

  function extract(panel,kind){
    const text=clean(panel.innerText||panel.textContent||'');
    const ms=money(text), ps=pct(text);
    if(kind==='reserva'){
      const value=ms[0]||'—';
      const badge=(text.match(/fundo de reserva[\s\S]{0,100}?(\d+(?:[\.,]\d+)?%)/i)||[])[1]||ps[0]||'—';
      const perUnit=(text.match(/por unidade\s*(R\$\s?[\d\.]+(?:,\d{2})?)/i)||[])[1]||ms[1]||'—';
      const total=(text.match(/do total\s*(\d+(?:[\.,]\d+)?%)/i)||[])[1]||ps[1]||'—';
      const saldoMeta=(text.match(/saldo\/meta\s*(\d+(?:[\.,]\d+)?%)/i)||[])[1]||ps[2]||'—';
      const progresso=(text.match(/progresso da meta\s*(\d+(?:[\.,]\d+)?%)/i)||[])[1]||saldoMeta;
      const projected=(text.match(/saldo projetado apos arrecadacao:\s*(R\$\s?[\d\.]+(?:,\d{2})?)/i)||[])[1]||ms[ms.length-1]||'—';
      return {title:'Fundo de Reserva',eyebrow:'Confiança / Segurança',value,badge,rows:[['Por unidade',perUnit,''],['Do total',total,''],['Saldo/meta',saldoMeta,''],['Progresso da meta',progresso,'blue'],['Saldo projetado',projected,'blue']]};
    }
    const value=ms[0]||'—';
    const badge=(text.match(/fundo de obras[\s\S]{0,100}?(\d+(?:[\.,]\d+)?%)/i)||[])[1]||ps[0]||'—';
    const perUnit=(text.match(/por unidade\s*(R\$\s?[\d\.]+(?:,\d{2})?)/i)||[])[1]||ms[1]||'—';
    const total=(text.match(/do total\s*(\d+(?:[\.,]\d+)?%)/i)||[])[1]||ps[1]||'—';
    const weight=(text.match(/peso fundos\s*(\d+(?:[\.,]\d+)?%)/i)||[])[1]||ps[2]||'—';
    const participation=(text.match(/participacao no total\s*(\d+(?:[\.,]\d+)?%)/i)||[])[1]||total;
    return {title:'Fundo de Obras',eyebrow:'Ação / Investimento',value,badge,rows:[['Por unidade',perUnit,''],['Do total',total,''],['Peso dos fundos',weight,'green'],['Participação no total',participation,'green']],note:`Obras representam ${participation} da arrecadação e ${weight} dos fundos.`};
  }

  function renderCard(panel,data,kind){
    if(!panel||panel.dataset.qlFundCompact1359==='1') return;
    panel.dataset.qlFundCompact1359='1';
    panel.dataset.qlFundKind1359=kind;
    panel.classList.add('ql-fund-compact-v1359',kind==='reserva'?'ql-fund-reserva-v1359':'ql-fund-obras-v1359');
    panel.innerHTML=`<div class="ql-fund-main-v1359"><div class="ql-fund-eyebrow-v1359">${data.eyebrow}</div><div class="ql-fund-title-v1359">${data.title}</div><div class="ql-fund-value-v1359">${data.value}</div></div><div class="ql-fund-badge-v1359">${data.badge}</div>`;
  }

  let pop=null,activePanel=null,hideTimer=null,showTimer=null;
  function ensurePop(){
    if(pop) return pop;
    pop=document.createElement('div');pop.className='ql-fund-pop-v1359';pop.setAttribute('role','tooltip');document.body.appendChild(pop);return pop;
  }
  function popHtml(data){
    return `<div class="ql-fund-pop-head-v1359"><div class="ql-fund-pop-title-v1359">${data.title}</div><div class="ql-fund-pop-hint-v1359">consulta rápida</div></div><div class="ql-fund-pop-list-v1359">${data.rows.map(r=>`<div class="ql-fund-pop-row-v1359"><span>${r[0]}</span><strong class="${r[2]||''}">${r[1]}</strong></div>`).join('')}</div>${data.note?`<div class="ql-fund-pop-note-v1359">${data.note}</div>`:''}`;
  }
  function position(panel){
    const r=panel.getBoundingClientRect(),pw=pop.offsetWidth||330,ph=pop.offsetHeight||180,gap=9;
    let left=Math.max(14,Math.min(r.left+(r.width-pw)/2,window.innerWidth-pw-14));
    let top,below=false;
    if(r.top-gap>=ph+10) top=r.top-ph-gap; else {below=true;top=Math.min(r.bottom+gap,window.innerHeight-ph-14);}
    pop.style.left=Math.round(left)+'px';pop.style.top=Math.round(Math.max(14,top))+'px';pop.classList.toggle('is-below',below);
    pop.style.setProperty('--arrow-x',Math.max(18,Math.min(pw-18,(r.left+r.width/2)-left))+'px');
  }
  function show(panel,data){clearTimeout(hideTimer);clearTimeout(showTimer);activePanel=panel;ensurePop().innerHTML=popHtml(data);pop.classList.add('is-open');requestAnimationFrame(()=>position(panel));}
  function hide(){clearTimeout(showTimer);clearTimeout(hideTimer);activePanel=null;pop?.classList.remove('is-open','is-below');}
  function bindHover(panel,data){
    panel.addEventListener('pointerenter',()=>{clearTimeout(hideTimer);clearTimeout(showTimer);showTimer=setTimeout(()=>show(panel,data),90);});
    panel.addEventListener('pointerleave',()=>{clearTimeout(showTimer);hideTimer=setTimeout(hide,150);});
  }

  function apply(){
    const reserva=findPanel('reserva'),obras=findPanel('obras');
    if(!reserva||!obras) return false;
    addStyles();
    const d1=extract(reserva,'reserva'),d2=extract(obras,'obras');
    renderCard(reserva,d1,'reserva');renderCard(obras,d2,'obras');
    bindHover(reserva,d1);bindHover(obras,d2);
    ensurePop();pop.addEventListener('pointerenter',()=>clearTimeout(hideTimer));pop.addEventListener('pointerleave',()=>{hideTimer=setTimeout(hide,150);});
    window.addEventListener('scroll',hide,{passive:true});window.addEventListener('resize',hide);
    console.info('[QuotaLab V135.9] Fundo de Reserva e Fundo de Obras compactados com popover hover-only.');
    return true;
  }

  function boot(){if(apply())return;let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>240)clearInterval(timer);},125);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
