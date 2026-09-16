import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export interface AdsRadioSelectDetail {
  value: string;
}

export const adsRadioContract = defineComponentContract({
  name: 'Radio',
  tagName: 'ads-radio',
  description: 'Accessible radio option managed by an ads-radio-group.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'checked', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void', description: 'Focuses the internal native radio input.' },
    { name: 'blur', signature: 'blur(): void', description: 'Removes focus from the internal native radio input.' },
  ],
  events: [
    {
      name: 'ads-radio-select',
      detail: '{ value: string }',
      description: 'Internal selection request consumed by ads-radio-group.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'ads-radio-meta-change',
      detail: 'void',
      description: 'Signals value/disabled metadata changes to the owning group.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [{ name: '', description: 'Radio label content.' }],
  parts: [
    { name: 'label', description: 'Clickable label wrapper.' },
    { name: 'control', description: 'Radio control positioning wrapper.' },
    { name: 'input', description: 'Native radio input.' },
    { name: 'indicator', description: 'Visual radio indicator.' },
    { name: 'label-text', description: 'Label text/content wrapper.' },
  ],
  cssCustomProperties: [
    { name: '--ads-radio-size', default: '1.125rem' },
    { name: '--ads-radio-gap', default: '0.5rem' },
    { name: '--ads-radio-border-color', default: '#8a8a93' },
    { name: '--ads-radio-background', default: '#fff' },
    { name: '--ads-radio-checked-color', default: '#111114' },
  ],
  states: [
    { name: 'checked', description: 'This option is selected by its owning group.' },
    { name: 'disabled', description: 'This option cannot be selected.' },
  ],
});

export class AdsRadio extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      color: var(--ads-radio-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='label'] {
      display: inline-flex;
      align-items: flex-start;
      gap: var(--ads-radio-gap, 0.5rem);
      cursor: pointer;
      line-height: 1.4;
    }

    [part='control'] {
      position: relative;
      display: inline-grid;
      flex: none;
      inline-size: var(--ads-radio-size, 1.125rem);
      block-size: var(--ads-radio-size, 1.125rem);
      margin-block-start: 0.08em;
    }

    input {
      position: absolute;
      z-index: 1;
      inset: 0;
      inline-size: 100%;
      block-size: 100%;
      margin: 0;
      opacity: 0;
      cursor: inherit;
    }

    [part='indicator'] {
      box-sizing: border-box;
      display: grid;
      inline-size: 100%;
      block-size: 100%;
      place-items: center;
      border: var(--ads-radio-border-width, 1px) solid var(--ads-radio-border-color, #8a8a93);
      border-radius: 50%;
      background: var(--ads-radio-background, #fff);
      transition:
        border-color var(--ads-motion-duration-fast, 120ms),
        box-shadow var(--ads-motion-duration-fast, 120ms);
    }

    [part='indicator']::after {
      inline-size: 55%;
      block-size: 55%;
      border-radius: 50%;
      background: var(--ads-radio-checked-color, #111114);
      content: '';
      opacity: 0;
      transform: scale(0.55);
      transition:
        opacity var(--ads-motion-duration-fast, 120ms),
        transform var(--ads-motion-duration-fast, 120ms);
    }

    input:focus-visible + [part='indicator'] {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    input:checked + [part='indicator'] {
      border-color: var(--ads-radio-checked-color, #111114);
    }

    input:checked + [part='indicator']::after {
      opacity: 1;
      transform: scale(1);
    }

    :host([disabled]) [part='label'],
    :host(:state(group-disabled)) [part='label'] {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    @media (prefers-reduced-motion: reduce) {
      [part='indicator'],
      [part='indicator']::after {
        transition: none;
      }
    }
  `;

  @property({ reflect: true }) value = '';
  @property() label = '';
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('input') private inputElement?: HTMLInputElement;

  #groupDisabled = false;
  #managedTabIndex = -1;
  #internals: ElementInternals;

  constructor() {
    super();
    this.#internals = this.attachInternals();
    this.#internals.role = 'radio';
  }

  get effectiveDisabled(): boolean {
    return this.disabled || this.#groupDisabled;
  }

  override updated(changed: PropertyValues<this>): void {
    this.#syncAccessibility();

    if (changed.has('value') || changed.has('disabled')) {
      this.dispatchEvent(
        new CustomEvent('ads-radio-meta-change', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.inputElement) {
      this.inputElement.focus(options);
      return;
    }
    void this.updateComplete.then(() => this.inputElement?.focus(options));
  }

  override blur(): void {
    this.inputElement?.blur();
  }

  /** @internal Managed by ads-radio-group. */
  setGroupState(checked: boolean, tabIndex: number, groupDisabled: boolean): void {
    const changed =
      this.checked !== checked ||
      this.#managedTabIndex !== tabIndex ||
      this.#groupDisabled !== groupDisabled;

    this.checked = checked;
    this.#managedTabIndex = tabIndex;
    this.#groupDisabled = groupDisabled;

    if (groupDisabled) this.#internals.states.add('group-disabled');
    else this.#internals.states.delete('group-disabled');

    if (changed) this.requestUpdate();
    this.#syncAccessibility();
  }

  private #syncAccessibility(): void {
    this.#internals.ariaChecked = String(this.checked);
    this.#internals.ariaDisabled = String(this.effectiveDisabled);

    if (this.checked) this.#internals.states.add('checked');
    else this.#internals.states.delete('checked');
  }

  private handleInput(event: Event): void {
    event.stopPropagation();
  }

  private handleChange(event: Event): void {
    event.stopPropagation();
    const input = event.currentTarget as HTMLInputElement;

    if (!input.checked || this.effectiveDisabled) {
      this.requestUpdate();
      return;
    }

    this.dispatchEvent(
      new CustomEvent<AdsRadioSelectDetail>('ads-radio-select', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    return html`
      <label part="label">
        <span part="control">
          <input
            part="input"
            type="radio"
            .checked=${this.checked}
            .tabIndex=${this.#managedTabIndex}
            ?disabled=${this.effectiveDisabled}
            @input=${this.handleInput}
            @change=${this.handleChange}
          />
          <span part="indicator" aria-hidden="true"></span>
        </span>
        <span part="label-text"><slot>${this.label}</slot></span>
      </label>
    `;
  }
}

registerAdsElement('radio', AdsRadio);

declare global {
  interface HTMLElementTagNameMap {
    'ads-radio': AdsRadio;
  }

  interface HTMLElementEventMap {
    'ads-radio-select': CustomEvent<AdsRadioSelectDetail>;
    'ads-radio-meta-change': CustomEvent<void>;
  }
}
