import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(
  new URL('../packages/components/custom-elements.json', import.meta.url),
);
const snapshotPath = fileURLToPath(
  new URL('../packages/components/api-snapshot.json', import.meta.url),
);
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const snapshot = Object.fromEntries(
  manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .map((declaration) => [declaration.tagName, declaration.adsContract]),
);
await writeFile(snapshotPath, JSON.stringify({ version: 1, components: snapshot }, null, 2) + '\n');
console.log(`Generated API snapshot for ${Object.keys(snapshot).length} components`);
