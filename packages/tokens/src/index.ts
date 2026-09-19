export type DtcgTokenType = string;

export interface DtcgToken {
  $value: unknown;
  $type?: DtcgTokenType;
  $description?: string;
  [extension: `$${string}`]: unknown;
}

export interface CompiledToken {
  path: string;
  type?: string;
  description?: string;
  value: unknown;
  cssVariable: `--${string}`;
  cssValue: string;
}

export interface CompileTokensOptions {
  prefix?: string;
  selector?: string;
}

export interface TokenModeSource {
  name: string;
  source: unknown;
  selector?: string;
}

export interface CompiledTokenModes {
  modes: readonly { name: string; result: CompiledTokenSet }[];
  css: string;
}

export interface ContrastRequirement {
  foreground: string;
  background: string;
  minimum?: number;
}

export interface ContrastResult extends ContrastRequirement {
  ratio: number;
  passes: boolean;
}

export interface FigmaTokenVariable {
  name: string;
  type: string;
  value: unknown;
  cssVariable: `--${string}`;
  description?: string;
}

export interface TokenSnapshot {
  version: 1;
  tokens: readonly { path: string; type?: string; cssValue: string }[];
}

export interface CompiledTokenSet {
  tokens: readonly CompiledToken[];
  css: string;
}

export interface PlatformTokenOutputs {
  css: string;
  json: string;
  typescript: string;
  scss: string;
}

interface CollectedToken {
  path: string;
  token: DtcgToken;
  type?: string;
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isToken(value: unknown): value is DtcgToken {
  return isRecord(value) && Object.prototype.hasOwnProperty.call(value, '$value');
}

function collectTokens(
  node: JsonRecord,
  path: readonly string[] = [],
  inheritedType?: string,
  result: CollectedToken[] = [],
): CollectedToken[] {
  const groupType = typeof node.$type === 'string' ? node.$type : inheritedType;
  const root = node.$root;

  if (isToken(root)) {
    const type = typeof root.$type === 'string' ? root.$type : groupType;
    result.push({ path: path.join('.'), token: root, ...(type ? { type } : {}) });
  }

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    const nextPath = [...path, key];
    if (isToken(value)) {
      const type = typeof value.$type === 'string' ? value.$type : groupType;
      result.push({ path: nextPath.join('.'), token: value, ...(type ? { type } : {}) });
      continue;
    }

    if (isRecord(value)) collectTokens(value, nextPath, groupType, result);
  }

  return result;
}

function referencePath(value: string): string | undefined {
  const match = /^\{([^{}]+)\}$/.exec(value.trim());
  return match?.[1];
}

function resolveDeep(value: unknown, resolveReference: (path: string) => unknown): unknown {
  if (typeof value === 'string') {
    const reference = referencePath(value);
    return reference ? resolveReference(reference) : value;
  }

  if (Array.isArray(value)) return value.map((item) => resolveDeep(item, resolveReference));

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveDeep(child, resolveReference)]),
    );
  }

  return value;
}

function normalizeCssName(path: string, prefix: string): `--${string}` {
  const safePrefix = prefix.replace(/^--/, '').replace(/[^a-zA-Z0-9_-]+/g, '-');
  const safePath = path.replace(/\./g, '-').replace(/[^a-zA-Z0-9_-]+/g, '-');
  return `--${safePrefix}-${safePath}`;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(6)));
}

