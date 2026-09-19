import '@a-design-system/components';
import '@a-design-system/css/minimal-workspace.css';
import { compileTokens } from '@a-design-system/tokens';
import minimalLight from '@a-design-system/tokens/themes/minimal-light.json';
import minimalDark from '@a-design-system/tokens/themes/minimal-dark.json';
import minimalHighContrast from '@a-design-system/tokens/themes/minimal-high-contrast.json';
import './styles.css';

type ThemeId = 'minimal-light' | 'minimal-dark' | 'minimal-high-contrast';

const themes = {
  'minimal-light': minimalLight,
  'minimal-dark': minimalDark,
  'minimal-high-contrast': minimalHighContrast,
} as const;

const select = document.querySelector<HTMLSelectElement>('#theme-select');
const themeStyle = document.createElement('style');
themeStyle.id = 'ads-docs-theme';
document.head.append(themeStyle);

function applyTheme(id: ThemeId): void {
  themeStyle.textContent = compileTokens(themes[id]).css;
  document.documentElement.dataset.adsTheme = id;
  document.documentElement.style.colorScheme = id === 'minimal-dark' ? 'dark' : 'light';
  try { localStorage.setItem('ads.docs.theme', id); } catch { /* Theme preference is optional. */ }
}

function initialTheme(): ThemeId {
  const query = new URLSearchParams(location.search).get('theme');
  if (query && Object.hasOwn(themes, query)) return query as ThemeId;
  try {
    const saved = localStorage.getItem('ads.docs.theme');
    if (saved && Object.hasOwn(themes, saved)) return saved as ThemeId;
  } catch { /* Ignore unavailable storage. */ }
  return 'minimal-light';
}

const initial = initialTheme();
if (select) {
  select.value = initial;
  select.addEventListener('change', () => {
    const value = select.value;
    if (Object.hasOwn(themes, value)) applyTheme(value as ThemeId);
  });
}
applyTheme(initial);
document.documentElement.dataset.adsReady = 'true';
