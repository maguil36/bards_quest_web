# Comic Structure

How content is organized and how routes are generated.

---

## Data Model: Book → Chapter → Page

Source: `src/content.js`

### Book

```ts
{ id: number, title: string, chapters: Chapter[] }
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | 1-based index (1, 2, 3) |
| `title` | `string` | e.g. `"Book 1"` |
| `chapters` | `Chapter[]` | All chapters belonging to this book |

### Chapter

```ts
{
  id: number,          // Global chapter ID, 1..21 across all books
  bookId: number,      // Which book this chapter belongs to
  chapterInBook: number, // 1-based chapter position within the book
  title: string,
  totalPages: number,
  cover: string,       // Path to cover image
  waypoints: Array<{ label: string, page: number, thumb: string }>,
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Globally unique. Computed as `(bookIdx * 7) + chapterInBook` |
| `bookId` | `number` | Parent book ID |
| `chapterInBook` | `number` | 1-based position within its book |
| `title` | `string` | Chapter title |
| `totalPages` | `number` | How many pages the chapter has |
| `cover` | `string` | Cover image path |
| `waypoints` | `Array<{label, page, thumb}>` | Navigation bookmarks within the chapter |

### Current shape (placeholder)

The exported `books` array is generated from `Array.from({ length: 3 })` (3 books) × `Array.from({ length: 7 })` (7 chapters per book) = 21 chapters total. Each chapter has `totalPages: 20`. These are placeholder values intended to be replaced with real metadata.

---

## Exported symbols

```js
// src/content.js
export const books: Book[]       // All 3 books with nested chapters
export const chapters: Chapter[] // Flat array of all 21 chapters (books.flatMap)
export function getChapter(id: string | number): Chapter
```

### `getChapter(id)`

```js
getChapter(id: string | number): Chapter
```

- Converts `id` to a number with `Number(id)`.
- Searches `chapters` for `c.id === n`.
- Throws `Error("Chapter not found: ${id}")` if no match is found.
- Used by `[page].astro` to look up the current chapter; on failure the route redirects to `/map`.

---

## Page utilities

Source: `src/utils/pageUtils.ts`

### `getPageTitle(chapter, page)`

```ts
getPageTitle(chapter: any, page: number): string
```

Returns a human-readable command string for the page.

- Chapter 1 pages 1–18 have hardcoded titles (e.g. page 1 → `"Bard's Quest"`, page 12 → `"Switch Characters"`).
- All other pages generate a title by combining a verb from a fixed list (`Examine`, `Deploy`, `Converse`, `Investigate`, `Acquire`, `Combine`, `Confront`, `Consult`) and a subject from a fixed list (`Widget`, `Terminal`, `Memo`, `Artifact`, `Instrument`, `Contraption`, `Console`, `Cache`). The indices are `(chapterId + page) % 8` and `(bookId + page) % 8`.

### `getImageSrc(page)`

```ts
getImageSrc(page: number): string
```

Returns a placeholder image path that cycles through three SVGs:

```
/placeholder/page-1.svg   (pages 1, 4, 7, ...)
/placeholder/page-2.svg   (pages 2, 5, 8, ...)
/placeholder/page-3.svg   (pages 3, 6, 9, ...)
```

Uses safe modulo: `(((page - 1) % 3) + 3) % 3 + 1`.

### `getNextPage(chapter, page)`

```ts
getNextPage(chapter: any, currentPage: number): number | null
```

Returns `currentPage + 1` if `currentPage < chapter.totalPages`, otherwise `null`. Returns `null` if `chapter.totalPages` is not a number.

### `GameConfig` interface

```ts
export interface GameConfig {
  gameType: string;
  seed?: number;
  width?: number;
  height?: number;
  // Additional optional settings can be added here
}
```

### `getGameConfig(chapter, page)`

```ts
getGameConfig(chapter: any, page: number): GameConfig | null
```

Looks up a `GameConfig` from an internal `Record<string, GameConfig>` keyed by `"${chapterId}-${page}"`.

Currently registered entry:

| Key | `gameType` | `seed` | `width` | `height` |
|-----|-----------|--------|---------|---------|
| `"1-12"` | `"switch"` | `42` | `800` | `600` |

Returns `null` if no entry matches.

### `shouldShowGame(chapter, page)`

```ts
shouldShowGame(chapter: any, page: number): boolean
```

Returns `true` when `getGameConfig(chapter, page) !== null`. Used in `[page].astro` to branch between rendering `<GameEmbed>` and `<PageImage>`.

---

## Route generation: `getStaticPaths()`

Source: `src/pages/read/[id]/[page].astro`

```js
export function getStaticPaths() {
  const paths = [];
  for (const c of chapters) {
    for (let p = 1; p <= c.totalPages; p++) {
      paths.push({ params: { id: String(c.id), page: String(p) } });
    }
  }
  return paths;
}
```

Iterates every chapter and every page number within it. Produces one route per page: `/read/[id]/[page]`. Both params are serialized as strings. With 21 chapters × 20 pages the current placeholder setup generates 420 routes.

---

## How to make content changes

### Add a new page to an existing chapter

1. Open `src/content.js`.
2. Find the chapter object (or adjust `totalPages` in the generator).
3. Increment `totalPages` for that chapter.
4. Add a title entry in `getPageTitle()` in `src/utils/pageUtils.ts` if the page needs a specific title.
5. Add a narration block in `PageNarration.astro` if the page needs narration text.
6. If the page hosts a game, add an entry to the `gamePages` map in `getGameConfig()`.

### Add a new chapter

1. Open `src/content.js`.
2. Add a new `Chapter` object to the appropriate book's `chapters` array (or increase the generated chapter count).
3. Give it a unique `id`, correct `bookId`, `chapterInBook`, `title`, `totalPages`, `cover`, and `waypoints`.
4. The `chapters` flat array is `books.flatMap(b => b.chapters)`, so it updates automatically.
5. Routes for all pages in the new chapter are generated automatically by `getStaticPaths()`.

### Add a new book

1. Open `src/content.js`.
2. Add a new `Book` object to the `books` array with a unique `id`, `title`, and a `chapters` array containing its `Chapter` objects.
3. All chapters and their pages are picked up automatically.
