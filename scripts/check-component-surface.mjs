import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageRoot = join(root, 'packages/components');
const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
const examples = JSON.parse(readFileSync(join(root, 'apps/docs/src/examples.json'), 'utf8'));
const barrel = await import(pathToFileURL(join(packageRoot, 'dist/index.js')).href);
const isContract = (value) => value && typeof value === 'object' &&
  typeof value.tagName === 'string' && typeof value.status === 'string';
const contracts = Object.entries(barrel).filter(([, value]) => isContract(value));
const sourceFiles = readdirSync(join(packageRoot, 'src')).filter((name) =>
  name.endsWith('.ts') && name !== 'index.ts' && !name.endsWith('.test.ts'));
const report = [];

for (const filename of sourceFiles) {
  const name = filename.slice(0, -3);
  const subpath = `./${name}`;
  const exported = manifest.exports[subpath];
  assert(exported && typeof exported === 'object', `Missing package export: ${subpath}`);
  for (const kind of ['types', 'import']) {
    assert(typeof exported[kind] === 'string', `Missing ${kind} target: ${subpath}`);
    assert(existsSync(join(packageRoot, exported[kind])), `Missing ${kind} file: ${subpath}`);
  }
  const module = await import(pathToFileURL(join(packageRoot, exported.import)).href);
  const ownContracts = Object.entries(module).filter(([, value]) => isContract(value));
  assert.equal(ownContracts.length, 1, `Expected exactly one contract in ${filename}`);
  const [exportName, contract] = ownContracts[0];
  assert.equal(barrel[exportName], contract, `Contract not exported by barrel: ${exportName}`);
  const constructors = Object.entries(module).filter(([key, value]) => key.startsWith('Ads') && typeof value === 'function');
  assert(constructors.length, `No component constructor in ${filename}`);
  for (const [key, constructor] of constructors) assert.equal(barrel[key], constructor, `Constructor missing from barrel: ${key}`);
  assert(examples[contract.tagName]?.includes(`<${contract.tagName}`), `Missing meaningful fixture for ${contract.tagName}`);
  const source = readFileSync(join(packageRoot, 'src', filename), 'utf8');
  const referenced = [...new Set([...source.matchAll(/var\(\s*(--ads-[\w-]+)/g)].map((match) => match[1]))].sort();
  const declared = (contract.cssCustomProperties ?? []).map((token) => token.name);
  const undeclaredLocal = referenced.filter((token) => token.startsWith(`--ads-${name}-`) && !declared.includes(token));
  report.push({
    tag: contract.tagName,
    status: contract.status,
    subpath: `${manifest.name}/${name}`,
    source: `packages/components/src/${filename}`,
    declaredTokens: declared,
    referencedTokens: referenced,
    undeclaredLocalTokens: undeclaredLocal,
    parts: (contract.parts ?? []).map((part) => part.name),
  });
}

assert.equal(new Set(report.map((entry) => entry.tag)).size, report.length, 'Duplicate component tag');
assert.equal(contracts.length, report.length, 'Source and barrel catalogue counts differ');
assert.deepEqual(Object.keys(examples).sort(), report.map((entry) => entry.tag).sort(), 'Docs fixture catalogue does not match component exports');
mkdirSync(join(root, 'artifacts'), { recursive: true });
writeFileSync(join(root, 'artifacts/component-surface.json'), JSON.stringify({
  schemaVersion: 1,
  componentCount: report.length,
  note: 'Export/example parity is enforced. Token coverage is an inventory, not full visual or accessibility certification.',
  components: report.sort((a, b) => a.tag.localeCompare(b.tag)),
}, null, 2) + '\n');
console.log(`Verified ${report.length} components: source, barrel, subpath, built targets, and docs example parity.`);
console.log(`Undeclared local styling tokens: ${report.reduce((sum, entry) => sum + entry.undeclaredLocalTokens.length, 0)} (recorded, not hidden).`);
