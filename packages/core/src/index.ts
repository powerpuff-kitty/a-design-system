export * from './component-contract.js';

export type AdsOrientation = 'horizontal' | 'vertical';
export type AdsDirection = 'ltr' | 'rtl';

export interface FocusCandidate {
  disabled?: boolean;
}

/** Returns the next enabled item for composite widgets such as menus and tabs. */
export function getNextEnabledIndex(
  items: readonly FocusCandidate[],
  currentIndex: number,
  delta: 1 | -1,
  loop = true,
): number {
  if (items.length === 0) return -1;

  let index = currentIndex;
  for (let visited = 0; visited < items.length; visited += 1) {
    index += delta;

    if (loop) {
      index = (index + items.length) % items.length;
    } else if (index < 0 || index >= items.length) {
      return currentIndex;
    }

    if (!items[index]?.disabled) return index;
  }

  return currentIndex;
}

export function getDirectionalDelta(
  key: string,
  orientation: AdsOrientation,
  direction: AdsDirection = 'ltr',
): 1 | -1 | 0 {
  if (orientation === 'vertical') {
    if (key === 'ArrowDown') return 1;
    if (key === 'ArrowUp') return -1;
    return 0;
  }

  if (key === 'ArrowRight') return direction === 'rtl' ? -1 : 1;
  if (key === 'ArrowLeft') return direction === 'rtl' ? 1 : -1;
  return 0;
}

/** Small framework-free disclosure state primitive used by accordion/dialog-like components. */
export class DisclosureState extends EventTarget {
  #open: boolean;

  constructor(initialOpen = false) {
    super();
    this.#open = initialOpen;
  }

  get open(): boolean {
    return this.#open;
  }

  set open(next: boolean) {
    if (next === this.#open) return;
    this.#open = next;
    this.dispatchEvent(new Event('change'));
  }

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  toggle(): void {
    this.open = !this.open;
  }
}
