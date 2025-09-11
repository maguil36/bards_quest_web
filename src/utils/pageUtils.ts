// Utility functions for comic page content
// Centralized logic to avoid duplication between components

export function getPageTitle(chapter: any, page: number): string {
  // Special titles for Bard's Quest first chapter
  if (chapter.id === 1) {
    if (page === 1) return "Bard's Quest";
    if (page === 2) return "Enter Name";
    if (page === 3) return "Find the Boy";
    if (page === 4) return "Inspect Futher";
    if (page === 5) return "Try to Get it to Work Again";
    if (page === 6) return "Its Going to Crash Again Isn't It...";
    if (page === 7) return "Be Anyone Else";
    if (page === 8) return "Inspect New Character"
    
    // Add more special titles as needed
  }
  
  // Default titles for other pages
  const verbs = ['Examine', 'Deploy', 'Converse', 'Investigate', 'Acquire', 'Combine', 'Confront', 'Consult'];
  const subjects = ['Widget', 'Terminal', 'Memo', 'Artifact', 'Instrument', 'Contraption', 'Console', 'Cache'];
  const v = verbs[(chapter.id + page) % verbs.length];
  const s = subjects[(chapter.bookId + page) % subjects.length];
  return `${v} ${s}.`;
}

export function getImageSrc(page: number): string {
  // Generate image source based on page number (cycling through placeholder images)
  return `/placeholder/page-${((page - 1) % 3) + 1}.svg`;
}

export function getNextPage(chapter: any, currentPage: number): number | null {
  return currentPage < chapter.totalPages ? currentPage + 1 : null;
}