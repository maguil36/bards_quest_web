# Theme System

The theme system controls the color scheme of the entire site. Every page carries a per-page default theme; users can override it from the Options page; and the embedded game can push theme changes to the parent page via `postMessage`.

---

## Priority Order

When `reader.js` resolves which theme to show, it applies this priority (highest first):

1. **Page overrule** — if `ThemeConfig` returned `overrule: true`, the page theme is always used regardless of user preference.
2. **User localStorage preference** — if the user chose a specific theme (not `default`), that theme is used.
3. **Page default** — if `ThemeConfig` returned a theme for this chapter/page, it is used.
4. **Fallback** — `space` (the dark default) is applied when no other config exists.

Special cases:
- User selects `"default"` → behaves as if no preference is stored; page defaults apply.
- User selects `"space"` → always dark/no-color regardless of page config (unless overrule).
- When a user has a non-default/non-space theme selected, all animated transitions are skipped (`instant`) unless the page uses `overrule: true`.

---

## ThemeConfig.astro

**Path:** `src/components/ThemeConfig.astro`

### Interface

```ts
export interface ThemeConfig {
  theme: string;
  originalTheme?: string;   // What theme to transition FROM (optional)
  overrule?: boolean;       // Defaults to false. true = ignore user prefs
  transition?: 'smooth' | 'instant' | 'fast' | 'slow' | 'fade' | 'scroll' | 'crawl';
}
```

### Main function

```ts
export function getDefaultTheme(chapterId: number, pageNumber: number): ThemeConfig | null
```

Returns a `ThemeConfig` object for the given chapter/page, or `null` if no theme is defined (falls back to `space`). Edit the body of this function to add new page themes.

Helper functions (not normally edited):
- `hasDefaultTheme(chapterId, pageNumber): boolean`
- `shouldOverruleUserPreference(chapterId, pageNumber): boolean`
- `getTransitionType(chapterId, pageNumber): string` — returns `'smooth'` if not specified

---

## Transition Types

All transition types are set via the `data-transition` attribute on `<html>` and matched in `public/styles.css`.

| Type | CSS duration | Notes |
|------|-------------|-------|
| `smooth` | 2s ease-in-out | Default when `transition` is omitted |
| `instant` | none | No animation at all |
| `fast` | 0.5s ease-in-out | Quick change |
| `slow` | 4s ease-in-out | Dramatic effect |
| `fade` | 2s ease-in-out + opacity | Like smooth but also fades opacity |
| `scroll` | JS-driven | Colors interpolate as user scrolls (gradient zone: 10%–90% of scroll); requires `originalTheme` |
| `crawl` | JS-driven | A gradient band crawls up from the bottom of the viewport as you scroll; requires `originalTheme` |

### scroll transition details

Implemented in `setupScrollTransition(fromTheme, toTheme)` in `reader.js` (line 99). The gradient zone spans 80% of the scroll range (starts at 10%, ends at 90%). Uses eased quadratic interpolation. Updates `--bg-color`, `--text-color`, `--accent-color`, `--panel-bg`, `--bg`, `--text`, `--accent`, `--card`, `--surface` as inline CSS custom properties.

### crawl transition details

Implemented in `setupCrawlTransition(fromTheme, toTheme)` in `reader.js` (line 263). A band equal to `2 × viewportHeight` crawls upward at 1.25× scroll speed. Applies a `linear-gradient` directly to `--bg`, `--card`, `--surface` with `background-attachment: fixed`. Text/accent use linear average over full scroll percent.

---

## Available Themes

12 themes are defined in `public/styles.css` as `html[data-theme="..."]` selectors:

