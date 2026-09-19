import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileTokens } from '../dist/index.js';

const root = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(root, '..');
const sourceRoot = join(packageRoot, 'src', 'themes');
const outputRoot = join(packageRoot, 'dist', 'themes');

const themes = [
  { id: 'minimal-light', scheme: 'light', selector: ":root, [data-ads-theme='minimal-light']" },
  { id: 'minimal-dark', scheme: 'dark', selector: "[data-ads-theme='minimal-dark']" },
  { id: 'minimal-high-contrast', scheme: 'light', selector: "[data-ads-theme='minimal-high-contrast']" },
];

mkdirSync(outputRoot, { recursive: true });

const generated = [];
for (const theme of themes) {
  const source = JSON.parse(readFileSync(join(sourceRoot, `${theme.id}.json`), 'utf8'));
  const compiled = compileTokens(source, { selector: theme.selector });
  const scheme = `${theme.selector} {\n  color-scheme: ${theme.scheme};\n}\n`;
  const css = `/* Generated from src/themes/${theme.id}.json. Do not hand-edit. */\n${compiled.css}${scheme}`;
  writeFileSync(join(outputRoot, `${theme.id}.css`), css);
  generated.push(css);
}

writeFileSync(
  join(outputRoot, 'minimal.css'),
  `/* Generated ADS Minimal theme bundle. Do not hand-edit. */\n${generated.join('\n')}`,
);

console.log(`Generated ${themes.length} ADS Minimal theme CSS files and combined minimal.css.`);
