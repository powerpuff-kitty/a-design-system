import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), 'ads-packages-'));
const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const run = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

try {
  const dependencies = {};
  const packages = [];
  for (const directory of await readdir(join(root, 'packages'), { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const cwd = join(root, 'packages', directory.name);
    const manifest = await readJson(join(cwd, 'package.json'));
    if (manifest.private) continue;
    assert.match(manifest.name, /^@a-design-system\/[a-z][a-z0-9-]*$/);
    assert.equal(manifest.license, 'Apache-2.0', `${manifest.name}: missing license`);
    const packed = JSON.parse(
      run('pnpm', ['pack', '--json', '--pack-destination', temporary], cwd),
    );
    dependencies[manifest.name] = `file:${packed.filename}`;
    packages.push(manifest.name);
  }
  assert.ok(packages.length > 0, 'No publishable packages found');

  // Install actual tarballs outside the monorepo. Offline mode uses the store
  // populated by the frozen workspace install, without fetching newer packages.
  await writeFile(
    join(temporary, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies,
      // These versions are not published yet; resolve transitive ADS dependencies
      // to the same packed artifacts as the direct consumer dependencies.
      pnpm: { overrides: dependencies },
    }),
  );
  run('pnpm', ['install', '--offline', '--ignore-scripts'], temporary);

  const imports = [];
  const typeImports = [];
  for (const name of packages) {
    const directory = join(temporary, 'node_modules', name);
    const manifest = await readJson(join(directory, 'package.json'));
    await access(join(directory, 'LICENSE'));
    const files = await readdir(directory, { recursive: true });
    assert.ok(
      !files.some((file) => /\.(test|spec)\.[cm]?[jt]s(?:\.map)?$/.test(file)),
      `${name}: test files must not ship in the package`,
    );
    assert.equal(manifest.types, manifest.exports['.'].types);
    for (const version of Object.values(manifest.dependencies ?? {})) {
      assert.ok(!version.startsWith('workspace:'), `${name}: unresolved workspace dependency`);
    }
    for (const [subpath, target] of Object.entries(manifest.exports)) {
      const specifier = subpath === '.' ? name : `${name}${subpath.slice(1)}`;
      if (typeof target === 'string') {
        await access(join(directory, target));
        if (target.endsWith('.json')) await readJson(join(directory, target));
        continue;
      }
      assert.match(
        target.types,
        /^\.\/dist\/.*\.d\.ts$/,
        `${specifier}: types must be built declarations`,
      );
      assert.match(
        target.import,
        /^\.\/dist\/.*\.js$/,
        `${specifier}: runtime must be built JavaScript`,
      );
      await access(join(directory, target.types));
      await access(join(directory, target.import));
      imports.push(`await import(${JSON.stringify(specifier)});`);
      typeImports.push(`import * as entry${typeImports.length} from ${JSON.stringify(specifier)};`);
    }
    console.log(`Verified package contents: ${name}`);
  }

  // Node import catches browser globals at module scope and missing runtime dependencies.
  run(process.execPath, ['--input-type=module', '--eval', imports.join('\n')], temporary);
  await writeFile(join(temporary, 'consumer.ts'), typeImports.join('\n'));
  run(
    process.execPath,
    [
      join(root, 'node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--strict',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--lib',
      'ES2022,DOM,DOM.Iterable',
      'consumer.ts',
    ],
    temporary,
  );
  console.log(
    `Verified ${imports.length} public entry points: SSR imports and consumer declarations`,
  );
} catch (error) {
  if (error.stdout) console.error(String(error.stdout));
  if (error.stderr) console.error(String(error.stderr));
  throw error;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
