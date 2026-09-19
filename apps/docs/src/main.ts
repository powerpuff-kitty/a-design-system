import '@a-design-system/components';
import '@a-design-system/css/minimal-base.css';
import '@a-design-system/css/minimal-density.css';
import '@a-design-system/css/minimal-workspace.css';
import '@a-design-system/css/minimal-command-palette.css';
import { rankCommandPaletteItems, type CommandPaletteItem } from '@a-design-system/core';
import { compileTokens } from '@a-design-system/tokens';
import minimalLight from '@a-design-system/tokens/themes/minimal-light.json';
import minimalDark from '@a-design-system/tokens/themes/minimal-dark.json';
import minimalHighContrast from '@a-design-system/tokens/themes/minimal-high-contrast.json';
import './styles.css';

type ThemeId = 'minimal-light' | 'minimal-dark' | 'minimal-high-contrast';
type DensityId = 'compact' | 'default' | 'comfortable';
type DocsCommand = CommandPaletteItem & Readonly<{
  group: 'Navigate' | 'Theme';
  shortcut?: string;
  run: () => void;
}>;

const themes = {
  'minimal-light': minimalLight,
  'minimal-dark': minimalDark,
  'minimal-high-contrast': minimalHighContrast,
} as const;

const select = document.querySelector<HTMLSelectElement>('#theme-select');
const densitySelect = document.querySelector<HTMLSelectElement>('#density-select');
const themeStyle = document.createElement('style');
themeStyle.id = 'ads-docs-theme';
document.head.append(themeStyle);

function applyTheme(id: ThemeId): void {
  themeStyle.textContent = compileTokens(themes[id]).css;
  document.documentElement.dataset.adsTheme = id;
  document.documentElement.style.colorScheme = id === 'minimal-dark' ? 'dark' : 'light';
  if (select) select.value = id;
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

function applyDensity(id: DensityId): void {
  document.documentElement.dataset.adsDensity = id;
  if (densitySelect) densitySelect.value = id;
  try { localStorage.setItem('ads.docs.density', id); } catch { /* Density preference is optional. */ }
}

function initialDensity(): DensityId {
  const query = new URLSearchParams(location.search).get('density');
  if (query === 'compact' || query === 'comfortable' || query === 'default') return query;
  try {
    const saved = localStorage.getItem('ads.docs.density');
    if (saved === 'compact' || saved === 'comfortable' || saved === 'default') return saved;
  } catch { /* Ignore unavailable storage. */ }
  return 'default';
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
const density = initialDensity();
if (densitySelect) {
  densitySelect.value = density;
  densitySelect.addEventListener('change', () => {
    const value = densitySelect.value;
    if (value === 'compact' || value === 'comfortable' || value === 'default') applyDensity(value);
  });
}
applyDensity(density);

const dialog = document.querySelector<HTMLDialogElement>('#command-palette');
const trigger = document.querySelector<HTMLButtonElement>('#command-trigger');
const search = document.querySelector<HTMLInputElement>('#command-search');
const results = document.querySelector<HTMLElement>('#command-results');
let activeIndex = 0;
let ranked: DocsCommand[] = [];
let opener: HTMLElement | null = null;

function reveal(id: string): void {
  document.querySelector(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const commands: readonly DocsCommand[] = [
  {
    id: 'components',
    label: 'Components',
    description: 'Open the current native Web Component examples.',
    keywords: ['controls', 'forms', 'button', 'input'],
    group: 'Navigate',
    run: () => reveal('#components'),
  },
  {
    id: 'workspace',
    label: 'Workspace',
    description: 'Open the Minimal canvas-first workspace recipe.',
    keywords: ['shell', 'rail', 'inspector', 'layout'],
    group: 'Navigate',
    run: () => reveal('#workspace'),
  },
  {
    id: 'tokens',
    label: 'Tokens',
    description: 'Open the DTCG reference token section.',
    keywords: ['dtcg', 'theme', 'variables'],
    group: 'Navigate',
    run: () => reveal('#tokens'),
  },
  {
    id: 'minimal-light',
    label: 'Theme · Minimal Light',
    description: 'Use the paper-light reference theme.',
    keywords: ['theme', 'light', 'paper'],
    group: 'Theme',
    run: () => applyTheme('minimal-light'),
  },
  {
    id: 'minimal-dark',
    label: 'Theme · Minimal Dark',
    description: 'Use the dark reference theme.',
    keywords: ['theme', 'dark'],
    group: 'Theme',
    run: () => applyTheme('minimal-dark'),
  },
  {
    id: 'minimal-high-contrast',
    label: 'Theme · High Contrast',
    description: 'Use the high-contrast reference theme.',
    keywords: ['theme', 'contrast', 'accessibility'],
    group: 'Theme',
    run: () => applyTheme('minimal-high-contrast'),
  },
];

function setActive(index: number): void {
  if (!ranked.length) {
    activeIndex = 0;
    return;
  }
  activeIndex = ((index % ranked.length) + ranked.length) % ranked.length;
  results?.querySelectorAll<HTMLButtonElement>('.ads-command-palette__item').forEach((button, buttonIndex) => {
    button.setAttribute('aria-selected', String(buttonIndex === activeIndex));
  });
}

function runCommand(command: DocsCommand): void {
  dialog?.close();
  command.run();
}

function renderCommands(query = ''): void {
  if (!results) return;
  ranked = rankCommandPaletteItems(commands, query).map((entry) => entry.item);
  activeIndex = 0;
  results.replaceChildren();

  if (!ranked.length) {
    const empty = document.createElement('p');
    empty.className = 'ads-command-palette__empty';
    empty.textContent = 'No matching commands.';
    results.append(empty);
    return;
  }

  let lastGroup = '';
  ranked.forEach((command, index) => {
    if (command.group !== lastGroup) {
      const group = document.createElement('div');
      group.className = 'ads-command-palette__group-label';
      group.textContent = command.group;
      results.append(group);
      lastGroup = command.group;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ads-command-palette__item';
    button.setAttribute('role', 'option');
    button.setAttribute('aria-selected', String(index === 0));
    button.disabled = Boolean(command.disabled);

    const main = document.createElement('span');
    main.className = 'ads-command-palette__item-main';
    const label = document.createElement('strong');
    label.textContent = command.label;
    main.append(label);
    if (command.description) {
      const description = document.createElement('span');
      description.className = 'ads-command-palette__item-description';
      description.textContent = command.description;
      main.append(description);
    }
    button.append(main);

    if (command.shortcut) {
      const shortcut = document.createElement('kbd');
      shortcut.className = 'ads-command-palette__shortcut';
      shortcut.textContent = command.shortcut;
      button.append(shortcut);
    }

    button.addEventListener('pointermove', () => setActive(index));
    button.addEventListener('focus', () => setActive(index));
    button.addEventListener('click', () => runCommand(command));
    results.append(button);
  });
}

function openPalette(): void {
  if (!dialog || !search || dialog.open) return;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
  search.value = '';
  renderCommands();
  dialog.showModal();
  queueMicrotask(() => search.focus());
}

trigger?.addEventListener('click', openPalette);
search?.addEventListener('input', () => renderCommands(search.value));
search?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    setActive(activeIndex + 1);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    setActive(activeIndex - 1);
    return;
  }
  if (event.key === 'Enter' && ranked[activeIndex]) {
    event.preventDefault();
    runCommand(ranked[activeIndex]);
  }
});
dialog?.addEventListener('close', () => {
  opener?.focus();
  opener = null;
});

window.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openPalette();
  }
});

renderCommands();
document.documentElement.dataset.adsReady = 'true';
