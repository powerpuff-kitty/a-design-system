import { describe, expect, it } from 'vitest';
import { rankCommandPaletteItems } from './command-palette.js';

const items = [
  { id: 'palette', label: 'Palette', description: 'Edit artwork colors', keywords: ['color', 'swatch'] },
  { id: 'color-space', label: 'Color Space', description: 'Explore colors in 3D', keywords: ['3d', 'oklab'] },
  { id: 'undo', label: 'Undo', description: 'Move back in history', keywords: ['history', 'revert'] },
];

describe('rankCommandPaletteItems', () => {
  it('preserves source order for an empty query', () => {
    expect(rankCommandPaletteItems(items, '').map((entry) => entry.item.id)).toEqual([
      'palette',
      'color-space',
      'undo',
    ]);
  });

  it('ranks exact and prefix label matches before keyword matches', () => {
    expect(rankCommandPaletteItems(items, 'color').map((entry) => entry.item.id)).toEqual([
      'color-space',
      'palette',
    ]);
  });

  it('requires every query term and uses keywords/descriptions deterministically', () => {
    expect(rankCommandPaletteItems(items, '3d oklab').map((entry) => entry.item.id)).toEqual([
      'color-space',
    ]);
    expect(rankCommandPaletteItems(items, 'history').map((entry) => entry.item.id)).toEqual([
      'undo',
    ]);
  });
});
