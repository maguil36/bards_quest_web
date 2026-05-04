# Styles Reference

**File:** `public/styles.css` (2678 lines total)

All styles are global — there is no CSS module system or scoped styling (Astro component `<style>` tags are used only in a few layout files). The bulk of site styling lives here.

---

## Top-Level Section Map

The file is divided into named sections using `/* ============================= */` banners. Note: several sections appear more than once (the file has duplicate blocks from development). The canonical/first occurrence of each section is listed here.

| Section | Approx. line range | Contents |
|---------|-------------------|---------|
| Theme Variables | 1–62 | `:root` CSS custom properties: core surfaces, accent, dynamic scroll-transition aliases, reader sizing, character persona colors |
| Aspect Themes | 63–243 | `html[data-theme="..."]` overrides for all 12 themes |
| Theme Transition Animations | 244–332 | `html[data-transition="..."]` rules controlling CSS transition durations |
| Desktop & Accessibility | 333–351 | `html[data-desktop="1"]` wide layout, `html[data-contrast="high"]` pesterlog overrides |
| Global Reset & Utilities | 352–390 | `box-sizing`, `body` base styles, font variants, `.container`, utility classes |
| Header & Footer | 391–449 | `.header`, `.navbar`, `.brand`, `.nav-links`, `.footer` |
| Bards Quest Layout | 450–695 | `.wrap`, `.mspa-nav`, `.mspa-card`, `.panel`, `.ctas`, `.cta`, `.mspa-footer`, `.sprite`, grist counter UI |
| Reader | 696–777 | `.reader .frame`, `.reader img.page`, `.mspa-pester-toggle`, `.mspa-utility`, `.mspa-command` |
| Quest Log (Pesterlog) | 778–1024 | `.pesterlog`, `.pesterlog-content`, per-character color classes, high-contrast overrides, special animations |
| Options Page | 1025–1146 | `.opt-list`, `.opt-row`, `.opt-control`, `.check-line`, selects, range inputs, buttons |
| Map Page | 1147–1197 | `.mspa-chapter`, `.mspa-waypoints`, `.mspa-waypoint` |

The file also contains duplicate copies of several sections (Desktop & Accessibility, Global Reset, Header & Footer, Bards Quest Layout, Reader, Quest Log, Options Page, Map Page) starting around line 1198. These are redundant but do not break anything because later rules with equal specificity override earlier ones. If cleaning up the file, the duplicates starting at line 1198 onward can be removed.

---

## Theme Color CSS Vars

### Pattern

```css
html[data-theme="<name>"] {
  --accent: ...;
  --bg: ...;
  --bg-soft: ...;
  --text: ...;
  --muted: ...;
  --card: ...;
  --surface: ...;
  --border: ...;
}
```

The `<html>` element's `data-theme` attribute is set by `reader.js` and `options.js`. Removing the attribute reverts to `:root` defaults (the `space`/dark theme values).

### What each var does

| Var | Used on |
|-----|---------|
| `--accent` | Links, interactive elements, slider thumbs, cta text |
| `--bg` | `body.mspa` background, `.wrap` descendants |
| `--bg-soft` | `body` background gradient (non-mspa pages) |
| `--text` | Body text, headings, card text |
| `--muted` | Nav links, metadata, secondary labels |
| `--card` | `.mspa-card` background, `.opt-list` background |
| `--surface` | `.header`, `.mspa-nav`, `.mspa-card .panel`, `.mspa-pester-toggle` |
| `--border` | Borders throughout, separator lines |

### Dynamic scroll-transition aliases

These are set as inline `style` properties by JS during `scroll`/`crawl` transitions and cascade-override the theme vars:

- `--bg-color` (falls back to `var(--bg-soft)`)
- `--text-color` (falls back to `var(--text)`)
- `--accent-color` (falls back to `var(--accent)`)
- `--panel-bg` (falls back to `var(--card)`)

### Character persona colors (`:root` only, not theme-dependent)

Used in `.pesterlog` for per-character dialogue text colors:

```
--alexis: #6600ff    --austine: #5db473    --chloe: #9cff86
--isabela: #d85221   --nicholas: #fa8e00   --opal: #d5ffe6
--tyson: #434c00     --victor: #ff8eb4
```

Plus alpha kids (`--alice`, `--audrey`, `--clayton`, `--irene`, `--nix`, `--nix2`, `--octavian`, `--trenton`, `--vettia`) and cryptids (`--okwos`, `--gwenhas`, `--dhesas`, `--redacted`).

