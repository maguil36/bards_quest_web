document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('reader-root');
  if (!root) return;
  const chapterId = Number(root.getAttribute('data-chapter') || '0');
  const total = Number(root.getAttribute('data-total') || '0');
  const cur = Number(root.getAttribute('data-page') || '1');
  const defaultTheme = root.getAttribute('data-default-theme') || '';
  const originalTheme = root.getAttribute('data-original-theme') || '';
  const overruleTheme = root.getAttribute('data-overrule-theme') === '1';
  const transitionType = root.getAttribute('data-transition') || 'smooth';

  const key = 'progress:series-1';
  const cookieName = 'savegame';

  // Apply transition type to document
  document.documentElement.setAttribute('data-transition', transitionType);

  // Apply theme with new logic:
  // 1. If overrule is true: ALWAYS use the default theme (ignores user preference)
  // 2. If user selected "default" or has no preference: use page-specific default theme
  // 3. If user selected "space": always use space (no colors)
  // 4. If user selected a specific theme: use that theme (overrides page default)
  const themeKey = 'mspa:theme';
  const userTheme = (() => {
    try { return localStorage.getItem(themeKey); } catch { return null; }
  })();

  let effectiveTheme;

  if (overruleTheme && defaultTheme) {
    // Page forces its theme - ignore user preference
    effectiveTheme = defaultTheme;
  } else if (!userTheme || userTheme === 'default') {
    // User wants default behavior - use page-specific theme or space
    effectiveTheme = defaultTheme || 'space';
  } else if (userTheme === 'space') {
    // User explicitly wants space theme
    effectiveTheme = 'space';
  } else {
    // User selected a specific theme
    effectiveTheme = userTheme;
  }

  // Handle theme-to-theme transitions
  // If originalTheme is specified, temporarily set it before transitioning to the new theme
  if (originalTheme && originalTheme !== effectiveTheme) {
    // First, set the original theme without transition
    const currentTransition = document.documentElement.getAttribute('data-transition');
    document.documentElement.setAttribute('data-transition', 'instant');

    if (originalTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', originalTheme);
    }

    // Force a reflow to ensure the original theme is applied
    void document.documentElement.offsetHeight;

    // Restore the transition type and apply the new theme
    document.documentElement.setAttribute('data-transition', currentTransition);

    // Use requestAnimationFrame to ensure the transition happens
    requestAnimationFrame(() => {
      if (effectiveTheme === 'space') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', effectiveTheme);
      }
    });
  } else {
    // Apply the theme normally (no specific original theme)
    if (effectiveTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    }
  }

  const saveData = (c, p) => {
    const payload = JSON.stringify({ chapter: c, page: p, at: Date.now() });
    try { localStorage.setItem(key, payload); } catch {}
    const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(payload)}; expires=${exp}; path=/; SameSite=Lax`;
  };
  const loadData = () => {
    try {
      const m = document.cookie.match(new RegExp('(?:^|; )' + cookieName + '=([^;]*)'));
      if (m) return JSON.parse(decodeURIComponent(m[1]));
    } catch {}
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch {}
    return null;
  };
  const deleteData = () => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    try { localStorage.removeItem(key); } catch {}
  };

  // Elements
  const $ = (id) => document.getElementById(id);
  const linkStart = $('link-start');
  const linkBack = $('link-back');
  const linkSave = $('link-save');
  const linkAuto = $('link-auto');
  const linkLoad = $('link-load');
  const linkDelete = $('link-delete');
  const cmdNext = $('cmd-next');

  const btnToggleLog = $('btn-toggle-log');
  const pesterlog = document.getElementById('pesterlog');

  // Respect default pesterlog preference from Options
  try {
    const showLogDefault = localStorage.getItem('mspa:pesterlog:default') === '1';
    if (pesterlog && showLogDefault) {
      pesterlog.removeAttribute('hidden');
      if (btnToggleLog) btnToggleLog.textContent = 'Hide Dialog';
    }
  } catch {}

  // Auto Save toggle
  const autoKey = 'autosave:series-1';
  const setAuto = (on) => {
    try { localStorage.setItem(autoKey, on ? '1' : '0'); } catch {}
    if (linkAuto) {
      linkAuto.setAttribute('aria-pressed', on ? 'true' : 'false');
      linkAuto.textContent = on ? 'Auto Log: ON' : 'Auto Log: OFF';
    }
  };
  const getAuto = () => {
    try { return localStorage.getItem(autoKey) === '1'; } catch { return false; }
  };
  setAuto(getAuto());

  // Keyboard navigation (only if enabled in Options)
  const getKbd = () => {
    try { return localStorage.getItem('mspa:nav:keyboard') === '1'; } catch { return false; }
  };
  function onKey(e) {
    if (!getKbd()) return;
    if (e.key === 'ArrowRight' && cur < total) {
      if (getAuto()) saveData(chapterId, cur + 1);
      location.href = `/read/${chapterId}/${cur + 1}`;
    } else if (e.key === 'ArrowLeft' && cur > 1) {
      // closer to screenshot behavior
      history.back();
    } else if (e.code === 'Space' || e.key === ' ') {
      // Space toggles log visibility
      if (pesterlog && btnToggleLog) {
        e.preventDefault();
        const hidden = pesterlog.hasAttribute('hidden');
        if (hidden) {
          pesterlog.removeAttribute('hidden');
          btnToggleLog.textContent = 'Hide Dialog';
        } else {
          pesterlog.setAttribute('hidden', '');
          btnToggleLog.textContent = 'Show Dialog';
        }
      }
    }
  }
  document.addEventListener('keydown', onKey);

  // Links / buttons
  linkBack && linkBack.addEventListener('click', (e) => { e.preventDefault(); history.back(); });
  linkSave && linkSave.addEventListener('click', (e) => { e.preventDefault(); saveData(chapterId, cur); alert('Game saved.'); });
  linkAuto && linkAuto.addEventListener('click', (e) => { e.preventDefault(); setAuto(!getAuto()); });
  linkLoad && linkLoad.addEventListener('click', (e) => {
    e.preventDefault();
    const p = loadData();
    if (p && p.chapter && p.page) location.href = `/read/${p.chapter}/${p.page}`;
    else alert('No save data found.');
  });
  linkDelete && linkDelete.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Delete saved game data?')) { deleteData(); alert('Save deleted.'); }
  });

  // Command link (Next): autosave before following if enabled
  cmdNext && cmdNext.addEventListener('click', (e) => {
    if (getAuto()) {
      e.preventDefault();
      const href = cmdNext.getAttribute('href');
      saveData(chapterId, Math.min(cur + 1, total));
      if (href) location.href = href;
    }
  });

  // Log toggle
  btnToggleLog && btnToggleLog.addEventListener('click', () => {
    if (!pesterlog) return;
    const hidden = pesterlog.hasAttribute('hidden');
    if (hidden) {
      pesterlog.removeAttribute('hidden');
      btnToggleLog.textContent = 'Hide Dialog';
    } else {
      pesterlog.setAttribute('hidden', '');
      btnToggleLog.textContent = 'Show Dialog';
    }
  });
});
