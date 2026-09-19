import { describe, expect, it } from 'vitest';
import {
  DisclosureState,
  getDirectionalDelta,
  getNextEnabledIndex,
  getSelectionRange,
  getTypeaheadMatch,
  getOverlayPosition,
  getFormControlValidity,
  FocusVisibleState,
  reorderItems,
  clampResize,
  getVirtualRange,
  ListboxState,
  filterOptions,
  RovingFocusState,
  SelectionState,
  PresenceState,
  isOutsideInteraction,
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

describe('RovingFocusState', () => {
  it('moves through enabled items', () => {
    const state = new RovingFocusState(0);
    state.move([{}, { disabled: true }, {}], 1);
    expect(state.activeIndex).toBe(2);
  });
});

describe('SelectionState', () => {
  it('supports additive selection, toggling, and clear', () => {
    const state = new SelectionState(['a']);
    state.select('b', { additive: true });
    state.toggle('a');
    expect(state.values).toEqual(['b']);
    state.clear();
    expect(state.values).toEqual([]);
  });
});

describe('typeahead and ranges', () => {
  it('matches labels with wrapping and case folding', () => {
    expect(getTypeaheadMatch(['Alpha', 'Beta', 'Bravo'], 'br', 2)).toBe(2);
    expect(getTypeaheadMatch(['Alpha', 'Beta', 'Bravo'], 'al', 0)).toBe(0);
    expect(getTypeaheadMatch(['Alpha'], 'z')).toBe(-1);
  });

  it('returns inclusive ascending or descending ranges', () => {
    expect(getSelectionRange(1, 3)).toEqual([1, 2, 3]);
    expect(getSelectionRange(3, 1)).toEqual([3, 2, 1]);
  });
});

describe('PresenceState', () => {
  it('keeps content mounted through exit transitions', () => {
    const state = new PresenceState();
    state.show();
    expect(state.phase).toBe('entering');
    expect(state.mounted).toBe(true);
    state.finishEnter();
    state.hide();
    expect(state.phase).toBe('exiting');
    expect(state.mounted).toBe(true);
    state.finishExit();
    expect(state.phase).toBe('hidden');
  });
});

describe('isOutsideInteraction', () => {
  it('uses the composed event path for shadow-dom-safe dismissal', () => {
    const boundary = new EventTarget();
    const inside = new Event('click');
    Object.defineProperty(inside, 'composedPath', { value: () => [inside, boundary] });
    const outside = new Event('click');
    Object.defineProperty(outside, 'composedPath', { value: () => [outside] });
    expect(isOutsideInteraction(inside, boundary)).toBe(false);
    expect(isOutsideInteraction(outside, boundary)).toBe(true);
  });
});

describe('getOverlayPosition', () => {
  it('places and clamps overlays within the viewport', () => {
    expect(
      getOverlayPosition(
        { x: 90, y: 90, width: 20, height: 20 },
        { width: 100, height: 40 },
        { width: 120, height: 120 },
      ),
    ).toEqual({
      x: 20,
      y: 80,
      placement: 'bottom',
    });
  });
});

describe('getFormControlValidity', () => {
  it('matches required, disabled, and custom-error semantics', () => {
    expect(getFormControlValidity({ required: true }).valueMissing).toBe(true);
    expect(getFormControlValidity({ required: true, disabled: true }).valid).toBe(true);
    expect(getFormControlValidity({ customError: 'Invalid code' })).toEqual({
      valid: false,
      valueMissing: false,
      customError: true,
      message: 'Invalid code',
    });
  });
});

describe('FocusVisibleState', () => {
  it('tracks keyboard versus pointer modality', () => {
    const state = new FocusVisibleState();
    expect(state.handleFocus()).toBe(false);
    state.handleKeyDown('Tab');
    expect(state.handleFocus()).toBe(true);
    state.handlePointerDown();
    expect(state.handleFocus()).toBe(false);
  });
});

describe('drag and resize helpers', () => {
  it('reorders without mutating the input and clamps measurements', () => {
    const items = ['a', 'b', 'c'];
    expect(reorderItems(items, 0, 2)).toEqual(['b', 'c', 'a']);
    expect(items).toEqual(['a', 'b', 'c']);
    expect(clampResize(4, 8, 20)).toBe(8);
    expect(clampResize(24, 8, 20)).toBe(20);
    expect(() => clampResize(1, 2, 0)).toThrow('minimum cannot exceed maximum');
  });
});

describe('getVirtualRange', () => {
  it('returns a bounded visible interval with overscan', () => {
    expect(getVirtualRange(100, 20, 200, 100, 2)).toEqual({ start: 8, end: 17, offset: 160 });
    expect(getVirtualRange(4, 20, 0, 100, 2)).toEqual({ start: 0, end: 4, offset: 0 });
    expect(() => getVirtualRange(10, 0, 0, 10)).toThrow('itemSize must be positive');
  });
});

describe('ListboxState', () => {
  it('skips disabled options, selects active values, and supports typeahead', () => {
    const state = new ListboxState([
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta', disabled: true },
      { value: 'c', label: 'Charlie' },
    ]);
    state.move(1);
    expect(state.activeIndex).toBe(2);
    state.select();
    expect(state.value).toBe('c');
    state.typeahead('al');
    expect(state.activeIndex).toBe(0);
  });
});

describe('filterOptions', () => {
  it('preserves option order and source indexes', () => {
    expect(
      filterOptions(
        [
          { value: 1, label: 'Alpha' },
          { value: 2, label: 'Beta' },
        ],
        'be',
      ),
    ).toEqual([{ value: 2, label: 'Beta', index: 1 }]);
  });
});
