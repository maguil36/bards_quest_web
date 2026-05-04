# Page Anatomy

How a single comic page is assembled in `src/pages/read/[id]/[page].astro`.

---

## Render order

The page template renders these elements top-to-bottom inside an `<article id="reader-root">`:

1. **`<PageTitle>`** — `<h1 class="mspa-title">` with the page command string
2. **Game or Image (conditional)** — `<GameEmbed>` if `shouldShowGame` is true, otherwise `<PageImage>`
3. **`<PageNarration>`** — narrator text block (only rendered when the chapter/page has narration)
4. **`<DialogueBox>`** — pesterlog toggle + collapsible dialogue section (only rendered when the page has dialogue)
5. **`<NavigationCommand>`** — `> Next Page Title` forward-navigation link
6. **`<UtilityLinks>`** — Begin Anew / Go Back / Log Location / Auto Log / Go to Location / Remove Log bar

A preload `<link rel="preload" as="image">` for the next page's image is injected into the `<head>` slot of `MSPALayout` when the current page is not a game page.

`/js/reader.js` is loaded at the bottom of the article via `<script src="/js/reader.js" defer>`.

---

## The `#reader-root` article element

```html
<article
  id="reader-root"
  class="reader"
  data-chapter="{chapter.id}"
  data-total="{chapter.totalPages}"
  data-page="{currentPage}"
  data-default-theme="{defaultTheme}"
  data-original-theme="{originalTheme}"
  data-overrule-theme="{overruleTheme}"
  data-transition="{transitionType}"
>
```

| Attribute | Source | Value |
|-----------|--------|-------|
| `data-chapter` | `chapter.id` | Global chapter ID number |
| `data-total` | `chapter.totalPages` | Total pages in the chapter |
| `data-page` | `currentPage` | Current page number (1-based) |
| `data-default-theme` | `themeConfig?.theme \|\| ''` | Theme name to apply on this page, or empty string |
| `data-original-theme` | `themeConfig?.originalTheme \|\| ''` | Starting theme for scroll/crawl transitions |
| `data-overrule-theme` | `themeConfig?.overrule ? '1' : '0'` | `'1'` if page theme overrides user preference |
| `data-transition` | `themeConfig?.transition \|\| 'smooth'` | Transition type: `'smooth'`, `'instant'`, `'scroll'`, or `'crawl'` |

`themeConfig` comes from `getDefaultTheme(chapter.id, currentPage)` in `src/components/ThemeConfig.astro`.

---

## Components

### `PageTitle`

**File:** `src/components/PageTitle.astro`

**Props:**
```ts
{ chapter: any; page: number }
```

Calls `getPageTitle(chapter, page)` from `src/utils/pageUtils.ts` and renders:
```html
<h1 class="mspa-title">{title}</h1>
```

---

### `PageImage`

**File:** `src/components/PageImage.astro`

**Props:**
```ts
{ page: number; title: string }
```

Calls `getImageSrc(page)` from `src/utils/pageUtils.ts`. Renders:
```html
<div class="frame mt-05" style="text-align:center">
  <img src="{imgSrc}" alt="{title}" class="page" loading="eager" />
</div>
```

Only rendered when `shouldShowGame(chapter, currentPage)` is `false`.

---

### `GameEmbed`

**File:** `src/components/GameEmbed.astro`

**Props:**
```ts
{
  gameType: string;    // Required. Must match a key in the internal gameFiles map.
  seed?: number;       // Default: random integer 0–999999
  width?: number;      // Default: 650
  height?: number;     // Default: 450
  chapter?: any;
  page?: number;
}
```

Registered game types: `'switch'` → `/games/switch/index.html`. Unknown `gameType` throws at build time.

Builds the iframe URL as `{gameUrl}?seed={seed}&chapter={chapter.id}&page={page}`. Renders:
```html
<div class="game-embed-container" data-game-type="{gameType}">
  <iframe src="{fullGameUrl}" width="{width}" height="{height}" class="game-iframe" ...></iframe>
</div>
```

An inline `<script>` on the component listens for `window.message` events with `event.data === 'gameComplete'` and navigates to `/read/{chapter.id}/{page + 1}`.

