import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { AdsCheckbox } from './checkbox.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsCheckboxGroupOrientation = 'horizontal' | 'vertical';

export const adsCheckboxGroupContract = defineComponentContract({
  name: 'Checkbox Group',
  tagName: 'ads-checkbox-group',
  description:
    'Form-associated multi-selection group for ads-checkbox children with multi-value FormData semantics.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: 'vertical' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'values', type: 'string[]', description: 'Selected checkbox values.' },
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void' },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  events: [
    {
      name: 'input',
      detail: 'Event',
      description: 'Dispatched when user interaction changes the selected values.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'change',
      detail: 'Event',
      description: 'Dispatched after user interaction commits selected values.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [
    { name: '', description: 'ads-checkbox children. Child name attributes should be omitted.' },
    { name: 'label', description: 'Group legend.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation error text.' },
  ],
  parts: [
    { name: 'fieldset', description: 'Native fieldset group.' },
    { name: 'label', description: 'Native legend.' },
    { name: 'group', description: 'Checkbox layout container.' },
    { name: 'description', description: 'Description region.' },
    { name: 'error', description: 'Error region.' },
  ],
  cssCustomProperties: [
    { name: '--ads-checkbox-group-gap', default: '0.625rem' },
    { name: '--ads-checkbox-group-label-gap', default: '0.5rem' },
    { name: '--ads-checkbox-group-message-gap', default: '0.5rem' },
  ],
  states: [
    { name: 'invalid', description: 'Required/custom group validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

export class AdsCheckboxGroup extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-checkbox-group-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    fieldset {
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }

    [part='label'] {
      margin: 0 0 var(--ads-checkbox-group-label-gap, 0.5rem);
      padding: 0;
      font-size: var(--ads-checkbox-group-label-font-size, 0.875rem);
      font-weight: var(--ads-checkbox-group-label-font-weight, 600);
      line-height: 1.3;
    }

    [part='group'] {
      display: flex;
      gap: var(--ads-checkbox-group-gap, 0.625rem);
    }

    :host([orientation='vertical']) [part='group'] {
      flex-direction: column;
      align-items: flex-start;
    }

    :host([orientation='horizontal']) [part='group'] {
      flex-flow: row wrap;
      align-items: center;
    }

    [part='description'],
    [part='error'] {
      margin-block-start: var(--ads-checkbox-group-message-gap, 0.5rem);
      font-size: var(--ads-checkbox-group-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-checkbox-group-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-checkbox-group-error-color, #b42318);
    }

    :host([disabled]) [part='fieldset'],
    :host(:state(form-disabled)) [part='fieldset'] {
      opacity: var(--ads-disabled-opacity, 0.5);
    }
  `;

  @property({ reflect: true }) name = '';
  @property() label = '';
  @property({ attribute: false }) values: string[] = [];
  @property({ reflect: true }) orientation: AdsCheckboxGroupOrientation = 'vertical';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;

  @query('slot:not([name])') private optionsSlot?: HTMLSlotElement;
  @query('fieldset') private fieldsetElement?: HTMLFieldSetElement;
  @state() private invalid = false;

  private defaultValues: string[] = [];
  private defaultCaptured = false;
  private customValidityMessage = '';
  private observer?: MutationObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new MutationObserver(() => {
      void this.updateComplete.then(() => this.syncFromChildren());
    });
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['checked', 'value', 'disabled'],
    });
  }

  override disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    for (const checkbox of this.checkboxes) checkbox.setGroupDisabled(false);
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this.syncCheckboxes();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('values') ||
      changed.has('disabled') ||
      changed.has('required') ||
      changed.has('name') ||
      changed.has('orientation')
    ) {
      this.syncCheckboxes();
    }
  }

  override focus(options?: FocusOptions): void {
    const target =
      this.checkboxes.find((checkbox) => checkbox.checked && !checkbox.disabled) ??
      this.checkboxes.find((checkbox) => !checkbox.disabled);
    target?.focus(options);
  }

  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    this.syncCheckboxes();
  }

  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncCheckboxes());
  }

  formResetCallback(): void {
    this.values = [...this.defaultValues];
    this.syncCheckboxes();
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    try {
      const parsed: unknown = JSON.parse(state);
      if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')) {
        this.values = [...parsed];
        this.syncCheckboxes();
      }
    } catch {
      // Ignore malformed state supplied by the platform.
    }
  }

  private get checkboxes(): AdsCheckbox[] {
    return (this.optionsSlot?.assignedElements({ flatten: true }) ?? []).filter(
      (element): element is AdsCheckbox => element instanceof AdsCheckbox,
    );
  }

  private get groupDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

  private captureDefaults(): void {
    if (this.defaultCaptured) return;
    const selected = this.values.length
      ? [...this.values]
      : this.checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
    this.defaultValues = selected;
    this.defaultCaptured = true;
    if (!this.values.length && selected.length) this.values = [...selected];
  }

  private syncFromChildren(): void {
    this.captureDefaults();
    this.values = this.checkboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);
    this.syncCheckboxes();
  }

  private syncCheckboxes(): void {
    const checkboxes = this.checkboxes;
    this.captureDefaults();
    const selected = new Set(this.values);
    const disabled = this.groupDisabled;

    for (const checkbox of checkboxes) {
      checkbox.setGroupDisabled(disabled);
      const shouldBeChecked = selected.has(checkbox.value);
      if (checkbox.checked !== shouldBeChecked) checkbox.checked = shouldBeChecked;
    }

    this.internals.ariaDisabled = String(disabled);

    if (disabled || !this.name) {
      this.setFormValue(null, JSON.stringify(this.values));
    } else {
      const formData = new FormData();
      for (const value of this.values) formData.append(this.name, value);
      this.setFormValue(formData, JSON.stringify(this.values));
    }

    if (this.customValidityMessage) {
      this.applyValidity({ customError: true }, this.customValidityMessage);
      return;
    }

    if (this.required && this.values.length === 0 && !disabled) {
      this.applyValidity({ valueMissing: true }, 'Please select at least one option.');
      return;
    }

    this.applyValidity({});
  }

  private applyValidity(flags: ValidityStateFlags, message = ''): void {
    const invalid = Object.values(flags).some(Boolean);
    this.setValidity(flags, message, this.fieldsetElement);
    this.invalid = invalid;
    this.internals.ariaInvalid = String(invalid);

    if (invalid) this.internals.states.add('invalid');
    else this.internals.states.delete('invalid');
  }

  private handleInput(event: Event): void {
    if (!event.composedPath().some((node) => node instanceof AdsCheckbox)) return;
    event.stopPropagation();
    this.syncFromChildren();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }

  private handleChange(event: Event): void {
    if (!event.composedPath().some((node) => node instanceof AdsCheckbox)) return;
    event.stopPropagation();
    this.syncFromChildren();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  private handleSlotChange(): void {
    this.syncFromChildren();
  }

  override render() {
    return html`
      <fieldset
        part="fieldset"
        ?disabled=${this.groupDisabled}
        aria-describedby="description error"
        aria-required=${this.required ? 'true' : 'false'}
        aria-invalid=${this.invalid ? 'true' : 'false'}
      >
        <legend part="label"><slot name="label">${this.label}</slot></legend>
        <div part="group" @input=${this.handleInput} @change=${this.handleChange}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <div id="description" part="description"><slot name="description"></slot></div>
        <div id="error" part="error" role="alert"><slot name="error"></slot></div>
      </fieldset>
    `;
  }
}

registerAdsElement('checkbox-group', AdsCheckboxGroup);

declare global {
  interface HTMLElementTagNameMap {
    'ads-checkbox-group': AdsCheckboxGroup;
  }
}
