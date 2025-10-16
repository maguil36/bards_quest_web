(function(){
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // Keys
  const K = {
    desktop: 'mspa:ui:desktop',
    autologs: 'mspa:pesterlog:default',
    keyboard: 'mspa:nav:keyboard',
    theme: 'mspa:theme',
    pageFont: 'mspa:font-ui',
    textSize: 'mspa:text-size',
    contrast: 'mspa:text:contrast',
  };

  // Helpers
  function get(key, fallback=null){ try { const v = localStorage.getItem(key); return v===null? fallback : v; } catch { return fallback; } }
  function set(key, v){ try { localStorage.setItem(key, v); } catch {} }

  // Desktop mode
  const cbDesktop = $('#opt-desktop');
  function applyDesktop(){ const on = get(K.desktop,'0')==='1'; document.documentElement.setAttribute('data-desktop', on?'1':'0'); if (cbDesktop) cbDesktop.checked = on; }
  cbDesktop && cbDesktop.addEventListener('change', ()=>{ set(K.desktop, cbDesktop.checked?'1':'0'); applyDesktop(); });
  applyDesktop();

  // Automatically open logs
  const cbLogs = $('#opt-autologs');
  function applyLogs(){ const on = get(K.autologs,'0')==='1'; if (cbLogs) cbLogs.checked = on; }
  cbLogs && cbLogs.addEventListener('change', ()=>{ set(K.autologs, cbLogs.checked?'1':'0'); applyLogs(); });
  applyLogs();

  // Keyboard navigation
  const cbKeyboard = $('#opt-keyboard');
  function applyKeyboard(){ const on = get(K.keyboard,'0')==='1'; if (cbKeyboard) cbKeyboard.checked = on; document.documentElement.setAttribute('data-kbd', on?'1':'0'); }
  cbKeyboard && cbKeyboard.addEventListener('change', ()=>{ set(K.keyboard, cbKeyboard.checked?'1':'0'); applyKeyboard(); });
  applyKeyboard();

  // Page theme (dropdown)
  const selTheme = $('#opt-theme');
  function applyTheme(){
    const t = selTheme?.value || get(K.theme,'default') || 'default';
    if (selTheme) selTheme.value = t;
    if (t === 'default') {
      // Default: remove theme attribute and clear stored preference
      // This allows page-specific themes to be used
      document.documentElement.removeAttribute('data-theme');
      try { localStorage.removeItem(K.theme); } catch {}
    } else if (t === 'space') {
      // Space: explicitly set space theme (no colors)
      document.documentElement.removeAttribute('data-theme');
      set(K.theme, 'space');
    } else {
      // Specific theme: set it
      document.documentElement.setAttribute('data-theme', t);
      set(K.theme, t);
    }
  }
  selTheme && selTheme.addEventListener('change', applyTheme);
  // Load stored theme on page load
  (function(){ const stored = get(K.theme, 'default'); if (selTheme) selTheme.value = stored; })();
  applyTheme();

  // Page font (dropdown: affects site UI titles and text)
  const selFont = $('#opt-page-font');
  function applyFont(){ const v = selFont?.value || get(K.pageFont,'system') || 'system'; if (selFont) selFont.value = v; document.body.setAttribute('data-font', v); set(K.pageFont, v); }
  selFont && selFont.addEventListener('change', applyFont);
  (function(){ const stored = get(K.pageFont,'system'); if (selFont) selFont.value = stored; })();
  applyFont();

  // Font size (comic text under image and in logs)
  const rngText = $('#opt-text-size');
  const valText = $('#val-text-size');
  function applyTextSize(){ const v = rngText?.value || get(K.textSize,'18') || '18'; document.documentElement.style.setProperty('--reader-text', v + 'px'); if (valText) valText.textContent = v + 'px'; set(K.textSize, v); if (rngText && rngText.value !== v) rngText.value = v; }
  rngText && rngText.addEventListener('input', applyTextSize);
  (function(){ const stored = get(K.textSize,'18'); if (rngText) rngText.value = stored; if (valText) valText.textContent = stored + 'px'; })();
  applyTextSize();

  // High contrast text colors
  const cbContrast = $('#opt-contrast');
  function applyContrast(){ const on = get(K.contrast,'0')==='1'; document.documentElement.setAttribute('data-contrast', on? 'high':'normal'); if (cbContrast) cbContrast.checked = on; }
  cbContrast && cbContrast.addEventListener('change', ()=>{ set(K.contrast, cbContrast.checked?'1':'0'); applyContrast(); });
  applyContrast();

  // Data export/import/reset
  const btnExport = $('#opt-export');
  const btnImport = $('#opt-import');
  const btnReset = $('#opt-reset');

  btnExport && btnExport.addEventListener('click', () => {
    const data = {};
    try {
      for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); if (!k) continue; if (k.startsWith('mspa:') || k.startsWith('autosave:') || k.startsWith('progress:')) { data[k] = localStorage.getItem(k); } }
    } catch {}
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bards-quest-options.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  btnImport && btnImport.addEventListener('click', async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
    input.onchange = async () => {
      const file = input.files && input.files[0]; if (!file) return;
      const text = await file.text();
      try {
        const obj = JSON.parse(text);
        Object.entries(obj).forEach(([k,v]) => { if (typeof v === 'string') localStorage.setItem(k, v); });
        alert('Imported. Reloading...'); location.reload();
      } catch { alert('Invalid file.'); }
    };
    input.click();
  });

  btnReset && btnReset.addEventListener('click', () => {
    if (!confirm('Reset all options to defaults?')) return;
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('mspa:') || k.startsWith('autosave:') || k.startsWith('progress:'));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {}
    alert('Reset. Reloading...'); location.reload();
  });
})();
