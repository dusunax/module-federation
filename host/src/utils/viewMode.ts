export type ViewMode = 'list' | 'wheel';

const VIEW_MODE_KEY = 'emotion-view-mode';

export function getSavedViewMode(): ViewMode {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === 'list' || saved === 'wheel') return saved;
  } catch {
    /* ignore */
  }
  return 'wheel';
}