function serializeCssValue(value: unknown, type?: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (
      type === 'cubicBezier' &&
      value.length === 4 &&
      value.every((item) => typeof item === 'number')
    ) {
      return `cubic-bezier(${value.map((item) => formatNumber(item as number)).join(', ')})`;
    }
    return value.map((item) => serializeCssValue(item)).join(' ');
  }

  if (isRecord(value)) {
    if (typeof value.value === 'number' && typeof value.unit === 'string') {
      return `${formatNumber(value.value)}${value.unit}`;
    }

    if (
      type === 'color' &&
      typeof value.colorSpace === 'string' &&
      Array.isArray(value.components)
    ) {
      const components = value.components
        .map((component) =>
          typeof component === 'number' ? formatNumber(component) : String(component),
        )
        .join(' ');
      const alpha = typeof value.alpha === 'number' ? formatNumber(value.alpha) : '1';
      const colorSpace = value.colorSpace.toLowerCase();

      if (colorSpace === 'srgb' || colorSpace === 'srgb-linear' || colorSpace === 'display-p3') {
        return `color(${colorSpace} ${components} / ${alpha})`;
      }

      return `${colorSpace}(${components} / ${alpha})`;
    }

    // Composite tokens remain usable as custom-property payloads even when ADS
    // does not yet have a dedicated serializer for that DTCG token type.
    return JSON.stringify(value);
  }

  if (value === null) return 'initial';
  throw new TypeError(`Unsupported token value: ${String(value)}`);
}

/**
 * Compiles a DTCG token tree into resolved token metadata and deterministic CSS
 * custom properties. References are resolved transitively and cycles fail fast.
 */
