import * as components from '@a-design-system/components';
import type { AdsComponentContract } from '@a-design-system/core';
import exampleData from './examples.json';

export interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  status: string;
  markup: string;
  contract?: AdsComponentContract;
}

const examples: Readonly<Record<string, string>> = exampleData;

function isContract(value: unknown): value is AdsComponentContract {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<AdsComponentContract>;
  return typeof item.tagName === 'string' && typeof item.name === 'string' && typeof item.status === 'string';
}

// Fail visibly instead of concealing a broken registration or fabricating an empty preview.
export const componentEntries: CatalogEntry[] = (Object.values(components) as unknown[])
  .filter(isContract)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((contract) => {
    if (!customElements.get(contract.tagName)) {
      throw new Error(`Exported component is not registered: ${contract.tagName}`);
    }
    const markup = examples[contract.tagName];
    if (!markup) throw new Error(`Missing component example: ${contract.tagName}`);
    return {
      id: contract.tagName,
      title: contract.name,
      description: contract.description,
      status: contract.status,
      markup,
      contract,
    };
  });

// These are transparent markup starters, not complete backend-connected applications.
export const recipeEntries: CatalogEntry[] = [
  {
    id: 'layout-settings', title: 'Settings form', status: 'markup starter',
    description: 'A compact settings layout composed from real form controls. Submission is local in this documentation preview; connect your own persistence.',
    markup: `<form style="display: grid; gap: var(--ads-space-4, 1rem); max-inline-size: 28rem;">
  <ads-input name="displayName" label="Display name" value="Alex" required></ads-input>
  <ads-textarea name="bio" label="About" value="Designer and developer."></ads-textarea>
  <ads-checkbox name="updates" value="yes" checked>Email updates</ads-checkbox>
  <ads-button type="submit">Save preferences</ads-button>
</form>`,
  },
  {
    id: 'layout-workspace', title: 'Minimal workspace', status: 'markup starter',
    description: 'A content-first workspace with a narrow rail and contextual inspector. Layout markup only; wire tool actions to your application commands.',
    markup: `<div class="ads-workspace" style="min-block-size: 20rem;">
  <nav class="ads-workspace__rail" aria-label="Workspace navigation">
    <a href="#workspace-result" aria-label="Go to canvas">01</a>
    <a href="#workspace-tools" aria-label="Go to tools">02</a>
  </nav>
  <aside id="workspace-tools" class="ads-workspace__tools">
    <div class="ads-workspace__panel-content">
      <ads-input label="Document name" value="Untitled"></ads-input>
    </div>
  </aside>
  <section id="workspace-result" class="ads-workspace__result" style="padding: var(--ads-space-4, 1rem);">
    <h2>Your working surface</h2>
    <p>Keep the content central. Reveal tools only when needed.</p>
  </section>
</div>`,
  },
  {
    id: 'layout-review', title: 'Review table', status: 'markup starter',
    description: 'A semantic, read-only comparison table with restrained structure. Sorting, filtering, selection, and a data backend are not included.',
    markup: `<table style="inline-size: 100%; border-collapse: collapse; text-align: start;">
  <caption>Release review — example data</caption>
  <thead><tr><th scope="col">Item</th><th scope="col">Status</th><th scope="col">Owner</th></tr></thead>
  <tbody>
    <tr><th scope="row">Documentation</th><td>In review</td><td>Design</td></tr>
    <tr><th scope="row">Form controls</th><td>Testing</td><td>Engineering</td></tr>
    <tr><th scope="row">Theme presets</th><td>Experimental</td><td>Design</td></tr>
  </tbody>
</table>`,
  },
];
export const catalog = [...componentEntries, ...recipeEntries];
