import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const manifestPath = fileURLToPath(
  new URL('../packages/components/custom-elements.json', import.meta.url),
);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const contracts = await import('../packages/components/dist/index.js');
assert.equal(manifest.schemaVersion, '2.0.0');
const tags = new Set();
for (const module of manifest.modules) {
  assert.match(module.path, /^src\/.*\.ts$/);
  await access(join(dirname(manifestPath), module.path));
  for (const declaration of module.declarations ?? []) {
    assert.equal(declaration.customElement, true);
    assert.ok(
      declaration.contract && contracts[declaration.contract],
      `${declaration.tagName}: missing contract export`,
    );
    assert.equal(contracts[declaration.contract].tagName, declaration.tagName);
    assert.ok(declaration.adsContract, `${declaration.tagName}: missing API metadata`);
    assert.match(declaration.tagName, /^ads-[a-z0-9-]+$/);
    assert.ok(!tags.has(declaration.tagName), `Duplicate custom element: ${declaration.tagName}`);
    tags.add(declaration.tagName);
  }
}
assert.deepEqual([...tags].sort(), [
  'ads-alert',
  'ads-alert-dialog',
  'ads-avatar',
  'ads-badge',
  'ads-breadcrumb',
  'ads-button',
  'ads-button-group',
  'ads-callout',
  'ads-card',
  'ads-checkbox',
  'ads-checkbox-group',
  'ads-code',
  'ads-collapsible',
  'ads-copy-button',
  'ads-date-input',
  'ads-description',
  'ads-dialog',
  'ads-drawer',
  'ads-error',
  'ads-field',
  'ads-icon-button',
  'ads-input',
  'ads-kbd',
  'ads-label',
  'ads-link',
  'ads-menu',
  'ads-number-input',
  'ads-pagination',
  'ads-password-input',
  'ads-popover',
  'ads-progress',
  'ads-progress-ring',
  'ads-radio',
  'ads-radio-group',
  'ads-range-slider',
  'ads-search-input',
  'ads-select',
  'ads-separator',
  'ads-skeleton',
  'ads-slider',
  'ads-spinner',
  'ads-stepper',
  'ads-switch',
  'ads-tab',
  'ads-tab-panel',
  'ads-table',
  'ads-tabs',
  'ads-tag',
  'ads-textarea',
  'ads-time-input',
  'ads-toast',
  'ads-toast-item',
  'ads-tree',
  'ads-visually-hidden',
]);
console.log(`Verified ${tags.size} ADS custom-element declarations`);