export function compileTokens(
  source: unknown,
  options: CompileTokensOptions = {},
): CompiledTokenSet {
  if (!isRecord(source)) throw new TypeError('Token source must be an object');

  const collected = collectTokens(source);
  const byPath = new Map(collected.map((item) => [item.path, item]));
  const resolved = new Map<string, unknown>();
  const resolving = new Set<string>();

  const resolveToken = (path: string): unknown => {
    if (resolved.has(path)) return resolved.get(path);

    const item = byPath.get(path);
    if (!item) throw new ReferenceError(`Unknown token reference: {${path}}`);
    if (resolving.has(path)) {
      throw new TypeError(
        `Circular token reference detected: ${[...resolving, path].join(' -> ')}`,
      );
    }

    resolving.add(path);
    try {
      const value = resolveDeep(item.token.$value, resolveToken);
      resolved.set(path, value);
      return value;
    } finally {
      resolving.delete(path);
    }
  };

  const prefix = options.prefix ?? 'ads';
  const selector = options.selector ?? ':root';
  const tokens = collected
    .map((item): CompiledToken => {
      const value = resolveToken(item.path);
      const cssVariable = normalizeCssName(item.path, prefix);
      const description =
        typeof item.token.$description === 'string' ? item.token.$description : undefined;

      return {
        path: item.path,
        ...(item.type ? { type: item.type } : {}),
        ...(description ? { description } : {}),
        value,
        cssVariable,
        cssValue: serializeCssValue(value, item.type),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  const declarations = tokens
    .map((token) => `  ${token.cssVariable}: ${token.cssValue};`)
    .join('\n');
  const css = `${selector} {\n${declarations}\n}\n`;

  return { tokens, css };
}

/** Produces deterministic text artifacts for the supported token platforms. */
export function emitTokenOutputs(result: CompiledTokenSet): PlatformTokenOutputs {
  const json =
    JSON.stringify(
      Object.fromEntries(result.tokens.map((token) => [token.path, token.value])),
      null,
      2,
    ) + '\n';
  const typescript = `export const tokens = ${json} as const;\n`;
  const scss =
    result.tokens
      .map((token) => `$${token.path.replace(/\./g, '-')}: ${token.cssValue};`)
      .join('\n') + '\n';
  return { css: result.css, json, typescript, scss };
}

/**
 * Compiles light/dark, density, brand, or other named modes into scoped CSS.
 * Each mode is a complete token source so references are resolved within its
 * own graph and cannot silently depend on another mode.
 */
export function compileTokenModes(
  modes: readonly TokenModeSource[],
  options: Omit<CompileTokensOptions, 'selector'> = {},
): CompiledTokenModes {
  const seen = new Set<string>();
  const compiled = modes.map(({ name, source, selector }) => {
    if (!name || seen.has(name)) throw new TypeError(`Duplicate or empty token mode: ${name}`);
    seen.add(name);
    const result = compileTokens(source, {
      ...options,
      selector: selector ?? `[data-ads-theme="${name}"]`,
    });
    return { name, result };
  });
  return {
    modes: compiled,
    css: compiled.map(({ result }) => result.css).join(''),
  };
}

/** Validates a token source without emitting platform output. */
export function validateTokens(source: unknown): readonly string[] {
  const result = compileTokens(source);
  const errors: string[] = [];
  const names = new Set<string>();
  for (const token of result.tokens) {
    if (names.has(token.cssVariable)) errors.push(`Duplicate CSS variable: ${token.cssVariable}`);
    names.add(token.cssVariable);
    if (!token.path || token.path.startsWith('.') || token.path.endsWith('.')) {
      errors.push(`Invalid token path: ${token.path}`);
    }
  }
  return errors;
}

function parseSrgbColor(value: unknown): [number, number, number] | undefined {
  if (typeof value !== 'string') return undefined;
  const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
  if (!hex) return undefined;
  const expanded = hex.length === 3 ? [...hex].map((part) => `${part}${part}`).join('') : hex;
  return [0, 2, 4].map((index) => Number.parseInt(expanded.slice(index, index + 2), 16) / 255) as [
    number,
    number,
    number,
  ];
}

function relativeLuminance(rgb: [number, number, number]): number {
  const linear = rgb.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

/** Checks token color pairs against WCAG contrast thresholds. */
export function validateContrast(
  result: CompiledTokenSet,
  requirements: readonly ContrastRequirement[],
): readonly ContrastResult[] {
  const values = new Map(result.tokens.map((token) => [token.path, token.value]));
  return requirements.map((requirement) => {
    const foreground = parseSrgbColor(values.get(requirement.foreground));
    const background = parseSrgbColor(values.get(requirement.background));
    if (!foreground || !background) {
      throw new TypeError(
        `Contrast tokens must resolve to #rgb or #rrggbb colors: ${requirement.foreground}, ${requirement.background}`,
      );
    }
    const foregroundLuminance = relativeLuminance(foreground);
    const backgroundLuminance = relativeLuminance(background);
    const ratio =
      (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
      (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
    const minimum = requirement.minimum ?? 4.5;
    return { ...requirement, minimum, ratio, passes: ratio >= minimum };
  });
}

/** Emits a stable, tool-agnostic variable inventory for Figma exchange tooling. */
export function emitFigmaMetadata(result: CompiledTokenSet): readonly FigmaTokenVariable[] {
  return result.tokens.map((token) => ({
    name: token.path,
    type: token.type ?? 'unknown',
    value: token.value,
    cssVariable: token.cssVariable,
    ...(token.description ? { description: token.description } : {}),
  }));
}

/** Captures the public token shape used for compatibility comparisons. */
export function createTokenSnapshot(result: CompiledTokenSet): TokenSnapshot {
  return {
    version: 1,
    tokens: result.tokens.map(({ path, type, cssValue }) => ({
      path,
      ...(type ? { type } : {}),
      cssValue,
    })),
  };
}

/** Returns breaking changes relative to a prior snapshot. */
export function compareTokenSnapshot(
  previous: TokenSnapshot,
  current: CompiledTokenSet,
): readonly string[] {
  if (previous.version !== 1)
    throw new TypeError(`Unsupported token snapshot version: ${previous.version}`);
  const next = createTokenSnapshot(current);
  const before = new Map(previous.tokens.map((token) => [token.path, token]));
  const breaking: string[] = [];
  for (const token of next.tokens) {
    const prior = before.get(token.path);
    if (!prior) continue;
    if (prior.cssValue !== token.cssValue || prior.type !== token.type) breaking.push(token.path);
  }
  for (const token of previous.tokens) {
    if (!next.tokens.some((currentToken) => currentToken.path === token.path))
      breaking.push(token.path);
  }
  return breaking.sort();
}
