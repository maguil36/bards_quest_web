// Content model structured into Books -> Chapters -> Waypoints
// Replace with your real metadata/assets as you add content.

/**
 * @typedef {{
 *   id: number,
 *   bookId: number,
 *   chapterInBook: number,
 *   title: string,
 *   totalPages: number, // using as number of waypoints for now
 *   cover: string,
 * }} Chapter
 */

/**
 * @typedef {{ id: number, title: string, chapters: Chapter[] }} Book
 */

/** @type {Book[]} */
export const books = Array.from({ length: 3 }).map((_, bIdx) => {
  const bookId = bIdx + 1;
  const chapters = Array.from({ length: 7 }).map((__, cIdx) => {
    const chapterInBook = cIdx + 1;
    const globalChapterId = bIdx * 7 + chapterInBook; // 1..21
    const totalPages = 20; // Example: 20 pages per chapter
    const mid = Math.ceil(totalPages / 2);
    return {
      id: globalChapterId,
      bookId,
      chapterInBook,
      title: `Placeholder`,
      totalPages,
      cover: `/placeholder/thumb-${(globalChapterId % 3) + 1}.svg`,
      waypoints: [
        { label: 'Start', page: 1, thumb: `/placeholder/thumb-1.svg` },
        { label: 'Middle', page: mid, thumb: `/placeholder/thumb-2.svg` },
        { label: 'End', page: totalPages, thumb: `/placeholder/thumb-3.svg` },
      ],
    };
  });
  return { id: bookId, title: `Book ${bookId}`, chapters };
});

/** @type {Chapter[]} */
export const chapters = books.flatMap((b) => b.chapters);

/**
 * @param {string | number} id
 * @returns {Chapter}
 */
export function getChapter(id) {
  const n = Number(id);
  const found = chapters.find((c) => c.id === n);
  if (!found) {
    throw new Error(`Chapter not found: ${id}`);
  }
  return found;
}