Only rendered when `shouldShowGame(chapter, currentPage)` is `true`.

---

### `PageNarration`

**File:** `src/components/PageNarration.astro`

**Props:**
```ts
{ chapter: any; page: number }
```

Contains an internal `getNarrationContent(ch, p)` function that returns `{ hasNarration: boolean; narration: string }`. Chapter 1 pages 1–19 have hardcoded narration strings; all other pages default to `{ hasNarration: false, narration: '' }`.

When `hasNarration` is `true`, renders:
```html
<div class="mspa-narration">
  <p>{paragraph1}</p>
  <p>{paragraph2}</p>
  ...
</div>
```

Paragraphs are split on `'\n\n'`.

---

### `DialogueBox`

**File:** `src/components/DialogueBox.astro`

**Props:**
```ts
{ chapter: any; page: number }
```

Contains an internal `getDialogueContent(ch, p)` function that returns:
```ts
{ showDialog: boolean; dialogueLines: Array<{ person: string; handle: string; message: string }> }
```

Chapter 1 pages 10, 14, 15, 16, 17 have dialogue defined. All other pages return `{ showDialog: false, dialogueLines: [] }`.

When `showDialog` is `true`, renders:
```html
<div class="mspa-pester-toggle-wrap">
  <button id="btn-toggle-log" class="mspa-pester-toggle">Show Dialog</button>
</div>
<section id="pesterlog" class="pesterlog" hidden>
  <div class="pesterlog-content">
    <div class="line {person}">
      <span class="handle">{handle}</span>: <span class="msg">{message}</span>
    </div>
    ...
  </div>
</section>
```

---

### `NavigationCommand`

**File:** `src/components/NavigationCommand.astro`

**Props:**
```ts
{ chapter: any; currentPage: number }
```

Calls `getNextPage(chapter, currentPage)` and `getPageTitle(chapter, nextPage)`. Renders the forward navigation link only when a next page exists:
```html
<p class="mspa-command">
  <a id="cmd-next" href="/read/{chapter.id}/{nextPage}">> {nextTitle}</a>
</p>
```

Nothing is rendered on the last page of a chapter.

---

### `UtilityLinks`

**File:** `src/components/UtilityLinks.astro`

**Props:** none

Renders a fixed set of reader utility controls:
```html
<div class="mspa-utility">
  <div class="left">
    <a id="link-start" href="/read/1/1">Begin Anew</a>
    <span class="sep">|</span>
    <a id="link-back" href="#">Go Back</a>
  </div>
  <div class="right">
    <a id="link-save" href="#">Log Location</a>
    <span class="sep">|</span>
    <button id="link-auto" class="as-link" aria-pressed="false">Auto Log: OFF</button>
    <span class="sep">|</span>
    <a id="link-load" href="#">Go to Location</a>
    <span class="sep">|</span>
    <a id="link-delete" href="#">Remove Log</a>
  </div>
</div>
```

The `href="#"` links and the `aria-pressed` toggle are wired up by `public/js/reader.js`.

---

## Game vs image decision

In `[page].astro`:

```js
const showGame = shouldShowGame(chapter, currentPage);       // true if getGameConfig returns non-null
const gameConfig = showGame ? getGameConfig(chapter, currentPage) : null;
const nextImgSrc = !showGame && nextPage ? getImageSrc(nextPage) : null;  // skip preload for game pages
```

In the template:
```astro
{showGame && gameConfig ? (
  <GameEmbed gameType={gameConfig.gameType} seed={gameConfig.seed} width={gameConfig.width} height={gameConfig.height} chapter={chapter} page={currentPage} />
) : (
  <PageImage page={currentPage} title={pageTitle} />
)}
```

Currently the only game page is chapter 1, page 12 (the Switch game).

---

## How to add a new section to a page

1. Create a new `.astro` component in `src/components/` with a typed `Props` interface accepting at minimum `{ chapter: any; page: number }`.
2. Import it at the top of `src/pages/read/[id]/[page].astro`.
3. Add it inside the `<article id="reader-root">` block at the desired position in the render order.
4. Pass `chapter={chapter}` and `page={currentPage}` (and any other required props) to the component.
