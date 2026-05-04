# Reader, Options, Progress, and Resume Scripts

These four scripts handle the interactive layer of the comic reader: theme application, keyboard navigation, read-progress saving, and the options UI.

---

## reader.js

**Path:** `public/js/reader.js` (568 lines)

Runs on every comic reader page (`/read/[chapterId]/[page]`). It is loaded inside a `DOMContentLoaded` listener and operates entirely on the `#reader-root` element.

### What it does

- Reads chapter/page metadata from `data-*` attributes on `#reader-root`.
- Resolves the effective theme (see priority order in `theme-system.md`) and sets `data-theme` on `<html>`.
- Sets up scroll-based or crawl-based gradient transitions when specified.
- Saves and loads read progress via localStorage (`progress:series-1`) and a cookie (`savegame`).
- Wires keyboard navigation (arrow keys, space bar) if enabled.
- Controls pesterlog/dialogue toggle and autosave behavior.

### Key data attributes read from `#reader-root`

| Attribute | Value |
|-----------|-------|
| `data-chapter` | Current chapter ID (number) |
| `data-total` | Total pages in chapter (number) |
| `data-page` | Current page number |
| `data-default-theme` | Theme name from `ThemeConfig.getDefaultTheme()` |
| `data-original-theme` | `originalTheme` from `ThemeConfig` (for transitions) |
| `data-overrule-theme` | `'1'` if page forces its theme |
| `data-transition` | Transition type string |

### localStorage keys used

| Key | Purpose |
|-----|---------|
| `mspa:theme` | User's preferred theme (read-only in reader.js) |
| `progress:series-1` | JSON `{ chapter, page, at }` — save/load progress |
| `autosave:series-1` | `'0'`/`'1'` — whether auto-log is on |
| `mspa:nav:keyboard` | `'0'`/`'1'` — whether keyboard nav is on (read-only) |
| `mspa:pesterlog:default` | `'0'`/`'1'` — whether to auto-show pesterlog (read-only) |

### Key functions

| Function | Lines | Description |
|----------|-------|-------------|
| `setupScrollTransition(fromTheme, toTheme)` | 99–260 | Attaches a scroll listener; interpolates CSS vars between two themes over 10%–90% of scroll range with eased quadratic factor |
| `setupCrawlTransition(fromTheme, toTheme)` | 263–445 | Attaches a scroll listener; draws a crawling gradient band using `linear-gradient` on `--bg`, `--card`, `--surface` with `background-attachment: fixed` |
| `saveData(chapter, page)` | 447–452 | Writes `{ chapter, page, at }` to both localStorage (`progress:series-1`) and a `savegame` cookie (1-year expiry) |
| `loadData()` | 453–459 | Reads from cookie first, falls back to localStorage |
| `deleteData()` | 461–464 | Clears cookie and localStorage key |
| `setAuto(on)` | 491–496 | Toggles `autosave:series-1` and updates the `#link-auto` button label |
| `onKey(e)` | 506–528 | Keyboard handler: `ArrowRight` → next page, `ArrowLeft` → `history.back()`, `Space` → toggle pesterlog |

### Event listeners wired

| Element ID | Event | Action |
|-----------|-------|--------|
| `link-back` | click | `history.back()` |
| `link-save` | click | `saveData(chapterId, cur)` |
| `link-auto` | click | Toggle auto-log |
| `link-load` | click | Load progress and navigate |
| `link-delete` | click | Confirm, then `deleteData()` |
| `cmd-next` | click | Auto-save then follow href |
| `btn-toggle-log` | click | Toggle `hidden` on `#pesterlog` |
| `document` | keydown | `onKey(e)` — keyboard nav |

---

## options.js

**Path:** `public/js/options.js` (128 lines)

Runs on the Options page. Self-contained IIFE. Reads/writes all user preferences to localStorage and applies them immediately to the current document.

### localStorage keys managed

All keys are defined in the `K` constant at the top of the file:

