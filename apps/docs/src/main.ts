import '@a-design-system/css/minimal-base.css';
import '@a-design-system/css/minimal-density.css';
import '@a-design-system/tokens/themes/minimal.css';
import '@a-design-system/css/minimal-workspace.css';
import { compileTokens } from '@a-design-system/tokens';
import minimalLight from '@a-design-system/tokens/themes/minimal-light.json';
import minimalDark from '@a-design-system/tokens/themes/minimal-dark.json';
import minimalHighContrast from '@a-design-system/tokens/themes/minimal-high-contrast.json';
import { catalog, componentEntries, recipeEntries, type CatalogEntry } from './catalog.js';
import './styles.css';

function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  if (!result) throw new Error(`Missing documentation element: ${selector}`);
  return result;
}
const themes = { 'minimal-light': minimalLight, 'minimal-dark': minimalDark, 'minimal-high-contrast': minimalHighContrast } as const;
type ThemeId = keyof typeof themes;
type DensityId = 'compact' | 'default' | 'comfortable';
const densities: DensityId[] = ['compact', 'default', 'comfortable'];
const themeSelect = element<HTMLSelectElement>('#theme-select');
const densitySelect = element<HTMLSelectElement>('#density-select');
const preview = element('#preview-content');
const stage = element('#preview-stage');
const themeStyle = document.createElement('style');
themeStyle.id = 'ads-docs-theme';
document.head.append(themeStyle);
let current: CatalogEntry;

function saved(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function store(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ }
}
function applyTheme(id: ThemeId): void {
  themeStyle.textContent = `@layer ads.tokens { ${compileTokens(themes[id]).css} }`;
  document.documentElement.dataset.adsTheme = id;
  document.documentElement.style.colorScheme = id === 'minimal-dark' ? 'dark' : 'light';
  themeSelect.value = id;
  store('ads.docs.theme', id);
  requestAnimationFrame(renderResolvedTokens);
}
function applyDensity(id: DensityId): void {
  document.documentElement.dataset.adsDensity = id;
  densitySelect.value = id;
  store('ads.docs.density', id);
  requestAnimationFrame(renderResolvedTokens);
}
const parameters = new URLSearchParams(location.search);
const preferredTheme = parameters.get('theme') ?? saved('ads.docs.theme') ?? 'minimal-light';
applyTheme(Object.hasOwn(themes, preferredTheme) ? preferredTheme as ThemeId : 'minimal-light');
const preferredDensity = parameters.get('density') ?? saved('ads.docs.density') ?? 'default';
applyDensity(densities.includes(preferredDensity as DensityId) ? preferredDensity as DensityId : 'default');
themeSelect.addEventListener('change', () => {
  if (Object.hasOwn(themes, themeSelect.value)) applyTheme(themeSelect.value as ThemeId);
});
densitySelect.addEventListener('change', () => {
  if (densities.includes(densitySelect.value as DensityId)) applyDensity(densitySelect.value as DensityId);
});
element<HTMLSelectElement>('#direction-select').addEventListener('change', (event) => {
  stage.dir = (event.currentTarget as HTMLSelectElement).value === 'rtl' ? 'rtl' : 'ltr';
  renderResolvedTokens();
});

function renderNavigation(): void {
  const query = element<HTMLInputElement>('#library-search').value.trim().toLowerCase();
  const filtered = componentEntries.filter((entry) => `${entry.title} ${entry.id}`.toLowerCase().includes(query));
  for (const [selector, entries] of [['#component-list', filtered], ['#recipe-list', recipeEntries]] as const) {
    const target = element(selector);
    target.replaceChildren();
    for (const entry of entries) {
      const link = document.createElement('a');
      link.href = `#${entry.id}`;
      link.textContent = entry.title;
      if (current?.id === entry.id) link.setAttribute('aria-current', 'page');
      link.addEventListener('click', (event) => {
        event.preventDefault();
        selectEntry(entry);
        history.pushState(null, '', `#${entry.id}`);
        if (panelDialog.open) panelDialog.close();
      });
      target.append(link);
    }
  }
  element('#component-count').textContent = String(componentEntries.length);
  element('#library-empty').hidden = filtered.length !== 0;
}
element('#library-search').addEventListener('input', renderNavigation);

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
function selectTab(tab: HTMLButtonElement, focus = false): void {
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    element(`#${candidate.getAttribute('aria-controls')}`).hidden = !selected;
  }
  if (focus) tab.focus();
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    const target = tabs[next];
    if (target) selectTab(target, true);
  });
}

