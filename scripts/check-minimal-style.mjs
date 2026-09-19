import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const roots = [
  join(root, 'packages/components/src'),
  join(root, 'packages/css/src'),
];

function files(directory) {
  const output = [];
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    const stat = statSync(path);
    if (stat.isDirectory()) output.push(...files(path));
    else if (path.endsWith('.ts') || path.endsWith('.css')) output.push(path);
  }
  return output;
}

const sourceFiles = roots.flatMap(files);

const diagnostics = [];
function report(path, line, rule, message) {
  diagnostics.push({
    path: relative(root, path).replaceAll('\\', '/'),
    line,
    rule,
    message,
  });
}

for (const path of sourceFiles) {
  const source = readFileSync(path, 'utf8');
  const lines = source.split('\n');

  lines.forEach((line, index) => {
    const rawHex = /#[0-9a-fA-F]{3,8}\b/.exec(line);
    if (rawHex && !line.includes('var(')) {
      report(path, index + 1, 'minimal/hard-coded-chrome-color', 'Raw hex color must be routed through an ADS semantic/component token.');
    }

    const radius = /border-radius:\s*([^;]+);/.exec(line);
    if (radius) {
      const value = radius[1].trim();
      const allowedLiteral = value === '0' || value === '0px' || value === '50%';
      if (!value.includes('var(') && !allowedLiteral) {
        report(path, index + 1, 'minimal/unapproved-radius', `Unapproved literal radius: ${value}`);
      }
    }
  });

  for (const match of source.matchAll(/box-shadow:\s*([^;]+);/gs)) {
    const value = match[1];
    if (
      !value.includes('var(--ads-elevation') &&
      !value.includes('var(--ads-focus') &&
      !value.includes('color-mix')
    ) {
      const before = source.slice(0, match.index ?? 0);
      const line = before.split('\n').length;
      report(path, line, 'minimal/unapproved-elevation', 'Box shadow must use elevation or focus tokens.');
    }
  }
}

if (diagnostics.length) {
  console.error('ADS Minimal visual conformance failed:');
  for (const item of diagnostics) {
    console.error(`${item.path}:${item.line} [${item.rule}] ${item.message}`);
  }
  process.exit(1);
}

console.log(`ADS Minimal visual conformance passed for ${sourceFiles.length} first-party component/CSS source files.`);
