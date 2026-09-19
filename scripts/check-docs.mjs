import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(
  await readFile(join(root, 'packages/components/custom-elements.json'), 'utf8'),
);
const docsSource = await readFile(join(root, 'apps/docs/src/main.ts'), 'utf8');
assert.ok(manifest.modules.length > 0, 'component metadata must contain modules');
assert.match(docsSource, /custom-elements\.json/, 'docs must consume generated component metadata');
for (const file of [
  'apps/docs/public/robots.txt',
  'apps/docs/public/sitemap.xml',
  'apps/docs/public/404.html',
  'apps/docs/public/llms.txt',
  'apps/docs/public/llms-full.txt',
]) {
  await access(join(root, file));
}
console.log(
  `Verified docs source and static metadata for ${manifest.modules.length} component modules`,
);
