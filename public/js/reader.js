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
  // BUT: Skip transitions if user has selected an optional theme (unless overrule is true)
  const userHasOptionalTheme = userTheme && userTheme !== 'default' && userTheme !== 'space';
  const shouldSkipTransition = userHasOptionalTheme && !overruleTheme;

  if (originalTheme && originalTheme !== effectiveTheme && !shouldSkipTransition) {
    // Special handling for scroll transition
    if (transitionType === 'scroll') {
      // Set up scroll-based theme transition
      setupScrollTransition(originalTheme, effectiveTheme);
    } else if (transitionType === 'crawl') {
      // Set up crawling gradient transition
      setupCrawlTransition(originalTheme, effectiveTheme);
    } else if (transitionType === 'crawl') {
      // Set up crawling gradient transition
      setupCrawlTransition(originalTheme, effectiveTheme);
    } else {
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
    }
  } else {
    // Apply the theme normally (no specific original theme or skipping transition)
    if (effectiveTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    }
  }

  // Scroll-based transition handler
  function setupScrollTransition(fromTheme, toTheme) {
    // Get theme colors (must match CSS exactly!)
    const getThemeColors = (themeName) => {
      const themeColors = {
        'space': { bg: '#0f1014', text: '#e8e9ec', accent: '#4da3ff', card: '#13141a', surface: '#111217' },
        'breath': { bg: '#F3F4F9', text: '#000000', accent: '#007eb4', card: '#D6DAF0', surface: '#D6DAF0' },
        'light': { bg: '#ffffff', text: '#000000', accent: '#ff8000', card: '#dddddd', surface: '#dddddd' },
        'time': { bg: 'color-mix(in srgb, #0f1014 70%, #ff4d4d 30%)', text: '#e8e9ec', accent: '#ff4d4d', card: 'color-mix(in srgb, #13141a 80%, #ff4d4d 20%)', surface: 'color-mix(in srgb, #111217 85%, #ff4d4d 15%)' },
        'heart': { bg: 'color-mix(in srgb, #0f1014 70%, #ff4da6 30%)', text: '#e8e9ec', accent: '#ff4da6', card: 'color-mix(in srgb, #13141a 80%, #ff4da6 20%)', surface: 'color-mix(in srgb, #111217 85%, #ff4da6 15%)' },
        'mind': { bg: 'color-mix(in srgb, #0f1014 70%, #00c2a0 30%)', text: '#e8e9ec', accent: '#00c2a0', card: 'color-mix(in srgb, #13141a 80%, #00c2a0 20%)', surface: 'color-mix(in srgb, #111217 85%, #00c2a0 15%)' },
        'hope': { bg: 'color-mix(in srgb, #dddddd 95%, #ffd700 5%)', text: '#000000', accent: '#df9f03', card: '#eeeeee', surface: '#ffffff' },
        'rage': { bg: 'color-mix(in srgb, #0f1014 70%, #a855f7 30%)', text: '#ff00ff', accent: '#00ffff', card: 'color-mix(in srgb, #13141a 85%, #a855f7 15%)', surface: 'color-mix(in srgb, #111217 85%, #a855f7 15%)' },
        'life': { bg: '#535353', text: '#ffffff', accent: '#043400', card: '#c6c6c6', surface: '#efefef' },
        'doom': { bg: '#000000', text: '#888888', accent: '#204020', card: '#555555', surface: '#888888' },
        'blood': { bg: '#ffffee', text: '#800000', accent: '#100068', card: '#f0dfd6', surface: '#f0dfd6' },
        'void': { bg: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)', text: '#ffffff', accent: '#4f46e5', card: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)', surface: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)' }
      };
      return themeColors[themeName] || themeColors['space'];
    };

    // Color interpolation helper
    function interpolateColor(color1, color2, factor) {
      // Parse hex colors and color-mix
      const parseColor = (color) => {
        if (color.startsWith('color-mix')) {
          // Parse color-mix(in srgb, #color1 X%, #color2 Y%)
          const match = color.match(/color-mix\(in srgb,\s*([#0-9a-fA-F]{6,7})\s+(\d+)%,\s*([#0-9a-fA-F]{6,7})\s+(\d+)%\)/);
          if (match) {
            const color1 = match[1];
            const percent1 = parseInt(match[2]) / 100;
            const color2 = match[3];
            const percent2 = parseInt(match[4]) / 100;

            // Parse both colors
            const c1 = {
              r: parseInt(color1.slice(1, 3), 16),
              g: parseInt(color1.slice(3, 5), 16),
              b: parseInt(color1.slice(5, 7), 16)
            };
            const c2 = {
              r: parseInt(color2.slice(1, 3), 16),
              g: parseInt(color2.slice(3, 5), 16),
              b: parseInt(color2.slice(5, 7), 16)
            };

            // Mix the colors
            return {
              r: Math.round(c1.r * percent1 + c2.r * percent2),
              g: Math.round(c1.g * percent1 + c2.g * percent2),
              b: Math.round(c1.b * percent1 + c2.b * percent2)
            };
          }
        }
        if (color.startsWith('#')) {
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          return { r, g, b };
        }
        return { r: 0, g: 0, b: 0 };
      };

      const c1 = parseColor(color1);
      const c2 = parseColor(color2);

      const r = Math.round(c1.r + (c2.r - c1.r) * factor);
      const g = Math.round(c1.g + (c2.g - c1.g) * factor);
      const b = Math.round(c1.b + (c2.b - c1.b) * factor);

      return `rgb(${r}, ${g}, ${b})`;
    }

    // Start with the original theme
    if (fromTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', fromTheme);
    }

    const fromColors = getThemeColors(fromTheme);
    const toColors = getThemeColors(toTheme);

    let ticking = false;

    function updateThemeBasedOnScroll() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

      // Define gradient zone (80% of scroll range)
      const gradientZoneSize = 0.8;
      const gradientStart = 0.1; // Start gradient at 10% scroll
      const gradientEnd = gradientStart + gradientZoneSize; // End at 90% scroll

      let colorFactor = 0;

      if (scrollPercent <= gradientStart) {
        // Before gradient zone - use original theme
        colorFactor = 0;
      } else if (scrollPercent >= gradientEnd) {
        // After gradient zone - use target theme
        colorFactor = 1;
      } else {
        // Inside gradient zone - interpolate
        colorFactor = (scrollPercent - gradientStart) / gradientZoneSize;
      }

      // Apply smooth easing to the color transition
      const easedFactor = colorFactor < 0.5
        ? 2 * colorFactor * colorFactor
        : 1 - Math.pow(-2 * colorFactor + 2, 2) / 2;

      // Interpolate colors
      const currentBg = interpolateColor(fromColors.bg, toColors.bg, easedFactor);
      const currentText = interpolateColor(fromColors.text, toColors.text, easedFactor);
      const currentAccent = interpolateColor(fromColors.accent, toColors.accent, easedFactor);
      const currentCard = interpolateColor(fromColors.card, toColors.card, easedFactor);
      const currentSurface = interpolateColor(fromColors.surface, toColors.surface, easedFactor);

      // Apply colors to CSS variables (both dynamic and base variables)
      document.documentElement.style.setProperty('--bg-color', currentBg);
      document.documentElement.style.setProperty('--text-color', currentText);
      document.documentElement.style.setProperty('--accent-color', currentAccent);
      document.documentElement.style.setProperty('--panel-bg', currentCard);

      // Also update the base CSS variables for full element coverage
      document.documentElement.style.setProperty('--bg', currentBg);
      document.documentElement.style.setProperty('--text', currentText);
      document.documentElement.style.setProperty('--accent', currentAccent);
      document.documentElement.style.setProperty('--card', currentCard);
      document.documentElement.style.setProperty('--surface', currentSurface);

      // Update theme attribute for other styles
      if (scrollPercent >= gradientEnd) {
        if (toTheme === 'space') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', toTheme);
        }
      } else if (scrollPercent <= gradientStart) {
        if (fromTheme === 'space') {
          document.documentElement.removeAttribute('data-theme');
        } else {
          document.documentElement.setAttribute('data-theme', fromTheme);
        }
      }

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateThemeBasedOnScroll);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial check
    updateThemeBasedOnScroll();
  }

  // Crawl-based transition handler - gradient crawls up from bottom as you scroll
  function setupCrawlTransition(fromTheme, toTheme) {
    // Helper to parse color strings (including color-mix)
    const parseColor = (colorStr) => {
      if (colorStr.startsWith('color-mix')) {
        const match = colorStr.match(/color-mix\(in srgb,\s*([#\w]+)\s+([\d.]+)%,\s*([#\w]+)\s+([\d.]+)%\)/);
        if (match) {
          const [, color1, percent1, color2, percent2] = match;
          const p1 = parseFloat(percent1) / 100;
          const p2 = parseFloat(percent2) / 100;
          const rgb1 = hexToRgb(color1);
          const rgb2 = hexToRgb(color2);
          return {
            r: Math.round(rgb1.r * p1 + rgb2.r * p2),
            g: Math.round(rgb1.g * p1 + rgb2.g * p2),
            b: Math.round(rgb1.b * p1 + rgb2.b * p2)
          };
        }
      }
      return hexToRgb(colorStr);
    };

    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const interpolateColor = (color1, color2, factor) => {
      const c1 = parseColor(color1);
      const c2 = parseColor(color2);
      const r = Math.round(c1.r + (c2.r - c1.r) * factor);
      const g = Math.round(c1.g + (c2.g - c1.g) * factor);
      const b = Math.round(c1.b + (c2.b - c1.b) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Get theme colors
    const getThemeColors = (themeName) => {
      const themeColors = {
        'space': { bg: '#0f1014', text: '#e8e9ec', accent: '#4da3ff', card: '#13141a', surface: '#111217' },
        'breath': { bg: '#F3F4F9', text: '#000000', accent: '#007eb4', card: '#D6DAF0', surface: '#D6DAF0' },
        'light': { bg: '#ffffff', text: '#000000', accent: '#ff8000', card: '#dddddd', surface: '#dddddd' },
        'time': { bg: 'color-mix(in srgb, #0f1014 70%, #ff4d4d 30%)', text: '#e8e9ec', accent: '#ff4d4d', card: 'color-mix(in srgb, #13141a 80%, #ff4d4d 20%)', surface: 'color-mix(in srgb, #111217 85%, #ff4d4d 15%)' },
        'heart': { bg: 'color-mix(in srgb, #0f1014 70%, #ff4da6 30%)', text: '#e8e9ec', accent: '#ff4da6', card: 'color-mix(in srgb, #13141a 80%, #ff4da6 20%)', surface: 'color-mix(in srgb, #111217 85%, #ff4da6 15%)' },
        'mind': { bg: 'color-mix(in srgb, #0f1014 70%, #00c2a0 30%)', text: '#e8e9ec', accent: '#00c2a0', card: 'color-mix(in srgb, #13141a 80%, #00c2a0 20%)', surface: 'color-mix(in srgb, #111217 85%, #00c2a0 15%)' },
        'hope': { bg: 'color-mix(in srgb, #dddddd 95%, #ffd700 5%)', text: '#000000', accent: '#df9f03', card: '#eeeeee', surface: '#ffffff' },
        'rage': { bg: 'color-mix(in srgb, #0f1014 70%, #a855f7 30%)', text: '#ff00ff', accent: '#00ffff', card: 'color-mix(in srgb, #13141a 85%, #a855f7 15%)', surface: 'color-mix(in srgb, #111217 85%, #a855f7 15%)' },
        'life': { bg: '#535353', text: '#ffffff', accent: '#043400', card: '#c6c6c6', surface: '#efefef' },
        'doom': { bg: '#000000', text: '#888888', accent: '#204020', card: '#555555', surface: '#888888' },
        'blood': { bg: '#ffffee', text: '#800000', accent: '#100068', card: '#f0dfd6', surface: '#f0dfd6' },
        'void': { bg: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)', text: '#ffffff', accent: '#4f46e5', card: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)', surface: 'color-mix(in srgb, #0f1014 70%, #4f46e5 30%)' }
      };
      return themeColors[themeName] || themeColors['space'];
    };

    // Start with the original theme
    if (fromTheme === 'space') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', fromTheme);
    }

    const fromColors = getThemeColors(fromTheme);
    const toColors = getThemeColors(toTheme);

    let ticking = false;

    function updateCrawlGradient() {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;

      // Gradient zone is 90% of the viewport
      const viewportHeight = window.innerHeight;
      const gradientZone = viewportHeight * 2; // 90% in pixels

      // Calculate where the crawl line is (in pixels from bottom of viewport)
      // At 0% scroll: crawl line is below viewport
      // At 50% scroll: crawl line is at top of viewport (2x speed)
      // Multiply by 2 to make it crawl 2x faster than scroll
      const crawlLineFromBottom = (scrollPercent * 1.25) * (viewportHeight + gradientZone) - gradientZone;

      // Convert to position from top
      const crawlLineFromTop = viewportHeight - crawlLineFromBottom;

      // Helper to create gradient for a color pair
      const createCrawlGradient = (fromColor, toColor) => {
        // Top of gradient zone (in pixels from top)
        const gradientTop = crawlLineFromTop - gradientZone;
        // Bottom of gradient zone (in pixels from top)
        const gradientBottom = crawlLineFromTop;

        const gradientStops = [];

        // Above gradient: old theme
        if (gradientTop > 0) {
          gradientStops.push(`${fromColor} 0px`);
          gradientStops.push(`${fromColor} ${gradientTop}px`);
        }

        // Gradient zone: interpolate
        const numSteps = 10;
        for (let i = 0; i <= numSteps; i++) {
          const factor = i / numSteps;
          const position = gradientTop + (gradientZone * factor);

          if (position >= 0 && position <= viewportHeight) {
            // Apply quadratic easing (x²) to the transition factor
            // This makes the old theme dominant until about 70% through the gradient
            // then quickly transitions to the new theme
            const easedFactor = factor * factor;
            const color = interpolateColor(fromColor, toColor, easedFactor);
            gradientStops.push(`${color} ${position}px`);
          }
        }

        // Below gradient: new theme
        if (gradientBottom < viewportHeight) {
          gradientStops.push(`${toColor} ${Math.max(0, gradientBottom)}px`);
          gradientStops.push(`${toColor} ${viewportHeight}px`);
        } else if (gradientStops.length === 0) {
          // Fully transitioned
          gradientStops.push(`${toColor} 0px`);
          gradientStops.push(`${toColor} ${viewportHeight}px`);
        }

        return `linear-gradient(to bottom, ${gradientStops.join(', ')})`;
      };

      // Apply gradients to all color properties
      const bgGradient = createCrawlGradient(fromColors.bg, toColors.bg);
      const cardGradient = createCrawlGradient(fromColors.card, toColors.card);
      const surfaceGradient = createCrawlGradient(fromColors.surface, toColors.surface);

      // Apply to CSS variables as gradients with fixed attachment
      // This makes the gradient position relative to viewport, not each element
      document.documentElement.style.setProperty('--bg', bgGradient);
      document.documentElement.style.setProperty('--card', cardGradient);
      document.documentElement.style.setProperty('--surface', surfaceGradient);

      // Set background attachment to fixed for unified gradient effect
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundSize = '100% 100vh';

      // Apply to all card and surface elements
      const cards = document.querySelectorAll('.mspa-card, [style*="var(--card)"]');
      cards.forEach(el => {
        el.style.backgroundAttachment = 'fixed';
        el.style.backgroundSize = '100% 100vh';
      });

      const surfaces = document.querySelectorAll('.panel, .mspa-nav, [style*="var(--surface)"]');
      surfaces.forEach(el => {
        el.style.backgroundAttachment = 'fixed';
        el.style.backgroundSize = '100% 100vh';
      });

      // For text and accent, use average color since they can't be gradients
      const avgTransition = Math.min(Math.max(scrollPercent, 0), 1);
      const currentText = interpolateColor(fromColors.text, toColors.text, avgTransition);
      const currentAccent = interpolateColor(fromColors.accent, toColors.accent, avgTransition);

      document.documentElement.style.setProperty('--text', currentText);
      document.documentElement.style.setProperty('--accent', currentAccent);

      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateCrawlGradient);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial render
    updateCrawlGradient();
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
