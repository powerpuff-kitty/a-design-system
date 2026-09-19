import { describe, expect, it } from 'vitest';
import {
  compileTokenModes,
  compileTokens,
  compareTokenSnapshot,
  createTokenSnapshot,
  emitTokenOutputs,
  emitFigmaMetadata,
  validateContrast,
  validateTokens,
} from './index.js';

describe('compileTokens', () => {
  it('resolves aliases and emits deterministic ADS CSS variables', () => {
    const result = compileTokens({
      color: {
        $type: 'color',
        neutral: {
          0: {
            $value: { colorSpace: 'srgb', components: [1, 1, 1], alpha: 1 },
          },
        },
        surface: {
          default: { $value: '{color.neutral.0}' },
        },
      },
      space: {
        2: { $type: 'dimension', $value: { value: 8, unit: 'px' } },
      },
    });

    expect(result.tokens.map((token) => token.path)).toEqual([
      'color.neutral.0',
      'color.surface.default',
      'space.2',
    ]);
    expect(result.tokens[1]?.value).toEqual({
      colorSpace: 'srgb',
      components: [1, 1, 1],
      alpha: 1,
    });
    expect(result.css).toContain('--ads-color-surface-default: color(srgb 1 1 1 / 1);');
    expect(result.css).toContain('--ads-space-2: 8px;');
  });

  it('supports custom prefixes and selectors', () => {
    const result = compileTokens(
      { radius: { control: { $type: 'dimension', $value: { value: 6, unit: 'px' } } } },
      { prefix: 'acme', selector: ':host' },
    );

    expect(result.css).toBe(':host {\n  --acme-radius-control: 6px;\n}\n');
  });

  it('fails on unknown references', () => {
    expect(() => compileTokens({ color: { surface: { $value: '{color.missing}' } } })).toThrow(
      'Unknown token reference',
    );
  });

  it('fails on circular references', () => {
    expect(() =>
      compileTokens({
        a: { $value: '{b}' },
        b: { $value: '{a}' },
      }),
    ).toThrow('Circular token reference detected');
  });

  it('emits deterministic JSON, TypeScript, and SCSS artifacts', () => {
    const result = compileTokens({
      space: { 2: { $type: 'dimension', $value: { value: 8, unit: 'px' } } },
    });
    const output = emitTokenOutputs(result);
    expect(output.json).toBe('{\n  "space.2": {\n    "value": 8,\n    "unit": "px"\n  }\n}\n');
    expect(output.typescript).toContain('export const tokens =');
    expect(output.scss).toBe('$space-2: 8px;\n');
    expect(validateTokens({ space: { 2: { $value: 8 } } })).toEqual([]);
  });

  it('compiles isolated named modes into scoped theme CSS', () => {
    const result = compileTokenModes([
      { name: 'light', source: { color: { $value: '#fff' } } },
      { name: 'dark', source: { color: { $value: '#000' } } },
    ]);

    expect(result.modes.map((mode) => mode.name)).toEqual(['light', 'dark']);
    expect(result.css).toBe(
      '[data-ads-theme="light"] {\n  --ads-color: #fff;\n}\n[data-ads-theme="dark"] {\n  --ads-color: #000;\n}\n',
    );
    expect(() =>
      compileTokenModes([
        { name: 'light', source: {} },
        { name: 'light', source: {} },
      ]),
    ).toThrow('Duplicate or empty token mode');
  });

  it('validates semantic color contrast ratios', () => {
    const result = compileTokens({
      text: { $value: '#000000' },
      surface: { $value: '#ffffff' },
    });
    const [contrast] = validateContrast(result, [{ foreground: 'text', background: 'surface' }]);
    expect(contrast?.passes).toBe(true);
    expect(contrast?.ratio).toBe(21);
    expect(() =>
      validateContrast(result, [{ foreground: 'missing', background: 'surface' }]),
    ).toThrow('Contrast tokens must resolve');
  });

  it('emits Figma metadata and detects snapshot-breaking changes', () => {
    const result = compileTokens({
      color: { $description: 'Surface color', surface: { $type: 'color', $value: '#ffffff' } },
    });
    expect(emitFigmaMetadata(result)).toEqual([
      {
        name: 'color.surface',
        type: 'color',
        value: '#ffffff',
        cssVariable: '--ads-color-surface',
      },
    ]);
    const snapshot = createTokenSnapshot(result);
    expect(
      compareTokenSnapshot(snapshot, compileTokens({ color: { surface: { $value: '#000' } } })),
    ).toEqual(['color.surface']);
    expect(compareTokenSnapshot(snapshot, result)).toEqual([]);
  });
});
