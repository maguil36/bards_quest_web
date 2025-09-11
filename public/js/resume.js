document.addEventListener('DOMContentLoaded', () => {
  try {
    const p = JSON.parse(localStorage.getItem('progress:series-1') || 'null');
    if (p && p.chapter && p.page) {
      location.replace(`/read/${p.chapter}/${p.page}`);
    } else {
      location.replace('/read/1/1');
    }
  } catch {
    location.replace('/map');
  }
});
