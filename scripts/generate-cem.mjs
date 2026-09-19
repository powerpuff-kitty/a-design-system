import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(
  new URL('../packages/components/custom-elements.json', import.meta.url),
);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const contracts = await import('../packages/components/dist/index.js');
for (const module of manifest.modules) {
  for (const declaration of module.declarations ?? []) {
    const contract = contracts[declaration.contract];
    if (!contract) throw new Error(`${declaration.tagName}: missing ${declaration.contract}`);
    declaration.adsContract = {
      description: contract.description,
      status: contract.status,
      attributes: contract.attributes ?? [],
      properties: contract.properties ?? [],
      methods: contract.methods ?? [],
      events: contract.events ?? [],
      slots: contract.slots ?? [],
      parts: contract.parts ?? [],
      states: contract.states ?? [],
    };
  }
}
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Generated metadata for ${manifest.modules.length} ADS custom-element modules`);
