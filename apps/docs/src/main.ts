import '@a-design-system/components';
// The catalogue is generated from the checked-in component metadata at build time.
// eslint-disable-next-line ads/workspace-imports
import manifest from '../../../packages/components/custom-elements.json';
import { frameworkExamples } from './framework-examples.js';
import './styles.css';

type Declaration = {
  tagName: string;
  name: string;
  contract: string;
  adsContract: {
    description: string;
    status: string;
    attributes?: Array<{ name: string; type: string; default?: string }>;
    properties?: Array<{ name: string; type: string }>;
    slots?: Array<{ name: string; description?: string }>;
    parts?: Array<{ name: string; description?: string }>;
    events?: Array<{ name: string; description?: string }>;
    states?: Array<{ name: string; description?: string }>;
    cssCustomProperties?: Array<{ name: string; default?: string }>;
  };
};
const components = manifest.modules
  .flatMap((module) => (module.declarations ?? []) as Declaration[])
  .sort((a, b) => a.tagName.localeCompare(b.tagName));
type PreviewWidth = 'fluid' | 'compact' | 'tablet' | 'wide';
type PreviewHeight = 'short' | 'comfortable' | 'tall';
let previewWidth: PreviewWidth = 'fluid';
let previewHeight: PreviewHeight = 'comfortable';
let keyboardPreview = false;
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `<a class="skip-link" href="#main-content">Skip to main content</a><header class="site-header"><a class="wordmark" href="#">A Design System</a><nav aria-label="Primary navigation"><a href="#catalog">Components</a><a href="#foundations">Foundations</a><a href="#getting-started">Getting started</a></nav></header><main id="main-content"><section class="hero" aria-labelledby="hero-title"><p class="eyebrow">Open source · standards first</p><h1 id="hero-title">Build interfaces that stay understandable.</h1><p class="lede">Accessible Web Components, portable tokens, and headless primitives for teams that value durable UI.</p><a class="button" href="#catalog">Browse the catalogue</a></section><section id="getting-started" class="intro" aria-labelledby="getting-started-title"><div><p class="eyebrow">Getting started</p><h2 id="getting-started-title">Install the foundation</h2></div><pre><code>pnpm add @a-design-system/components @a-design-system/tokens</code></pre></section><section id="catalog" class="catalog" aria-labelledby="catalog-title"><div class="section-heading"><div><p class="eyebrow">Component catalogue</p><h2 id="catalog-title">Everything has a contract.</h2></div><span class="count" aria-live="polite"></span></div><div class="toolbar"><label class="search">Search components<input type="search" placeholder="Try “input” or “toast”" /></label><label>Maturity<select><option value="all">All components</option><option value="experimental">Experimental</option><option value="stable">Stable</option></select></label></div><div class="catalog-layout"><div class="cards" aria-label="Component list"></div><article class="detail" aria-live="polite" aria-atomic="true"></article></div></section><section id="foundations" class="foundations" aria-labelledby="foundations-title"><p class="eyebrow">Foundations</p><h2 id="foundations-title">Tokens are the source of truth.</h2><p>Theme decisions compile to CSS, JSON, TypeScript, SCSS, and Figma metadata so products can share one vocabulary across tools.</p></section></main><footer>© A Design System · Built for the open web</footer>`;
const frameworkSection = document.createElement('section');
frameworkSection.id = 'frameworks';
frameworkSection.className = 'frameworks';
frameworkSection.setAttribute('aria-labelledby', 'frameworks-title');
frameworkSection.innerHTML = frameworkExamples;
const frameworkLink = document.createElement('a');
frameworkLink.href = '#frameworks';
frameworkLink.textContent = 'Frameworks';
app.querySelector('nav')?.insertBefore(frameworkLink, app.querySelector('nav')?.firstChild ?? null);
app.querySelector('#catalog')?.before(frameworkSection);
const platformSection = document.createElement('section');
platformSection.id = 'platform';
platformSection.className = 'platform-resources';
platformSection.setAttribute('aria-labelledby', 'platform-title');
platformSection.innerHTML = `<div class="section-heading"><div><p class="eyebrow">Platform resources</p><h2 id="platform-title">The catalogue is the beginning.</h2></div></div><div class="resource-grid"><article><h3>Recipes & blocks</h3><p>Source-owned application patterns are planned next. Component contracts and tokens are ready to compose them.</p></article><article><h3>AI interfaces</h3><p>Provider-neutral AI contracts and components are tracked separately while the core Web Component vocabulary matures.</p></article><article><h3>CLI & agent context</h3><p>Use the generated CEM, API snapshot, token files, and <code>llms.txt</code> as machine-readable context today.</p></article><article><h3>Migrations</h3><p>Versioned migration guides will be published alongside stable API releases. The current public API is experimental.</p></article></div>`;
app.querySelector('#foundations')?.after(platformSection);
const platformLink = document.createElement('a');
platformLink.href = '#platform';
platformLink.textContent = 'Platform';
app.querySelector('nav')?.append(platformLink);
const cards = app.querySelector<HTMLDivElement>('.cards')!;
const themeToggle = document.createElement('button');
themeToggle.className = 'theme-toggle';
themeToggle.type = 'button';
themeToggle.setAttribute('aria-pressed', 'false');
themeToggle.textContent = 'Dark mode';
themeToggle.addEventListener('click', () => {
  const dark = document.documentElement.toggleAttribute('data-dark');
  themeToggle.setAttribute('aria-pressed', String(dark));
  themeToggle.textContent = dark ? 'Light mode' : 'Dark mode';
});
app.querySelector('nav')?.append(themeToggle);
const detail = app.querySelector<HTMLElement>('.detail')!;
const count = app.querySelector<HTMLSpanElement>('.count')!;
const search = app.querySelector<HTMLInputElement>('input[type=search]')!;
const maturity = app.querySelector<HTMLSelectElement>('select')!;
function render() {
  const query = search.value.toLowerCase();
  const visible = components.filter(
    (item) =>
      (maturity.value === 'all' || item.adsContract.status === maturity.value) &&
      `${item.tagName} ${item.name} ${item.adsContract.description}`.toLowerCase().includes(query),
  );
  count.textContent = `${visible.length} of ${components.length} components`;
  const hashTag = decodeURIComponent(location.hash.slice(1));
  if (!detail.dataset.selected || !visible.some((item) => item.tagName === detail.dataset.selected))
    detail.dataset.selected = visible.some((item) => item.tagName === hashTag)
      ? hashTag
      : (visible[0]?.tagName ?? '');
  cards.innerHTML = visible
    .map(
      (item) =>
        `<button class="card" type="button" aria-pressed="${item.tagName === detail.dataset.selected}" data-tag="${item.tagName}"><span class="status">${item.adsContract.status}</span><strong>${item.tagName}</strong><span>${item.adsContract.description}</span></button>`,
    )
    .join('');
  const selected = components.find((item) => item.tagName === detail.dataset.selected);
  detail.innerHTML = selected
    ? `<p class="eyebrow">Live preview · Component API</p><h3 id="component-detail-title" tabindex="-1">${selected.tagName}</h3><div class="preview-controls" role="group" aria-label="Preview controls"><label>Viewport<select class="preview-width"><option value="fluid">Fluid</option><option value="compact">Compact · 320px</option><option value="tablet">Tablet · 560px</option><option value="wide">Wide · 720px</option></select></label><label>Height<select class="preview-height"><option value="short">Short</option><option value="comfortable">Comfortable</option><option value="tall">Tall</option></select></label><button class="keyboard-preview" type="button" aria-pressed="${keyboardPreview}">Keyboard focus</button></div><div class="preview${keyboardPreview ? ' keyboard-preview-active' : ''}" aria-label="Live preview of ${selected.tagName}" tabindex="0"><${selected.tagName}></${selected.tagName}></div><p>${selected.adsContract.description}</p><div class="api-grid"><section><h4>Attributes</h4>${(selected.adsContract.attributes ?? []).map((x) => `<code>${x.name}: ${x.type}</code>`).join('') || '<span>None</span>'}</section><section><h4>Slots</h4>${(selected.adsContract.slots ?? []).map((x) => `<code>${x.name}</code>`).join('') || '<span>None</span>'}</section><section><h4>Parts</h4>${(selected.adsContract.parts ?? []).map((x) => `<code>${x.name}</code>`).join('') || '<span>None</span>'}</section><section><h4>Events</h4>${(selected.adsContract.events ?? []).map((x) => `<code>${x.name}</code>`).join('') || '<span>None</span>'}</section></div>`
    : '<p role="status">No components match your search.</p>';
  if (selected) {
    const preview = detail.querySelector<HTMLElement>('.preview')!;
    const widthControl = detail.querySelector<HTMLSelectElement>('.preview-width')!;
    const heightControl = detail.querySelector<HTMLSelectElement>('.preview-height')!;
    const keyboardControl = detail.querySelector<HTMLButtonElement>('.keyboard-preview')!;
    widthControl.value = previewWidth;
    heightControl.value = previewHeight;
    const updatePreview = () => {
      preview.dataset.width = previewWidth;
      preview.dataset.height = previewHeight;
      preview.classList.toggle('keyboard-preview-active', keyboardPreview);
      keyboardControl.setAttribute('aria-pressed', String(keyboardPreview));
    };
    widthControl.addEventListener('change', () => {
      previewWidth = widthControl.value as PreviewWidth;
      updatePreview();
    });
    heightControl.addEventListener('change', () => {
      previewHeight = heightControl.value as PreviewHeight;
      updatePreview();
    });
    keyboardControl.addEventListener('click', () => {
      keyboardPreview = !keyboardPreview;
      updatePreview();
      if (keyboardPreview) preview.focus();
    });
    updatePreview();
    const snippet = document.createElement('div');
    snippet.className = 'snippet';
    snippet.innerHTML = `<code>&lt;${selected.tagName}&gt;&lt;/${selected.tagName}&gt;</code><button type="button">Copy HTML</button><span class="copy-status" role="status" aria-live="polite"></span>`;
    snippet.querySelector('button')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard?.writeText(`<${selected.tagName}></${selected.tagName}>`);
        (snippet.querySelector('button') as HTMLButtonElement).textContent = 'Copied';
        (snippet.querySelector('.copy-status') as HTMLElement).textContent =
          'HTML copied to clipboard.';
      } catch {
        (snippet.querySelector('.copy-status') as HTMLElement).textContent =
          'Copy unavailable. Select the HTML manually.';
      }
    });
    detail.prepend(snippet);
    const extended = document.createElement('section');
    extended.className = 'api-extended';
    const list = (
      values: Array<{ name: string; type?: string; default?: string; description?: string }> = [],
    ) =>
      values.length
        ? values
            .map(
              (item) =>
                `<code>${item.name}${item.type ? `: ${item.type}` : ''}${item.default ? ` = ${item.default}` : ''}</code>`,
            )
            .join('')
        : '<span>None</span>';
    extended.innerHTML = `<section><h4>Properties</h4>${list(selected.adsContract.properties)}</section><section><h4>States</h4>${list(selected.adsContract.states)}</section><section><h4>CSS custom properties</h4>${list(selected.adsContract.cssCustomProperties)}</section>`;
    detail.append(extended);
  }
  cards.querySelectorAll<HTMLButtonElement>('.card').forEach((button) =>
    button.addEventListener('click', () => {
      detail.dataset.selected = button.dataset.tag!;
      history.replaceState(null, '', `#${button.dataset.tag}`);
      render();
      detail.querySelector<HTMLElement>('#component-detail-title')?.focus();
    }),
  );
}
search.addEventListener('input', render);
maturity.addEventListener('change', render);
window.addEventListener('hashchange', render);
render();
document.documentElement.dataset.adsReady = 'true';
