import { describe, expect, it } from 'vitest';
import minimalLight from './themes/minimal-light.json';
import minimalDark from './themes/minimal-dark.json';
import minimalHighContrast from './themes/minimal-high-contrast.json';
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

  it('compiles the Minimal light theme with square controls, restrained elevation, and semantic roles', () => {
    const result = compileTokens(minimalLight);
    const byPath = new Map(result.tokens.map((token) => [token.path, token]));

    expect(byPath.get('radius.control')?.cssValue).toBe('0px');
    expect(byPath.get('radius.panel')?.cssValue).toBe('0px');
    expect(byPath.get('radius.pill')?.cssValue).toBe('9999px');
    expect(byPath.get('size.control.default')?.cssValue).toBe('36px');
    expect(byPath.get('size.target.minimum')?.cssValue).toBe('44px');
    expect(byPath.get('elevation.none')?.cssValue).toContain('0px 0px 0px 0px');
    expect(byPath.get('elevation.overlay')?.cssValue).toContain('0px 12px 32px -12px');
    expect(result.css).toContain('--ads-color-surface-page:');
    expect(result.css).toContain('--ads-color-line-control:');
    expect(result.css).toContain('--ads-font-family-mono:');
  });

  it('keeps Minimal light, dark, and high-contrast theme token paths compatible', () => {
    const compiled = [minimalLight, minimalDark, minimalHighContrast].map((theme) => compileTokens(theme));
    const paths = compiled[0]!.tokens.map((token) => token.path);

    expect(compiled[1]!.tokens.map((token) => token.path)).toEqual(paths);
    expect(compiled[2]!.tokens.map((token) => token.path)).toEqual(paths);
    expect(compiled[0]!.css).not.toBe(compiled[1]!.css);
    expect(compiled[1]!.css).not.toBe(compiled[2]!.css);
  });

  it('serializes single and layered DTCG shadows into CSS box-shadow values', () => {
    const result = compileTokens({
      elevation: {
        single: {
          $type: 'shadow',
          $value: {
            color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.12 },
            offsetX: { value: 0, unit: 'px' },
            offsetY: { value: 4, unit: 'px' },
            blur: { value: 12, unit: 'px' },
            spread: { value: -4, unit: 'px' },
          },
        },
        layered: {
          $type: 'shadow',
          $value: [
            {
              color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.08 },
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 2, unit: 'px' },
              blur: { value: 8, unit: 'px' },
              spread: { value: 0, unit: 'px' },
            },
            {
              color: { colorSpace: 'srgb', components: [0, 0, 0], alpha: 0.04 },
              offsetX: { value: 0, unit: 'px' },
              offsetY: { value: 8, unit: 'px' },
              blur: { value: 24, unit: 'px' },
              spread: { value: -8, unit: 'px' },
            },
          ],
        },
      },
    });

    expect(result.tokens.find((token) => token.path === 'elevation.single')?.cssValue)
      .toBe('0px 4px 12px -4px color(srgb 0 0 0 / 0.12)');
    expect(result.tokens.find((token) => token.path === 'elevation.layered')?.cssValue)
      .toContain(', ');
  });

});
