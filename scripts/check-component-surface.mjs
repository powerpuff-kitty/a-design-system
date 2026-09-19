import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { auditStyling, effectiveCss } from './lib/styling-surface.mjs';

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
const componentNames = sourceFiles.map((filename) => filename.slice(0, -3));
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
  assert.equal(constructors.length, 1, `Expected exactly one component constructor in ${filename}`);
  const [constructorName, constructor] = constructors[0];
  assert.equal(barrel[constructorName], constructor, `Constructor missing from barrel: ${constructorName}`);
  assert(examples[contract.tagName]?.includes(`<${contract.tagName}`), `Missing meaningful fixture for ${contract.tagName}`);
  // Inspect compiled effective styles, not source text: docs strings cannot satisfy the gate,
  // and inherited/borrowed component tokens cannot disappear behind a different filename.
  const styling = auditStyling(contract, effectiveCss(constructor), componentNames);
  report.push({
    tag: contract.tagName,
    status: contract.status,
    subpath: `${manifest.name}/${name}`,
    source: `packages/components/src/${filename}`,
    ...styling,
    stylingTokens: contract.cssCustomProperties ?? [],
    parts: (contract.parts ?? []).map((part) => part.name),
  });
}

assert.equal(new Set(report.map((entry) => entry.tag)).size, report.length, 'Duplicate component tag');
assert.equal(contracts.length, report.length, 'Source and barrel catalogue counts differ');
assert.deepEqual(Object.keys(examples).sort(), report.map((entry) => entry.tag).sort(), 'Docs fixture catalogue does not match component exports');
const failures = report.filter((entry) => !entry.valid);
mkdirSync(join(root, 'artifacts'), { recursive: true });
writeFileSync(join(root, 'artifacts/component-surface.json'), JSON.stringify({
  schemaVersion: 2,
  checkedOutCommit: process.env.GITHUB_SHA ?? null,
  componentCount: report.length,
  stylingContractCheck: failures.length ? 'failed' : 'passed',
  note: 'Export/example parity and effective component-token coverage are enforced, including inherited and shared component namespaces. Global semantic tokens are inventoried separately. This is not complete visual, contrast, interaction, or accessibility certification.',
  components: report.sort((a, b) => a.tag.localeCompare(b.tag)),
}, null, 2) + '\n');
assert.equal(failures.length, 0, `Styling contract mismatch:\n${failures.map((entry) =>
  `${entry.tag}: missing=[${entry.undeclaredLocalTokens.join(', ')}]; unused=[${entry.unusedDeclaredComponentTokens.join(', ')}]; duplicate=[${entry.duplicateDeclarations.join(', ')}]`).join('\n')}`);
console.log(`Verified ${report.length} components: source, barrel, subpath, built targets, docs examples, and effective styling contracts.`);