function apiSection(title: string, rows: readonly { name: string; detail: string }[]): void {
  const root = element('#api-content');
  const heading = document.createElement('h2');
  heading.textContent = title;
  root.append(heading);
  if (!rows.length) {
    const message = document.createElement('p');
    message.textContent = 'None declared in this contract.';
    root.append(message);
    return;
  }
  const table = document.createElement('table');
  table.className = 'api-table';
  table.setAttribute('aria-label', title);
  const header = table.createTHead().insertRow();
  for (const text of ['Name', 'Contract']) {
    const cell = document.createElement('th');
    cell.scope = 'col'; cell.textContent = text; header.append(cell);
  }
  const body = table.createTBody();
  for (const row of rows) {
    const tr = body.insertRow();
    const name = document.createElement('th');
    name.scope = 'row'; name.textContent = row.name || '(default slot)';
    tr.append(name);
    tr.insertCell().textContent = row.detail;
  }
  root.append(table);
}
function renderApi(): void {
  const target = element('#api-content');
  target.replaceChildren();
  const contract = current.contract;
  if (!contract) { target.textContent = 'This is layout markup, not a separate custom element. Inspect the contracts of the components used in its source.'; return; }
  apiSection('Attributes', (contract.attributes ?? []).map((item) => ({ name: item.name, detail: `${item.type}${item.default === undefined ? '' : ` · default: ${item.default}`} ${item.description ?? ''}` })));
  apiSection('Properties', (contract.properties ?? []).map((item) => ({ name: item.name, detail: `${item.type}${item.readonly ? ' · readonly' : ''} ${item.description ?? ''}` })));
  apiSection('Methods', (contract.methods ?? []).map((item) => ({ name: item.name, detail: `${item.signature} ${item.description ?? ''}` })));
  apiSection('Events', (contract.events ?? []).map((item) => ({ name: item.name, detail: `${item.detail ?? 'Event'} · bubbles: ${item.bubbles} · composed: ${item.composed} ${item.description ?? ''}` })));
  apiSection('Slots', (contract.slots ?? []).map((item) => ({ name: item.name, detail: item.description ?? '' })));
  apiSection('CSS parts', (contract.parts ?? []).map((item) => ({ name: `::part(${item.name})`, detail: item.description ?? '' })));
  apiSection('CSS custom properties', (contract.cssCustomProperties ?? []).map((item) => ({ name: item.name, detail: `${item.default ?? 'No declared fallback'} ${item.description ?? ''}` })));
  apiSection('States', (contract.states ?? []).map((item) => ({ name: `:state(${item.name})`, detail: item.description ?? '' })));
}
function previewElement(): HTMLElement | null {
  return current?.contract ? preview.querySelector<HTMLElement>(current.contract.tagName) : null;
}
function renderInspector(): void {
  const tokenControls = element('#token-controls');
  const stateControls = element('#state-controls');
  tokenControls.replaceChildren(); stateControls.replaceChildren();
  const control = previewElement();
  if (!control || !current.contract) { tokenControls.textContent = 'Select a component to edit its declared tokens. Layout starters inherit the selected theme.'; return; }
  for (const attribute of current.contract.attributes ?? []) {
    if (attribute.type !== 'boolean' || !['disabled', 'required', 'checked', 'loading'].includes(attribute.name)) continue;
    const label = document.createElement('label');
    label.className = 'state-control';
    const input = document.createElement('input');
    input.type = 'checkbox'; input.checked = control.hasAttribute(attribute.name);
    input.addEventListener('change', () => control.toggleAttribute(attribute.name, input.checked));
    label.append(input, document.createTextNode(attribute.name));
    stateControls.append(label);
  }
  const tokens = current.contract.cssCustomProperties ?? [];
  if (!tokens.length) tokenControls.textContent = 'No component-local tokens declared. Use the theme and documented CSS parts.';
  for (const token of tokens) {
    const label = document.createElement('label'); label.className = 'token-control';
    const name = document.createElement('span'); name.textContent = token.name;
    const input = document.createElement('input');
    input.type = 'text'; input.placeholder = token.default ?? 'Inherited / fallback';
    input.setAttribute('aria-label', token.name);
    input.addEventListener('change', () => {
      const value = input.value.trim();
      // Set one allowlisted property, never execute or interpolate user-authored CSS rules.
      const unsafe = /[;{}<>@]/.test(value) || /(?:url|image-set|expression)\s*\(/i.test(value);
      input.setCustomValidity(unsafe ? 'Use a CSS value without rules, URLs, or external resources.' : '');
      input.setAttribute('aria-invalid', String(unsafe));
      if (unsafe) { input.reportValidity(); return; }
      if (value) control.style.setProperty(token.name, value);
      else control.style.removeProperty(token.name);
      renderResolvedTokens();
    });
    label.append(name, input); tokenControls.append(label);
  }
}
function renderResolvedTokens(): void {
  const target = element('#resolved-tokens'); target.replaceChildren();
  const computed = getComputedStyle(stage);
  for (const name of ['--ads-color-surface-page', '--ads-color-surface-default', '--ads-color-text-default', '--ads-color-line-control', '--ads-color-focus-ring', '--ads-radius-control']) {
    const row = document.createElement('div');
    const term = document.createElement('dt'); term.textContent = name;
    const value = document.createElement('dd'); value.textContent = computed.getPropertyValue(name).trim() || 'Not set';
    row.append(term, value); target.append(row);
  }
  element('#preview-mode').textContent = `${themeSelect.selectedOptions[0]?.textContent ?? ''} · ${densitySelect.value} · ${stage.dir || 'ltr'}`;
  const control = previewElement();
  const overrides = (current?.contract?.cssCustomProperties ?? []).flatMap((token) => {
    const value = control?.style.getPropertyValue(token.name).trim();
    return value ? [`  ${token.name}: ${value};`] : [];
  });
  element('#override-code').textContent = overrides.length ? `${current.id} {\n${overrides.join('\n')}\n}` : '/* No local overrides. The selected theme supplies the defaults. */';
}
function selectEntry(entry: CatalogEntry): void {
  current = entry;
  element('#component-title').textContent = entry.title;
  element('#component-description').textContent = entry.description;
  element('#component-meta').textContent = `${entry.contract ? entry.id : 'Layout starter'} / ${entry.status}`;
  document.title = `${entry.title} — A Design System`;
  // All markup comes from the first-party catalogue; user input is never inserted as HTML.
  preview.innerHTML = entry.markup;
  for (const form of preview.querySelectorAll('form')) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      element('#preview-events').textContent = 'Local form submission observed. Nothing was saved or sent to a server.';
    });
  }
  element('#source-code').textContent = `<script type="module">\n  import '@a-design-system/components';\n  import '@a-design-system/tokens/themes/minimal.css';\n  import '@a-design-system/css/minimal-density.css';\n${entry.id === 'layout-workspace' ? "  import '@a-design-system/css/minimal-workspace.css';\n" : ''}</script>\n\n${entry.markup}`;
  element('#usage-note').textContent = entry.contract ? 'Use this in a bundler-based project with the ADS packages installed. API status is experimental.' : 'Markup starter only. Add your own application behavior, responsive refinements, and persistence. This is not a CLI-installed application template.';
  element('#preview-events').textContent = 'Interact with the preview to inspect events.';
  element('#copy-status').textContent = '';
  renderApi(); renderInspector(); renderNavigation();
  if (tabs[0]) selectTab(tabs[0]);
  requestAnimationFrame(renderResolvedTokens);
}
for (const name of ['input', 'change']) preview.addEventListener(name, (event) => {
  element('#preview-events').textContent = `${event.type} event · ${event.target instanceof Element ? event.target.localName : 'preview'}`;
});
element('#reset-overrides').addEventListener('click', () => selectEntry(current));
element('#copy-source').addEventListener('click', () => {
  void (async () => {
    try { await navigator.clipboard.writeText(element('#source-code').textContent ?? ''); element('#copy-status').textContent = 'Source copied.'; }
    catch { element('#copy-status').textContent = 'Clipboard is unavailable. Select the source above and copy it manually.'; }
  })();
});

