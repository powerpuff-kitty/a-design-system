export * from './component-contract.js';
export * from './format.js';

export type AdsOrientation = 'horizontal' | 'vertical';
export type AdsDirection = 'ltr' | 'rtl';

export interface FocusCandidate {
  disabled?: boolean;
}

export class RovingFocusState extends EventTarget {
  #activeIndex: number;
  constructor(initialIndex = 0) {
    super();
    this.#activeIndex = initialIndex;
  }
  get activeIndex(): number {
    return this.#activeIndex;
  }
  move(items: readonly FocusCandidate[], delta: 1 | -1, loop = true): number {
    const next = getNextEnabledIndex(items, this.#activeIndex, delta, loop);
    if (next !== this.#activeIndex) {
      this.#activeIndex = next;
      this.dispatchEvent(new Event('change'));
    }
    return this.#activeIndex;
  }
  setActive(index: number, items: readonly FocusCandidate[]): void {
    if (!items[index] || items[index]?.disabled || index === this.#activeIndex) return;
    this.#activeIndex = index;
    this.dispatchEvent(new Event('change'));
  }
}

export class SelectionState<T> extends EventTarget {
  #selected: Set<T>;
  constructor(initial: Iterable<T> = []) {
    super();
    this.#selected = new Set(initial);
  }
  has(value: T): boolean {
    return this.#selected.has(value);
  }
  get values(): readonly T[] {
    return [...this.#selected];
  }
  select(value: T, options: { additive?: boolean } = {}): void {
    const next = options.additive ? new Set(this.#selected) : new Set<T>();
    next.add(value);
    this.replace(next);
  }
  toggle(value: T): void {
    const next = new Set(this.#selected);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    this.replace(next);
  }
  clear(): void {
    this.replace(new Set());
  }
  private replace(next: Set<T>): void {
    if (next.size === this.#selected.size && [...next].every((value) => this.#selected.has(value)))
      return;
    this.#selected = next;
    this.dispatchEvent(new Event('change'));
  }
}

/** Finds the next label beginning with a typeahead buffer, wrapping at the end. */
export function getTypeaheadMatch(
  labels: readonly string[],
  query: string,
  currentIndex = -1,
): number {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized || labels.length === 0) return -1;
  for (let offset = 1; offset <= labels.length; offset += 1) {
    const index = (currentIndex + offset) % labels.length;
    if (labels[index]?.toLocaleLowerCase().startsWith(normalized)) return index;
  }
  return -1;
}

/** Returns inclusive indexes between two positions, useful for range selection. */
export function getSelectionRange(start: number, end: number): readonly number[] {
  const step = start <= end ? 1 : -1;
  return Array.from({ length: Math.abs(end - start) + 1 }, (_, index) => start + index * step);
}

export type PresencePhase = 'hidden' | 'entering' | 'visible' | 'exiting';

/** Coordinates mount/unmount with open/close transitions without DOM assumptions. */
export class PresenceState extends EventTarget {
  #phase: PresencePhase;
  constructor(initialVisible = false) {
    super();
    this.#phase = initialVisible ? 'visible' : 'hidden';
  }
  get phase(): PresencePhase {
    return this.#phase;
  }
  get mounted(): boolean {
    return this.#phase !== 'hidden';
  }
  show(): void {
    this.set('entering');
  }
  finishEnter(): void {
    this.set('visible');
  }
  hide(): void {
    if (this.mounted) this.set('exiting');
  }
  finishExit(): void {
    this.set('hidden');
  }
  private set(next: PresencePhase): void {
    if (next === this.#phase) return;
    this.#phase = next;
    this.dispatchEvent(new Event('change'));
  }
}

/** Identifies whether an event occurred outside a dismissable layer. */
export function isOutsideInteraction(event: Event, boundary: EventTarget): boolean {
  return !event.composedPath().includes(boundary);
}

export type OverlayPlacement = 'top' | 'right' | 'bottom' | 'left';
export interface OverlayRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface OverlayPosition {
  x: number;
  y: number;
  placement: OverlayPlacement;
}

/** Positions an overlay around an anchor and clamps it inside the viewport. */
export function getOverlayPosition(
  anchor: OverlayRect,
  overlay: Pick<OverlayRect, 'width' | 'height'>,
  viewport: Pick<OverlayRect, 'width' | 'height'>,
  placement: OverlayPlacement = 'bottom',
  gap = 8,
): OverlayPosition {
  const candidates: Record<OverlayPlacement, OverlayPosition> = {
    top: {
      x: anchor.x + (anchor.width - overlay.width) / 2,
      y: anchor.y - overlay.height - gap,
      placement: 'top',
    },
    right: {
      x: anchor.x + anchor.width + gap,
      y: anchor.y + (anchor.height - overlay.height) / 2,
      placement: 'right',
    },
    bottom: {
      x: anchor.x + (anchor.width - overlay.width) / 2,
      y: anchor.y + anchor.height + gap,
      placement: 'bottom',
    },
    left: {
      x: anchor.x - overlay.width - gap,
      y: anchor.y + (anchor.height - overlay.height) / 2,
      placement: 'left',
    },
  };
  const candidate = candidates[placement];
  return {
    ...candidate,
    x: Math.min(Math.max(0, candidate.x), Math.max(0, viewport.width - overlay.width)),
    y: Math.min(Math.max(0, candidate.y), Math.max(0, viewport.height - overlay.height)),
  };
}

export interface FormControlStateOptions {
  value?: string | null;
  required?: boolean;
  disabled?: boolean;
  customError?: string;
}

export interface FormControlValidity {
  valid: boolean;
  valueMissing: boolean;
  customError: boolean;
  message: string;
}

/** Computes portable validity flags for controls that mirror native forms. */
export function getFormControlValidity(options: FormControlStateOptions = {}): FormControlValidity {
  const valueMissing =
    !options.disabled && Boolean(options.required) && !(options.value ?? '').trim();
  const customError = !options.disabled && Boolean(options.customError);
  return {
    valid: !valueMissing && !customError,
    valueMissing,
    customError,
    message: options.disabled
      ? ''
      : options.customError || (valueMissing ? 'Please fill out this field.' : ''),
  };
}

/** Tracks input modality so focus indicators can follow :focus-visible semantics. */
export class FocusVisibleState extends EventTarget {
  #keyboard = false;
  get keyboard(): boolean {
    return this.#keyboard;
  }
  handleKeyDown(key: string): void {
    if (key === 'Tab' || key.startsWith('Arrow') || key === 'Enter' || key === ' ') this.set(true);
  }
  handlePointerDown(): void {
    this.set(false);
  }
  handleFocus(): boolean {
    return this.#keyboard;
  }
  private set(next: boolean): void {
    if (next === this.#keyboard) return;
    this.#keyboard = next;
    this.dispatchEvent(new Event('change'));
  }
}

/** Moves one item to a new index without mutating the input collection. */
export function reorderItems<T>(items: readonly T[], from: number, to: number): readonly T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return [...items];
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

/** Clamps a resize measurement to its allowed range. */
export function clampResize(value: number, minimum: number, maximum: number): number {
  if (minimum > maximum) throw new RangeError('Resize minimum cannot exceed maximum');
  return Math.min(Math.max(value, minimum), maximum);
}

export interface VirtualRange {
  start: number;
  end: number;
  offset: number;
}

/** Calculates the mounted item interval for a fixed-size virtual list. */
export function getVirtualRange(
  itemCount: number,
  itemSize: number,
  scrollOffset: number,
  viewportSize: number,
  overscan = 2,
): VirtualRange {
  if (itemCount < 0 || itemSize <= 0 || viewportSize < 0 || overscan < 0) {
    throw new RangeError(
      'Virtual list dimensions must be non-negative and itemSize must be positive',
    );
  }
  const firstVisible = Math.min(itemCount, Math.max(0, Math.floor(scrollOffset / itemSize)));
  const visibleCount = Math.ceil(viewportSize / itemSize);
  const start = Math.max(0, firstVisible - overscan);
  const end = Math.min(itemCount, firstVisible + visibleCount + overscan);
  return { start, end, offset: start * itemSize };
}

export interface ListboxOption<T> {
  value: T;
  label: string;
  disabled?: boolean;
}

/** State machine for single-select listbox-like composites. */
export class ListboxState<T> extends EventTarget {
  #options: readonly ListboxOption<T>[];
  #activeIndex: number;
  #selectedIndex: number;
  constructor(options: readonly ListboxOption<T>[], selectedIndex = -1) {
    super();
    this.#options = options;
    this.#selectedIndex = selectedIndex;
    this.#activeIndex =
      selectedIndex >= 0 ? selectedIndex : getNextEnabledIndex(options, -1, 1, true);
  }
  get activeIndex(): number {
    return this.#activeIndex;
  }
  get selectedIndex(): number {
    return this.#selectedIndex;
  }
  get value(): T | undefined {
    return this.#options[this.#selectedIndex]?.value;
  }
  move(delta: 1 | -1): void {
    const next = getNextEnabledIndex(this.#options, this.#activeIndex, delta);
    if (next !== this.#activeIndex) {
      this.#activeIndex = next;
      this.dispatchEvent(new Event('change'));
    }
  }
  select(index = this.#activeIndex): void {
    if (!this.#options[index] || this.#options[index]?.disabled || index === this.#selectedIndex)
      return;
    this.#activeIndex = index;
    this.#selectedIndex = index;
    this.dispatchEvent(new Event('change'));
  }
  typeahead(query: string): void {
    const labels = this.#options.map((option) => (option.disabled ? '' : option.label));
    const next = getTypeaheadMatch(labels, query, this.#activeIndex);
    if (next >= 0) {
      this.#activeIndex = next;
      this.dispatchEvent(new Event('change'));
    }
  }
}

/** Filters listbox options by a case-insensitive label query while preserving order. */
export function filterOptions<T>(
  options: readonly ListboxOption<T>[],
  query: string,
): readonly (ListboxOption<T> & { index: number })[] {
  const normalized = query.trim().toLocaleLowerCase();
  return options.flatMap((option, index) =>
    !normalized || option.label.toLocaleLowerCase().includes(normalized)
      ? [{ ...option, index }]
      : [],
  );
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
