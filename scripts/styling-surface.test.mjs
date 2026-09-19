import assert from 'node:assert/strict';
import test from 'node:test';
import { auditStyling, effectiveCss, referencedTokens } from './lib/styling-surface.mjs';

const contract = (...names) => ({ cssCustomProperties: names.map((name) => ({ name })) });

test('reads nested fallbacks, whitespace, and deduplicates references', () => {
  assert.deepEqual(referencedTokens('a { color: var( --ads-input-color , var(--ads-color-text-default, black)); border: var(--ads-input-color); }'), ['--ads-color-text-default', '--ads-input-color']);
});
test('ignores comments, strings, and declaration-only names', () => {
  assert.deepEqual(referencedTokens('/* var(--ads-input-fake) */ a { content: "var(--ads-input-fake)"; --ads-input-declared: red; color: var(--ads-input-color); }'), ['--ads-input-color']);
});
test('does not count var-like identifiers as token references', () => {
  assert.deepEqual(referencedTokens('a { x: notvar(--ads-input-no); y: var(--other-token); }'), []);
});
test('detects shared token families used by differently named components', () => {
  const result = auditStyling(contract(), 'a { color: var(--ads-toast-color); }', ['toast', 'toast-item']);
  assert.equal(result.valid, false);
  assert.deepEqual(result.undeclaredLocalTokens, ['--ads-toast-color']);
});
test('rejects unused declarations rather than accepting invented customization knobs', () => {
  const result = auditStyling(contract('--ads-input-unused'), 'a { color: black; }', ['input']);
  assert.equal(result.valid, false);
  assert.deepEqual(result.unusedDeclaredComponentTokens, ['--ads-input-unused']);
});
test('rejects duplicate declarations and inventories shared semantic references separately', () => {
  const result = auditStyling(contract('--ads-input-color', '--ads-input-color'), 'a { color: var(--ads-input-color, var(--ads-color-text-default)); }', ['input']);
  assert.equal(result.valid, false);
  assert.deepEqual(result.duplicateDeclarations, ['--ads-input-color']);
  assert.deepEqual(result.sharedReferencedTokens, ['--ads-color-text-default']);
});
test('effective stylesheet inspection follows inheritance and finalizes the inspected constructor', () => {
  class Base {
    static styles = [{ cssText: 'a { color: var(--ads-input-color); }' }];
    static finalize() { this.elementStyles = this.styles; }
  }
  class Derived extends Base {}
  assert.equal(Object.hasOwn(Derived, 'elementStyles'), false);
  assert.match(effectiveCss(Derived), /--ads-input-color/);
  assert.equal(Object.hasOwn(Derived, 'elementStyles'), true);
});
test('unsupported stylesheet objects fail closed', () => {
  class Broken { static finalize() { this.elementStyles = [{}]; } }
  assert.throws(() => effectiveCss(Broken), /Unsupported stylesheet/);
});
test('all declared and used component tokens pass, including a borrowed input namespace', () => {
  const result = auditStyling(contract('--ads-input-color'), 'a { color: var(--ads-input-color); }', ['input', 'number-input']);
  assert.equal(result.valid, true);
});
