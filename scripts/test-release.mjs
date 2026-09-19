import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = await mkdtemp(join(tmpdir(), 'ads-release-test-'));
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const run = (command, args) => execFileSync(command, args, { cwd: fixture, stdio: 'inherit' });
const publicPackages = ['core', 'tokens', 'components'];
const privatePackages = ['apps/component-lab', 'tools/lint'];

async function verifyArtifacts(version) {
  const directory = join(fixture, 'release-artifacts');
  const manifest = await json(join(directory, 'manifest.json'));
  assert.equal(manifest.artifacts.length, publicPackages.length);
  const sums = await readFile(join(directory, 'SHA256SUMS'), 'utf8');
  for (const artifact of manifest.artifacts) {
    assert.equal(artifact.version, version);
    const tarball = join(directory, artifact.filename);
    const hash = createHash('sha256')
      .update(await readFile(tarball))
      .digest('hex');
    assert.equal(artifact.sha256, hash);
    assert.ok(sums.includes(`${hash}  ${artifact.filename}\n`));
    const packed = JSON.parse(
      execFileSync('tar', ['-xOf', tarball, 'package/package.json'], { encoding: 'utf8' }),
    );
    assert.equal(packed.version, version);
    assert.equal(packed.publishConfig.access, 'public');
    if (packed.name === '@a-design-system/components') {
      assert.equal(packed.dependencies['@a-design-system/core'], version);
    }
  }
  for (const directory of privatePackages) {
    assert.equal((await json(join(fixture, directory, 'package.json'))).version, '0.0.0');
  }
}

try {
  const files = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, encoding: 'utf8' },
  );
  for (const file of files.split('\0').filter(Boolean)) {
    await mkdir(dirname(join(fixture, file)), { recursive: true });
    await copyFile(join(root, file), join(fixture, file));
  }
  // Seed deterministic versions and changesets in the disposable copy only.
  for (const directory of [
    ...publicPackages.map((name) => `packages/${name}`),
    ...privatePackages,
  ]) {
    const path = join(fixture, directory, 'package.json');
    const manifest = await json(path);
    manifest.version = '0.0.0';
    await writeFile(path, JSON.stringify(manifest, null, 2) + '\n');
  }
  for (const file of await readdir(join(fixture, '.changeset'))) {
    if (file !== 'config.json' && file !== 'README.md') {
      await rm(join(fixture, '.changeset', file), { recursive: true, force: true });
    }
  }
  await writeFile(
    join(fixture, '.changeset/release-test.md'),
    `---\n${publicPackages.map((name) => `'@a-design-system/${name}': minor`).join('\n')}\n---\n\nVerify release preparation.\n`,
  );
  run('git', ['init', '--initial-branch=main']);
  run('git', ['add', '.']);
  run('git', [
    '-c',
    'user.name=Release Fixture',
    '-c',
    'user.email=fixture@example.invalid',
    'commit',
    '--quiet',
    '-m',
    'Seed disposable release fixture',
  ]);
  run('pnpm', ['install', '--frozen-lockfile', '--offline']);
  run('pnpm', ['release:pre']);
  run('pnpm', ['release:version']);
  run('pnpm', ['release:pack']);
  await verifyArtifacts('0.1.0-next.0');
  run('pnpm', ['check:packages']);
  run('pnpm', ['release:exit-pre']);
  run('pnpm', ['release:version']);
  run('pnpm', ['release:pack']);
  await verifyArtifacts('0.1.0');
  run('pnpm', ['check:packages']);
  for (const name of publicPackages) {
    const changelog = await readFile(join(fixture, `packages/${name}/CHANGELOG.md`), 'utf8');
    assert.ok(changelog.includes('0.1.0'));
    assert.ok(changelog.includes('Verify release preparation.'));
  }
  console.log(
    'Release lifecycle passed: next → stable, private exclusions, changelogs, tarballs, checksums, and consumer contracts.',
  );
} finally {
  await rm(fixture, { recursive: true, force: true });
}
