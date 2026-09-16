import { describe, expect, it } from 'vitest';
import { compileTokens } from './index.js';

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
});