// One native modal sheet owns either panel on small screens; moving, not cloning, preserves IDs and state.
const mobile = matchMedia('(max-width: 800px)');
const panelDialog = element<HTMLDialogElement>('#panel-sheet');
let movedPanel: HTMLElement | null = null;
let panelMarker: Comment | null = null;
let panelOpener: HTMLElement | null = null;
let restoreHidden: HTMLElement['hidden'] = false;
function openPanel(id: 'navigation' | 'inspector', opener: HTMLElement): void {
  if (panelDialog.open) return;
  movedPanel = element(`#${id}`); panelMarker = document.createComment('panel position');
  movedPanel.before(panelMarker);
  restoreHidden = movedPanel.hidden; movedPanel.hidden = false;
  element('#panel-body').append(movedPanel);
  panelOpener = opener;
  panelDialog.setAttribute('aria-label', id === 'navigation' ? 'Documentation library' : 'Preview customization');
  opener.setAttribute('aria-expanded', 'true');
  panelDialog.showModal();
}
panelDialog.addEventListener('close', () => {
  if (movedPanel && panelMarker) { panelMarker.replaceWith(movedPanel); movedPanel.hidden = restoreHidden; }
  movedPanel = null; panelMarker = null;
  panelOpener?.setAttribute('aria-expanded', 'false'); panelOpener?.focus(); panelOpener = null;
});
element('#panel-close').addEventListener('click', () => panelDialog.close());
element('#navigation-toggle').addEventListener('click', () => openPanel('navigation', element('#navigation-toggle')));
element('#inspector-toggle').addEventListener('click', () => {
  const button = element('#inspector-toggle');
  if (mobile.matches) openPanel('inspector', button);
  else {
    const inspector = element('#inspector'); inspector.hidden = !inspector.hidden;
    element('.docs-layout').toggleAttribute('data-inspector-hidden', inspector.hidden);
    button.setAttribute('aria-expanded', String(!inspector.hidden));
  }
});
function syncPanelControls(): void {
  if (panelDialog.open) panelDialog.close();
  const button = element('#inspector-toggle');
  button.setAttribute('aria-controls', mobile.matches ? 'panel-sheet' : 'inspector');
  button.setAttribute('aria-expanded', String(!mobile.matches && !element('#inspector').hidden));
  if (mobile.matches) button.setAttribute('aria-haspopup', 'dialog');
  else button.removeAttribute('aria-haspopup');
}
mobile.addEventListener('change', syncPanelControls);
syncPanelControls();

