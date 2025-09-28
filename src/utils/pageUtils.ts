/**
 * Utility functions for comic page content
 * Centralized logic to avoid duplication between components
 */

export function getPageTitle(chapter: any, page: number): string {
  // Special titles for Bard's Quest first chapter
  if (chapter?.id === 1) {
    if (page === 1) return "Bard's Quest";
    if (page === 2) return "Enter Name";
    if (page === 3) return "Find the Boy";
    if (page === 4) return "Inspect Further";
    if (page === 5) return "Try to Get It to Work Again";
    if (page === 6) return "It's Going to Crash Again, Isn't It...";
    if (page === 7) return "Be Anyone Else";
    if (page === 8) return "Inspect New Character";
    if (page === 12) return "Switch Characters";

    // Add more special titles as needed
  }

  // Default titles for other pages
  const verbs = [
    'Examine',
    'Deploy',
    'Converse',
    'Investigate',
    'Acquire',
    'Combine',
    'Confront',
    'Consult',
  ];
  const subjects = [
    'Widget',
    'Terminal',
    'Memo',
    'Artifact',
    'Instrument',
    'Contraption',
    'Console',
    'Cache',
  ];

  // Use safe numeric values in case chapter fields are missing or unexpected
  const chapterId = typeof chapter?.id === 'number' ? chapter.id : 0;
  const bookId = typeof chapter?.bookId === 'number' ? chapter.bookId : 0;

  const v = verbs[Math.abs(chapterId + page) % verbs.length];
  const s = subjects[Math.abs(bookId + page) % subjects.length];
  return `${v} ${s}.`;
}

export function getImageSrc(page: number): string {
  // Generate image source based on page number (cycling through placeholder images)
  const idx = (((page - 1) % 3) + 3) % 3 + 1; // safe modulo for negative or zero pages
  return `/placeholder/page-${idx}.svg`;
}

export function getNextPage(chapter: any, currentPage: number): number | null {
  const total = typeof chapter?.totalPages === 'number' ? chapter.totalPages : null;
  if (total === null) return null;
  return currentPage < total ? currentPage + 1 : null;
}

// Game configuration for specific pages
export interface GameConfig {
  gameType: string;
  seed?: number;
  width?: number;
  height?: number;
  // Additional optional settings can be added here
}

export function getGameConfig(chapter: any, page: number): GameConfig | null {
  // Map of "chapterId-page" => GameConfig
  const gamePages: Record<string, GameConfig> = {
    // Chapter 1, Page 12 - Switch Character Game
    '1-12': {
      gameType: 'switch',
      seed: 42, // Fixed seed for consistent experience
      width: 800,
      height: 600,
    },

    // Example additional game entry (commented out)
    // '1-15': {
    //   gameType: 'puzzle-game',
    //   seed: 123,
    //   width: 600,
    //   height: 400,
    // },
  };

  const chapterId = typeof chapter?.id === 'number' ? chapter.id : null;
  if (chapterId === null) return null;

  const key = `${chapterId}-${page}`;
  return gamePages[key] ?? null;
}

export function shouldShowGame(chapter: any, page: number): boolean {
  return getGameConfig(chapter, page) !== null;
}