#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  compileTokens,
  emitTokenOutputs,
  validateContrast,
  validateTokens,
} from '../packages/tokens/dist/index.js';

const [, , namespace, maybeCommand, maybeInput, maybeOutput] = process.argv;
const command = namespace === 'tokens' ? maybeCommand : namespace;
const inputPath = namespace === 'tokens' ? maybeInput : maybeCommand;
const outputDirectory = namespace === 'tokens' ? maybeOutput : maybeInput;
const usage =
  'Usage: ads tokens <validate|build|diff> <tokens.json> [output-directory|baseline.json]';
if (!command || !inputPath || !['validate', 'build', 'diff'].includes(command)) {
  console.error(usage);
  process.exitCode = 2;
} else {
  const source = JSON.parse(await readFile(resolve(inputPath), 'utf8'));
  const result = compileTokens(source);
  const errors = validateTokens(source);
  if (errors.length) throw new Error(errors.join('\n'));
  if (command === 'validate') {
    const contrast = source.$extensions?.['a-design-system']?.contrast;
    if (Array.isArray(contrast)) validateContrast(result, contrast);
    console.log(`Valid token source: ${result.tokens.length} tokens`);
  } else if (command === 'build') {
    const directory = resolve(outputDirectory ?? 'dist/tokens');
    await mkdir(directory, { recursive: true });
    const outputs = emitTokenOutputs(result);
    await Promise.all([
      writeFile(resolve(directory, 'tokens.css'), outputs.css),
      writeFile(resolve(directory, 'tokens.json'), outputs.json),
      writeFile(resolve(directory, 'tokens.ts'), outputs.typescript),
      writeFile(resolve(directory, 'tokens.scss'), outputs.scss),
    ]);
    console.log(`Built ${result.tokens.length} tokens in ${directory}`);
  } else {
    if (!outputDirectory) throw new Error(`${usage}\nA baseline JSON file is required for diff`);
    const baseline = JSON.parse(await readFile(resolve(outputDirectory), 'utf8'));
    const previous = compileTokens(baseline);
    const before = new Map(previous.tokens.map((token) => [token.path, token.cssValue]));
    const changes = result.tokens
      .filter((token) => before.get(token.path) !== token.cssValue)
      .map((token) => `${token.path}: ${before.get(token.path) ?? '<added>'} -> ${token.cssValue}`);
    for (const token of previous.tokens) {
      if (!result.tokens.some((current) => current.path === token.path))
        changes.push(`${token.path}: removed`);
    }
    console.log(changes.length ? changes.join('\n') : 'No token changes');
    process.exitCode = changes.length ? 1 : 0;
  }
}