interface Command { id: string; label: string; run: () => void; }
const commands: Command[] = [
  ...catalog.map((entry) => ({ id: entry.id, label: `${entry.contract ? 'Component' : 'Layout'} · ${entry.title}`, run: () => { selectEntry(entry); history.pushState(null, '', `#${entry.id}`); element('#content').focus(); } })),
  ...Object.keys(themes).map((id) => ({ id, label: `Theme · ${id.replaceAll('-', ' ')}`, run: () => applyTheme(id as ThemeId) })),
];
const searchDialog = element<HTMLDialogElement>('#command-palette');
const search = element<HTMLInputElement>('#command-search');
const results = element('#command-results');
let matches: Command[] = [];
let active = 0;
let searchOpener: HTMLElement | null = null;
let afterClose: (() => void) | null = null;
function activate(index: number): void {
  active = matches.length ? (index + matches.length) % matches.length : 0;
  results.querySelectorAll<HTMLElement>('[role="option"]').forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
  if (matches.length) { search.setAttribute('aria-activedescendant', `command-${active}`); element(`#command-${active}`).scrollIntoView({ block: 'nearest' }); }
  else search.removeAttribute('aria-activedescendant');
}
function runActive(): void {
  const command = matches[active];
  if (command) { afterClose = command.run; searchDialog.close(); }
}
function renderCommands(): void {
  const query = search.value.trim().toLowerCase();
  matches = commands.filter((command) => `${command.label} ${command.id}`.toLowerCase().includes(query));
  results.replaceChildren();
  matches.forEach((command, index) => {
    const option = document.createElement('div');
    option.id = `command-${index}`; option.setAttribute('role', 'option'); option.textContent = command.label;
    option.addEventListener('pointermove', () => activate(index));
    option.addEventListener('click', () => { activate(index); runActive(); });
    results.append(option);
  });
  element('#command-empty').hidden = matches.length > 0;
  activate(0);
}
function openSearch(): void {
  if (searchDialog.open || panelDialog.open) return;
  searchOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  search.value = ''; renderCommands(); searchDialog.showModal(); search.focus();
}
element('#command-trigger').addEventListener('click', openSearch);
element('#command-close').addEventListener('click', () => searchDialog.close());
search.addEventListener('input', renderCommands);
search.addEventListener('keydown', (event) => {
  if (event.isComposing) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); activate(active + (event.key === 'ArrowDown' ? 1 : -1)); }
  else if (event.key === 'Home') { event.preventDefault(); activate(0); }
  else if (event.key === 'End') { event.preventDefault(); activate(matches.length - 1); }
  else if (event.key === 'Enter') { event.preventDefault(); runActive(); }
});
searchDialog.addEventListener('close', () => {
  searchOpener?.focus(); searchOpener = null;
  const action = afterClose; afterClose = null; action?.();
});
window.addEventListener('keydown', (event) => {
  if (!event.isComposing && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
});
function route(): void {
  const entry = catalog.find((item) => item.id === location.hash.slice(1));
  if (entry) selectEntry(entry);
}
window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);
const initialEntry = catalog.find((item) => item.id === location.hash.slice(1)) ?? componentEntries.find((item) => item.id === 'ads-button') ?? catalog[0];
if (!initialEntry) throw new Error('No components exported by this build.');
selectEntry(initialEntry);
document.documentElement.dataset.adsReady = 'true';
