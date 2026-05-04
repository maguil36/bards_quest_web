# Centerpiece

The centerpiece is the main content area of each comic page — the large panel between the sprite columns. It is either a static image or an embedded game, determined at build time by `pageUtils.ts`.

---

## Decision logic (`src/utils/pageUtils.ts`)

```ts
export function shouldShowGame(chapter: any, page: number): boolean
```
Returns `true` if `getGameConfig(chapter, page) !== null`.

```ts
export function getGameConfig(chapter: any, page: number): GameConfig | null
```
1. Reads `chapter.id` (must be a `number`; returns `null` if missing or non-numeric).
2. Builds key `"{chapterId}-{page}"`.
3. Looks up the key in `gamePages`.
4. Returns the `GameConfig` if found, `null` otherwise.

The page layout calls `shouldShowGame` first. If true it renders `<GameEmbed>` with the config from `getGameConfig`. If false it renders `<PageImage>`.

---

## The `gamePages` record

```ts
const gamePages: Record<string, GameConfig> = {
  '1-12': {
    gameType: 'switch',
    seed: 42,
    width: 800,
    height: 600,
  },
  // additional entries added here
};
```

Key format: `"{chapterId}-{pageNumber}"` (e.g., `'1-12'` = chapter 1, page 12).

### `GameConfig` interface

```ts
export interface GameConfig {
  gameType: string;   // required — must match a key in GameEmbed's gameFiles map
  seed?: number;      // optional random seed passed as URL param
  width?: number;     // optional iframe width (default: 650)
  height?: number;    // optional iframe height (default: 450)
}
```

---

## Centerpiece content types

### Still image — `PageImage.astro`

`src/components/PageImage.astro`

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `page` | `number` | The page number |
| `title` | `string` | Alt text for the image |

**Rendered HTML:**

```html
<div class="frame mt-05" style="text-align:center">
  <img src="{imgSrc}" alt="{title}" class="page" loading="eager" />
</div>
```

`imgSrc` is computed by `getImageSrc(page)`:

```ts
export function getImageSrc(page: number): string {
  const idx = (((page - 1) % 3) + 3) % 3 + 1;
  return `/placeholder/page-${idx}.svg`;
}
```

This cycles through `/placeholder/page-1.svg`, `/placeholder/page-2.svg`, `/placeholder/page-3.svg`. Replace this function when real page assets exist.

**When used:** Default for all pages where `shouldShowGame` returns `false`.

---

### Game embed — `GameEmbed.astro`

`src/components/GameEmbed.astro`

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gameType` | `string` | required | Must match a key in the internal `gameFiles` map |
| `seed` | `number` | `Math.floor(Math.random() * 1000000)` | Passed as `?seed=` URL param |
| `width` | `number` | `650` | iframe width in pixels |
| `height` | `number` | `450` | iframe height in pixels |
| `chapter` | `any` | `undefined` | Passed as `?chapter=` (uses `chapter.id`) |
| `page` | `number` | `undefined` | Passed as `?page=` |

**`gameFiles` map (internal):**

```ts
const gameFiles: Record<string, string> = {
  'switch': '/games/switch/index.html',
};
```

Throws `Error: Unknown game type: {gameType}` if the key is not present.

**iframe src pattern:**

```
/games/{gameType}/index.html?seed={seed}[&chapter={chapter.id}][&page={page}]
```

Example: `/games/switch/index.html?seed=42&chapter=1&page=12`

**Rendered HTML:**

```html
<div class="game-embed-container" data-game-type="{gameType}">
  <iframe
    src="{fullGameUrl}"
    width="{width}"
    height="{height}"
    class="game-iframe"
    title="{gameType} game"
    loading="lazy"
    style="border: none;"
  ></iframe>
</div>
```

**Game completion handler:**

An inline script listens for `window.message` events with `event.data === 'gameComplete'` and navigates to `/read/{currentChapter}/{nextPage}`.

---

### Planned content types (not yet implemented)

These are noted in the codebase as future possibilities:

- **Alternating images** — a sequence of images cycling on user interaction.
- **Image + music** — a still image with an audio player.
- **Video** — an embedded video player.

No component exists for these types yet.

---

## How to assign a game to a specific page

1. Open `src/utils/pageUtils.ts`.
2. Add an entry to `gamePages` inside `getGameConfig`:

```ts
'2-5': {
  gameType: 'switch',
  seed: 99,
  width: 800,
  height: 600,
},
```

3. The page route will automatically render `<GameEmbed>` for that chapter/page combination.

---

## How to add an image to a page

By default every page without a `gamePages` entry shows an image from `getImageSrc`. To use a real asset:

1. Place the image file in `public/` (e.g., `public/images/pages/chapter1/page5.png`).
2. Update `getImageSrc(page)` in `src/utils/pageUtils.ts` to return the correct path for that page number, or refactor the function to accept `chapter` and return a path based on both.

---

## How to wire in a new game type

1. Create the game as a standalone HTML file in `public/games/{name}/index.html`.
2. Add an entry to the `gameFiles` map in `src/components/GameEmbed.astro`:

```ts
'my-game': '/games/my-game/index.html',
```

3. Add a `GameConfig` entry to `gamePages` in `src/utils/pageUtils.ts`:

```ts
'1-20': {
  gameType: 'my-game',
  seed: 7,
  width: 640,
  height: 480,
},
```

4. Inside the game HTML, post `window.parent.postMessage('gameComplete', '*')` when the player finishes, to trigger automatic navigation to the next page.
