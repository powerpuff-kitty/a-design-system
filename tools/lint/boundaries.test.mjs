import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { dependencyError } from '../../scripts/workspace-imports.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const eslint = new ESLint({ cwd: root });
const messages = async (code, filePath = 'packages/components/src/probe.ts') => {
  const [result] = await eslint.lintText(code, { filePath });
  assert.ok(!result.messages.some((message) => message.fatal), 'Fixture must parse successfully');
  return result.messages.filter((message) => message.ruleId === 'ads/workspace-imports');
};

test('allows declared public exports and internal relative imports', async () => {
  assert.deepEqual(
    await messages(
      "import '@a-design-system/core'; import './runtime/index.js'; import 'lit/decorators.js';",
    ),
    [],
  );
});

for (const statement of [
  "import '@a-design-system/core/src/index.js';",
  "export * from '@a-design-system/core/dist/index.js';",
  "export { something } from '../../core/src/index.js';",
  "import('../../core/src/index.js');",
  "require('../../core/src/index.js');",
  "type Contract = import('@a-design-system/core/src/index.js').Contract;",
]) {
  test(`rejects private imports: ${statement}`, async () => {
    assert.equal((await messages(statement)).length, 1);
  });
}

test('rejects reverse dependencies, undeclared dependencies, and test tools in runtime code', async () => {
  assert.equal(
    (await messages("import '@a-design-system/components';", 'packages/core/src/probe.ts')).length,
    1,
  );
  assert.equal((await messages("import 'react';")).length, 1);
  assert.equal((await messages("import 'vitest';")).length, 1);
  assert.deepEqual(await messages("import 'vitest';", 'packages/core/src/probe.test.ts'), []);
});

test('enforces workspace protocol and manifest dependency direction', () => {
  const core = { name: '@a-design-system/core', group: 'packages' };
  const components = { name: '@a-design-system/components', group: 'packages' };
  assert.match(dependencyError(components, '@a-design-system/core', '^0.0.0'), /workspace:\*/);
  assert.match(
    dependencyError(core, '@a-design-system/components', 'workspace:*'),
    /cannot depend/,
  );
  assert.match(
    dependencyError(components, '@a-design-system/component-lab', 'workspace:*'),
    /applications/,
  );
  assert.equal(dependencyError(components, '@a-design-system/core', 'workspace:*'), undefined);
  assert.match(dependencyError(core, 'react', '^19.0.0'), /framework-free/);
  assert.match(
    dependencyError(core, '@a-design-system/unknown', 'workspace:*'),
    /Unknown workspace/,
  );
});
