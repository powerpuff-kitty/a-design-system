import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const manifest = JSON.parse(
  await readFile(
    fileURLToPath(new URL('../packages/components/custom-elements.json', import.meta.url)),
    'utf8',
  ),
);
const snapshot = JSON.parse(
  await readFile(
    fileURLToPath(new URL('../packages/components/api-snapshot.json', import.meta.url)),
    'utf8',
  ),
);
assert.equal(snapshot.version, 1);
const current = Object.fromEntries(
  manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .map((declaration) => [declaration.tagName, declaration.adsContract]),
);
for (const [tagName, previous] of Object.entries(snapshot.components)) {
  assert.ok(
    current[tagName],
    `Removed component requires an intentional API snapshot update: ${tagName}`,
  );
  for (const field of [
    'attributes',
    'properties',
    'methods',
    'events',
    'slots',
    'parts',
    'states',
  ]) {
    const before = new Set((previous[field] ?? []).map((entry) => entry.name));
    const after = new Set((current[tagName][field] ?? []).map((entry) => entry.name));
    for (const name of before) assert.ok(after.has(name), `${tagName}: removed ${field} ${name}`);
  }
}
console.log(`Verified API compatibility snapshot for ${Object.keys(current).length} components`);