| Constant | Key | Type | Default | What it controls |
|----------|-----|------|---------|-----------------|
| `K.desktop` | `mspa:ui:desktop` | `'0'`/`'1'` | `'0'` | Desktop layout mode: sets `html[data-desktop]` |
| `K.autologs` | `mspa:pesterlog:default` | `'0'`/`'1'` | `'0'` | Auto-show dialogue/pesterlog on reader pages |
| `K.keyboard` | `mspa:nav:keyboard` | `'0'`/`'1'` | `'0'` | Arrow-key navigation: sets `html[data-kbd]` |
| `K.theme` | `mspa:theme` | theme name / `'default'` | absent | Page color theme |
| `K.pageFont` | `mspa:font-ui` | `'system'`/`'inter'`/`'comic'` | `'system'` | UI font: sets `body[data-font]` |
| `K.textSize` | `mspa:text-size` | number string | `'18'` | Reader text size: sets `--reader-text` CSS var |
| `K.contrast` | `mspa:text:contrast` | `'0'`/`'1'` | `'0'` | High-contrast pesterlog: sets `html[data-contrast]` |

### `applyTheme()` function (line 40)

The main theme-application function:

```js
function applyTheme() {
  const t = selTheme?.value || get(K.theme, 'default') || 'default';
  if (t === 'default') {
    document.documentElement.removeAttribute('data-theme');
    try { localStorage.removeItem(K.theme); } catch {}
  } else if (t === 'space') {
    document.documentElement.removeAttribute('data-theme');
    set(K.theme, 'space');
  } else {
    document.documentElement.setAttribute('data-theme', t);
    set(K.theme, t);
  }
}
```

- `'default'` → removes `data-theme` attribute and deletes the localStorage key (lets per-page themes operate normally).
- `'space'` → removes `data-theme` attribute but stores `'space'` in localStorage (locks to dark theme).
- Any other value → sets `data-theme` attribute and stores the value.

### Data export/import/reset

The options page provides three buttons:
- `#opt-export` — dumps all keys matching `mspa:*`, `autosave:*`, `progress:*` to a JSON file (`bards-quest-options.json`).
- `#opt-import` — reads a JSON file and restores matching keys, then reloads.
- `#opt-reset` — removes all `mspa:*`, `autosave:*`, `progress:*` keys, then reloads.

---

## progress.js

**Path:** `public/js/progress.js` (14 lines)

Runs on the index/home page. Reads the saved progress entry and wires the "Resume reading" UI link.

### What it tracks

Reads (read-only) the localStorage key `progress:series-1`, which is written by `reader.js`. The value is a JSON object:

```json
{ "chapter": 1, "page": 5, "at": 1714000000000 }
```

### Behavior

On `DOMContentLoaded`:
1. Parses `progress:series-1` from localStorage.
2. If a valid `{ chapter, page }` entry exists, sets `#resume-link` href to `/read/{chapter}/{page}` and makes it visible.
3. If no valid entry exists, hides `#resume-link` and shows `#resume-empty`.

---

## resume.js

**Path:** `public/js/resume.js` (12 lines)

Runs on a dedicated `/resume` route (or wherever it is embedded). Immediately redirects the browser to the saved reading position without showing any UI.

### What it reads/writes

Read-only. Reads `progress:series-1` from localStorage (same key as `progress.js` and `reader.js`).

### Behavior

On `DOMContentLoaded`:
1. Parses `progress:series-1`.
2. If `{ chapter, page }` exists → `location.replace('/read/{chapter}/{page}')`.
3. If no save data → `location.replace('/read/1/1')` (start of chapter 1).
4. If any error (e.g., localStorage unavailable) → `location.replace('/map')`.

---

## How to Add a New User Preference

Follow the pattern from `options.js`:

1. **Choose a localStorage key** using the `mspa:` prefix for user preferences, e.g., `mspa:my-feature`.

2. **Add it to the `K` constant** in `options.js`:
   ```js
   const K = {
     // ... existing keys ...
     myFeature: 'mspa:my-feature',
   };
   ```

3. **Write an apply function** that reads the stored value and sets a DOM attribute or CSS property:
   ```js
   const cbMyFeature = $('#opt-my-feature');
   function applyMyFeature() {
     const on = get(K.myFeature, '0') === '1';
     document.documentElement.setAttribute('data-my-feature', on ? '1' : '0');
     if (cbMyFeature) cbMyFeature.checked = on;
   }
   cbMyFeature && cbMyFeature.addEventListener('change', () => {
     set(K.myFeature, cbMyFeature.checked ? '1' : '0');
     applyMyFeature();
   });
   applyMyFeature();
   ```

4. **Add the corresponding HTML control** (checkbox, select, range) to the options page template with the id matching `#opt-my-feature`.

5. **Read the key wherever needed** in other scripts using the same `mspa:my-feature` key directly (or pass it as a data attribute from the server).

The export/import/reset buttons in `options.js` automatically include any key starting with `mspa:`, so no changes to those handlers are required.
