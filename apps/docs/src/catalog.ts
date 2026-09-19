import * as components from '@a-design-system/components';
import type { AdsComponentContract } from '@a-design-system/core';

export interface CatalogEntry {
  id: string;
  title: string;
  description: string;
  status: string;
  markup: string;
  contract?: AdsComponentContract;
}

const examples: Record<string, string> = {
  'ads-button': '<ads-button>Save changes</ads-button>',
  'ads-input': '<ads-input name="project" label="Project name" value="Untitled project">\n  <span slot="description">A name for your next idea.</span>\n</ads-input>',
  'ads-textarea': '<ads-textarea name="notes" label="Notes" value="Make room for the work."></ads-textarea>',
  'ads-checkbox': '<ads-checkbox name="notifications" value="enabled" checked>Enable notifications</ads-checkbox>',
  'ads-radio': '<ads-radio-group label="Choice" value="one">\n  <ads-radio value="one">First option</ads-radio>\n  <ads-radio value="two">Second option</ads-radio>\n</ads-radio-group>',
  'ads-radio-group': '<ads-radio-group name="plan" label="Plan" value="personal">\n  <ads-radio value="personal">Personal</ads-radio>\n  <ads-radio value="team">Team</ads-radio>\n  <ads-radio value="enterprise" disabled>Enterprise</ads-radio>\n</ads-radio-group>',
  'a-design-system-theme': '<a-design-system-theme theme="minimal-dark">\n  <ads-button>Scoped dark theme</ads-button>\n</a-design-system-theme>',
};

function isContract(value: unknown): value is AdsComponentContract {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Partial<AdsComponentContract>;
  return typeof item.tagName === 'string' && typeof item.name === 'string' && typeof item.status === 'string';
}

// Availability comes from this exact build, not from issue checkboxes or branch claims.
export const componentEntries: CatalogEntry[] = (Object.values(components) as unknown[])
  .filter(isContract)
  .filter((contract) => Boolean(customElements.get(contract.tagName)))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((contract) => ({
    id: contract.tagName,
    title: contract.name,
    description: contract.description,
    status: contract.status,
    markup: examples[contract.tagName] ?? `<${contract.tagName}></${contract.tagName}>`,
    contract,
  }));

// These are transparent markup starters, not advertised as complete backend-connected applications.
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