| Theme name | Key color / style |
|------------|------------------|
| `space` | Dark (#0f1014 bg), blue accent (#4da3ff) — the default |
| `breath` | Light (#F3F4F9 bg), blue accent (#007eb4) |
| `light` | White bg, orange accent (#ff8000) |
| `time` | Dark with red tint, red accent (#ff4d4d) |
| `heart` | Dark with pink tint, pink accent (#ff4da6) |
| `mind` | Dark with teal tint, teal accent (#00c2a0) |
| `hope` | Near-white (color-mix #dddddd/gold 5%), gold accent (#df9f03) |
| `rage` | Dark with purple tint, cyan accent (#00ffff), magenta text |
| `life` | Mid-grey (#535353 bg), dark green accent (#043400) |
| `doom` | Black bg, dark green accent (#204020), grey text |
| `blood` | Cream (#ffffee bg), dark red text (#800000), navy accent (#100068) |
| `void` | Dark with indigo tint, indigo accent (#4f46e5) |

The `space` theme is the no-color fallback. When effectiveTheme is `space`, the code calls `document.documentElement.removeAttribute('data-theme')` rather than setting `data-theme="space"` (though a `data-theme="space"` selector also exists as an alias).

### Character themes (8 playable characters)

These are the aspect themes mapped to each playable character in the Switch game:

| Character | Aspect theme |
|-----------|-------------|
| Opal | `space` |
| Nicholas | `light` |
| Isabela | `blood` |
| Austine | `mind` |
| Chloe | `life` |
| Alexis | `rage` |
| Tyson | `doom` |
| Victor | `time` |

---

## CSS `data-theme` Attribute

The `<html>` element carries `data-theme="<name>"`. Each theme overrides these CSS custom properties:

| Property | Purpose |
|----------|---------|
| `--accent` | Links, highlights, interactive elements |
| `--bg` | Page background |
| `--bg-soft` | Gradient background for `body` |
| `--text` | Primary text color |
| `--muted` | Secondary/dimmed text |
| `--card` | Card/panel background |
| `--surface` | Slightly different surface (navbar, inner panels) |
| `--border` | Border color |

Additional scroll-transition dynamic aliases (set by JS as inline styles):
`--bg-color`, `--text-color`, `--accent-color`, `--panel-bg`

The `data-transition` attribute on `<html>` controls which CSS transition rule applies to background/color/border-color changes.

---

## localStorage Keys

All keys used by the theme system and related preferences:

| Key | Type | Purpose |
|-----|------|---------|
| `mspa:theme` | string | User's chosen theme. Values: a theme name, `'space'`, `'default'`, or absent (defaults to `'default'`) |
| `mspa:ui:desktop` | `'0'` / `'1'` | Desktop-wide layout mode (widens `.wrap` to 1100px) |
| `mspa:nav:keyboard` | `'0'` / `'1'` | Keyboard arrow-key page navigation on/off |
| `mspa:text:contrast` | `'0'` / `'1'` | High-contrast pesterlog text on/off |
| `mspa:text-size` | number string | Reader text size in px (default `'18'`) |
| `mspa:font-ui` | string | Site UI font: `'system'`, `'inter'`, `'comic'` |
| `mspa:pesterlog:default` | `'0'` / `'1'` | Auto-show pesterlog/dialogue box on page load |
| `progress:series-1` | JSON | Read progress: `{ chapter, page, at }` |
| `autosave:series-1` | `'0'` / `'1'` | Auto-log progress on each page turn |

---

## Game → Page postMessage Bridge

When the player switches characters in the Switch game, the game sends a `postMessage` to the parent page to update the site theme.

**Sent from:** `public/games/switch/game.js`, `applyCharacterTheme()` (line 1515)

**Message shape:**
```js
{ type: 'GAME_THEME_CHANGE', theme: string }
```

**Handler location:** `src/layouts/MSPALayout.astro`, line 842 — inside a `<script>` block at the bottom of the layout.

**Handler logic:**
1. Reads `mspa:theme` from localStorage.
2. If user has `'default'` or no preference, applies the new theme with a smooth transition (sets `data-transition='instant'`, forces reflow, restores `'smooth'`, then sets `data-theme` in the next animation frame).
3. If user has a specific theme preference set, the game's message is ignored.

---

## How to Add a New Theme

1. **Add CSS vars** — In `public/styles.css`, after the existing `html[data-theme="void"]` block (around line 190), add:
   ```css
   html[data-theme="yourtheme"] {
     --accent: #...;
     --bg: #...;
     --bg-soft: linear-gradient(...);
     --text: #...;
     --muted: #...;
     --card: #...;
     --surface: #...;
     --border: #...;
   }
   ```

2. **Add color table entry for scroll/crawl** — In `reader.js`, the `getThemeColors()` helper is defined twice (inside `setupScrollTransition` and `setupCrawlTransition`). Add an entry to both instances:
   ```js
   'yourtheme': { bg: '#...', text: '#...', accent: '#...', card: '#...', surface: '#...' }
   ```

3. **Assign to pages** — In `src/components/ThemeConfig.astro`, inside `getDefaultTheme()`, add:
   ```ts
   if (chapterId === X && pageNumber === Y) return { theme: 'yourtheme' };
   ```

4. **Expose in Options** — Add `<option value="yourtheme">Your Theme</option>` to the `#opt-theme` select element in the options page template (`src/pages/options.astro` or equivalent).
