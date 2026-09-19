import { readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const within = (directory, file) => {
  const path = relative(directory, file);
  return path !== '..' && !path.startsWith('../') && !isAbsolute(path);
};
const workspaces = ['packages', 'apps'].flatMap((group) =>
  readdirSync(resolve(root, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = resolve(root, group, entry.name);
      return {
        directory,
        group,
        ...JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8')),
      };
    }),
);
const byName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));
const allowed = {
  '@a-design-system/core': [],
  '@a-design-system/tokens': [],
  '@a-design-system/components': ['@a-design-system/core', '@a-design-system/tokens'],
};

export function dependencyError(owner, name, version) {
  if (
    ['@a-design-system/core', '@a-design-system/tokens'].includes(owner.name) &&
    /^(react(?:-dom)?|vue|lit(?:-html)?|@lit\/.*|@angular\/.*)$/.test(name)
  ) {
    return `${owner.name} must remain framework-free`;
  }
  const target = byName.get(name);
  if (!target)
    return name.startsWith('@a-design-system/') ? `Unknown workspace ${name}` : undefined;
  if (version !== 'workspace:*') return `${name} must use workspace:*`;
  if (owner.group === 'packages' && target.group === 'apps')
    return 'Packages cannot depend on applications';
  if (allowed[owner.name] && !allowed[owner.name].includes(name))
    return `${owner.name} cannot depend on ${name}`;
}

// Fail lint before reading source if a manifest violates the dependency graph.
for (const owner of workspaces) {
  for (const field of [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]) {
    for (const [name, version] of Object.entries(owner[field] ?? {})) {
      const error = dependencyError(owner, name, version);
      if (error) throw new Error(`${owner.name}: ${error}`);
    }
  }
}

export const workspaceImports = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { boundary: '{{reason}}' },
  },
  create(context) {
    const filename = context.filename;
    const owner = workspaces.find((workspace) => within(workspace.directory, filename));
    if (!owner) return {};
    const test = /\.(test|spec)\.ts$/.test(filename);
    function check(node) {
      const source = node?.value;
      if (typeof source !== 'string') return;
      let reason;
      if (source.startsWith('.') || isAbsolute(source)) {
        if (!within(owner.directory, resolve(dirname(filename), source))) {
          reason = 'Use public package exports instead of crossing workspace directories';
        }
      } else {
        const name = source.startsWith('@')
          ? source.split('/').slice(0, 2).join('/')
          : source.split('/')[0];
        const target = byName.get(name);
        const version =
          owner.dependencies?.[name] ??
          owner.peerDependencies?.[name] ??
          owner.optionalDependencies?.[name];
        const developmentVersion = owner.devDependencies?.[name];
        if (target) {
          reason = dependencyError(owner, name, version ?? (test ? developmentVersion : undefined));
          const subpath = source === name ? '.' : `.${source.slice(name.length)}`;
          if (!reason && !Object.hasOwn(target.exports ?? {}, subpath))
            reason = `${source} is not a public export`;
        } else if (dependencyError(owner, name, version)) {
          reason = dependencyError(owner, name, version);
        } else if (
          !version &&
          !(test && (developmentVersion || name === 'vitest' || name === '@playwright/test'))
        ) {
          reason = `${name} must be declared in this workspace's runtime dependencies`;
        }
      }
      if (reason) context.report({ node, messageId: 'boundary', data: { reason } });
    }
    return {
      ImportDeclaration: (node) => check(node.source),
      ExportNamedDeclaration: (node) => check(node.source),
      ExportAllDeclaration: (node) => check(node.source),
      ImportExpression: (node) => check(node.source),
      TSImportType: (node) => check(node.argument?.literal ?? node.argument),
      CallExpression: (node) => {
        if (node.callee.name === 'require') check(node.arguments[0]);
      },
    };
  },
};
