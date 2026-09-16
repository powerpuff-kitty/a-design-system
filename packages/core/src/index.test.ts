import { describe, expect, it } from 'vitest';
import {
  DisclosureState,
  getDirectionalDelta,
  getNextEnabledIndex,
} from './index.js';

describe('getNextEnabledIndex', () => {
  it('skips disabled items and loops by default', () => {
    const items = [{}, { disabled: true }, {}];

    expect(getNextEnabledIndex(items, 0, 1)).toBe(2);
    expect(getNextEnabledIndex(items, 2, 1)).toBe(0);
  });

  it('stays on the current item when looping is disabled at an edge', () => {
    expect(getNextEnabledIndex([{}, {}], 1, 1, false)).toBe(1);
  });
});

describe('getDirectionalDelta', () => {
  it('reverses horizontal arrow direction for RTL', () => {
    expect(getDirectionalDelta('ArrowRight', 'horizontal', 'ltr')).toBe(1);
    expect(getDirectionalDelta('ArrowRight', 'horizontal', 'rtl')).toBe(-1);
  });

  it('keeps vertical navigation independent of text direction', () => {
    expect(getDirectionalDelta('ArrowDown', 'vertical', 'rtl')).toBe(1);
  });
});

describe('DisclosureState', () => {
  it('emits change only when state actually changes', () => {
    const state = new DisclosureState(false);
    let changes = 0;
    state.addEventListener('change', () => {
      changes += 1;
    });

    state.hide();
    state.show();
    state.show();
    state.toggle();

    expect(state.open).toBe(false);
    expect(changes).toBe(2);
  });
});