---

## Key Layout Classes

### `.container`

```css
.container { width: min(1200px, 100%); margin: 0 auto; padding: 0 1rem; }
```

General-purpose centered container. Used on non-MSPA pages (landing, options, watch).

### `.wrap`

```css
.wrap { width: min(920px, 100%); margin: 0 auto; padding: 0 1rem 4rem; }
```

The MSPA reader column. Narrower than `.container` to match webcomic proportions. When `html[data-desktop="1"]` is set, expands to `min(1100px, 100%)`.

### `.mspa-nav`

```css
.mspa-nav { display: flex; align-items: center; justify-content: center; gap: .5rem;
            background: var(--surface); border: 1px solid var(--border); }
```

The horizontal navigation bar inside the reader (Previous / page indicator / Next). Links use `var(--accent)`.

### `.reader`

A wrapper around the comic page frame. Key child rules:
- `.reader .frame` — `background: var(--surface)`, no border-radius, `overflow: hidden`
- `.reader img.page` — `display: block; width: 100%; height: auto` (full-width responsive image)

### `.header`

```css
.header { position: sticky; top: 0; z-index: 10; background: var(--surface); border-bottom: 1px solid var(--border); }
```

Site-wide sticky top navbar. Contains `.navbar` (flex row), `.brand`, `.brand-logo`, `.brand-title`, `.nav-links`.

### `.footer`

```css
.footer { border-top: 1px solid var(--border); margin-top: 2rem; padding: 1rem 0; color: var(--muted); }
```

Site-wide bottom footer.

---

## Component-Specific Style Blocks

| Component | Section | Key classes |
|-----------|---------|-------------|
| Comic reader | Reader (line ~696) | `.reader`, `.reader .frame`, `.mspa-utility`, `.mspa-command`, `.mspa-pester-toggle` |
| Pesterlog / dialogue | Quest Log (line ~778) | `.pesterlog`, `.pesterlog-content`, `.pesterlog .line`, `.pesterlog .<character>` |
| Options page | Options Page (line ~1025) | `.opt-list`, `.opt-row`, `.opt-control`, `.opt-title`, `.opt-desc`, `.check-line`, `.range-val` |
| Map/chapter index | Map Page (line ~1147) | `.mspa-chapter`, `.mspa-chapter-header`, `.mspa-waypoints`, `.mspa-waypoint` |
| MSPA layout chrome | Bards Quest Layout (line ~450) | `.mspa-card`, `.mspa-card .panel`, `.ctas`, `.cta`, `.mspa-footer`, `.sprite` |
| Grist counter (game HUD) | Bards Quest Layout (line ~591) | `.grist-counter`, `.grist-list`, `.grist-item`, `.grist-icon`, `.grist-amount` |
| Accessibility / desktop | Desktop & Accessibility (line ~333) | `[data-desktop="1"]`, `[data-contrast="high"]`, `[data-kbd]` |

---

## Naming Conventions

- Site-global layout: `.container`, `.wrap`, `.header`, `.footer`, `.navbar`
- MSPA/comic-specific: `.mspa-*` prefix (e.g., `.mspa-nav`, `.mspa-card`, `.mspa-footer`, `.mspa-waypoint`)
- Options page: `.opt-*` prefix (e.g., `.opt-list`, `.opt-row`, `.opt-control`)
- Pesterlog characters: class name matches the lowercase character name (`.alexis`, `.opal`, etc.)
- State/attribute selectors: `html[data-theme="..."]`, `html[data-transition="..."]`, `html[data-desktop="1"]`, `html[data-contrast="high"]`, `body[data-font="..."]`

---

## How to Add Styles for a New Component

1. Pick a section to insert near. Use the nearest existing section as a guide (e.g., a new page component goes near "Map Page").
2. Add a named section banner:
   ```css
   /* =============================
      Your Component Name
      ============================= */
   ```
3. Use `.mspa-` prefix for anything inside the MSPA reader layout; plain names for site-global elements.
4. Use CSS custom properties (`var(--bg)`, `var(--text)`, etc.) for all colors so the element respects the active theme automatically.
5. Do not hardcode dark/light colors — they will break under theme switches.
6. If the component needs to react to desktop mode, add a rule under `html[data-desktop="1"] .your-class`.
