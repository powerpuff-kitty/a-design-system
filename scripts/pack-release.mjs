import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'release-artifacts');
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, encoding: 'utf8' }).trim();
const packages = [];
for (const entry of await readdir(join(root, 'packages'), { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = join(root, 'packages', entry.name);
  const manifest = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  if (manifest.private) continue;
  assert.notEqual(
    manifest.version,
    '0.0.0',
    `${manifest.name}: run release:version before packing`,
  );
  await readFile(join(directory, 'dist/index.js'));
  packages.push({ directory, manifest });
}
assert.ok(packages.length, 'No public packages found');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const artifacts = [];
for (const { directory, manifest } of packages) {
  const packed = JSON.parse(
    run('pnpm', ['pack', '--json', '--pack-destination', output], directory),
  );
  const filename = packed.filename.split(/[\\/]/).at(-1);
  const sha256 = createHash('sha256')
    .update(await readFile(join(output, filename)))
    .digest('hex');
  artifacts.push({ name: manifest.name, version: manifest.version, filename, sha256 });
}
await writeFile(
  join(output, 'SHA256SUMS'),
  artifacts.map(({ sha256, filename }) => `${sha256}  ${filename}\n`).join(''),
);
await writeFile(
  join(output, 'manifest.json'),
  JSON.stringify(
    {
      baseCommit: run('git', ['rev-parse', 'HEAD']),
      workingTreeModified: Boolean(
        run('git', ['status', '--porcelain', '--untracked-files=normal']),
      ),
      artifacts,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  `Prepared ${artifacts.length} package tarballs and SHA-256 checksums in release-artifacts/`,
);
