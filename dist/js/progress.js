document.addEventListener('DOMContentLoaded', () => {
  const key = 'progress:series-1';
  const link = document.getElementById('resume-link');
  const empty = document.getElementById('resume-empty');
  if (!link || !empty) return;
  try {
    const p = JSON.parse(localStorage.getItem(key) || 'null');
    if (p && p.chapter && p.page) {
      link.href = `/read/${p.chapter}/${p.page}`;
      link.style.display = 'inline-flex';
      empty.style.display = 'none';
    }
  } catch {}
});
