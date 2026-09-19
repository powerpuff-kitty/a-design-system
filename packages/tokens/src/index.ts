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

export interface CompiledTokenSet {
  tokens: readonly CompiledToken[];
  css: string;
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

function serializeColorObject(value: JsonRecord): string | undefined {
  if (typeof value.colorSpace !== 'string' || !Array.isArray(value.components)) return undefined;
  const components = value.components
    .map((component) => typeof component === 'number' ? formatNumber(component) : String(component))
    .join(' ');
  const alpha = typeof value.alpha === 'number' ? formatNumber(value.alpha) : '1';
  const colorSpace = value.colorSpace.toLowerCase();

  if (colorSpace === 'srgb' || colorSpace === 'srgb-linear' || colorSpace === 'display-p3') {
    return `color(${colorSpace} ${components} / ${alpha})`;
  }

  return `${colorSpace}(${components} / ${alpha})`;
}

function serializeShadow(value: unknown): string {
  const shadows = Array.isArray(value) ? value : [value];
  return shadows.map((entry) => {
    if (!isRecord(entry)) throw new TypeError('Shadow token must be an object or array of objects');
    const color = isRecord(entry.color) ? serializeColorObject(entry.color) : undefined;
    if (!color) throw new TypeError('Shadow token requires a DTCG color object');
    const offsetX = serializeCssValue(entry.offsetX, 'dimension');
    const offsetY = serializeCssValue(entry.offsetY, 'dimension');
    const blur = serializeCssValue(entry.blur, 'dimension');
    const spread = serializeCssValue(entry.spread ?? { value: 0, unit: 'px' }, 'dimension');
    return `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
  }).join(', ');
}

function serializeCssValue(value: unknown, type?: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (type === 'shadow') return serializeShadow(value);
    if (type === 'cubicBezier' && value.length === 4 && value.every((item) => typeof item === 'number')) {
      return `cubic-bezier(${value.map((item) => formatNumber(item as number)).join(', ')})`;
    }
    return value.map((item) => serializeCssValue(item)).join(' ');
  }

  if (isRecord(value)) {
    if (typeof value.value === 'number' && typeof value.unit === 'string') {
      return `${formatNumber(value.value)}${value.unit}`;
    }

    if (type === 'color') {
      const color = serializeColorObject(value);
      if (color) return color;
    }

    if (type === 'shadow') return serializeShadow(value);

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
export function compileTokens(source: unknown, options: CompileTokensOptions = {}): CompiledTokenSet {
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
      throw new TypeError(`Circular token reference detected: ${[...resolving, path].join(' -> ')}`);
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
      const description = typeof item.token.$description === 'string' ? item.token.$description : undefined;

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

  const declarations = tokens.map((token) => `  ${token.cssVariable}: ${token.cssValue};`).join('\n');
  const css = `${selector} {\n${declarations}\n}\n`;

  return { tokens, css };
}
