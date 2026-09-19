import { defineComponentContract } from '@a-design-system/core';
import { css, html, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { AdsCheckbox } from './checkbox.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsCheckboxGroupOrientation = 'horizontal' | 'vertical';
export const adsCheckboxGroupContract = defineComponentContract({
  name: 'Checkbox Group', tagName: 'ads-checkbox-group',
  description: 'Form-associated multi-selection group for ads-checkbox children with multi-value FormData semantics.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'orientation', type: "'horizontal' | 'vertical'", default: 'vertical' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'values', type: 'string[]', description: 'Selected checkbox values. Replace the array to update selection.' },
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
    { name: 'input', detail: 'Event', description: 'Dispatched when user interaction changes the selected values.', bubbles: true, composed: true },
    { name: 'change', detail: 'Event', description: 'Dispatched after user interaction commits selected values.', bubbles: true, composed: true },
  ],
  slots: [
    { name: '', description: 'Direct ads-checkbox children. Omit child name attributes; the group owns submission.' },
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
    { name: '--ads-checkbox-group-color', default: 'var(--ads-color-text-default, #111114)' },
    { name: '--ads-checkbox-group-description-color', default: 'var(--ads-color-text-muted, #606068)' },
    { name: '--ads-checkbox-group-error-color', default: 'var(--ads-color-status-danger, #b42318)' },
  ],
  states: [
    { name: 'invalid', description: 'Required/custom group validation currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

function sameValues(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export class AdsCheckboxGroup extends FormAssociatedElement {
  static override styles = css`
    :host { display: block; color: var(--ads-checkbox-group-color, var(--ads-color-text-default, #111114)); font: inherit; }
    :host([hidden]) { display: none; }
    fieldset { min-inline-size: 0; margin: 0; padding: 0; border: 0; }
    [part='label'] { margin: 0 0 var(--ads-checkbox-group-label-gap, 0.5rem); padding: 0; font-size: var(--ads-checkbox-group-label-font-size, 0.875rem); font-weight: var(--ads-checkbox-group-label-font-weight, 600); line-height: 1.3; }
    [part='group'] { display: flex; flex-direction: column; align-items: flex-start; gap: var(--ads-checkbox-group-gap, 0.625rem); }
    :host([orientation='horizontal']) [part='group'] { flex-flow: row wrap; align-items: center; }
    [part='description'], [part='error'] { margin-block-start: var(--ads-checkbox-group-message-gap, 0.5rem); font-size: var(--ads-checkbox-group-message-font-size, 0.8125rem); line-height: 1.4; }
    [part='description'] { color: var(--ads-checkbox-group-description-color, var(--ads-color-text-muted, #606068)); }
    [part='error'] { color: var(--ads-checkbox-group-error-color, var(--ads-color-status-danger, #b42318)); }
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
  private observer: MutationObserver | undefined;
  private managed = new Set<AdsCheckbox>();

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new MutationObserver(() => {
      void this.updateComplete.then(() => this.syncFromChildren());
    });
    this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['checked', 'value', 'disabled'] });
    if (this.hasUpdated) void this.updateComplete.then(() => this.syncCheckboxes());
  }
  override disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    for (const checkbox of this.managed) checkbox.setGroupDisabled(false);
    this.managed.clear();
    super.disconnectedCallback();
  }
  override firstUpdated(): void { this.syncCheckboxes(); }
  override updated(changed: PropertyValues<this>): void {
    if (changed.has('values') || changed.has('disabled') || changed.has('required') || changed.has('name')) this.syncCheckboxes();
  }
  override focus(options?: FocusOptions): void {
    if (this.groupDisabled) return;
    const target = this.checkboxes.find((checkbox) => checkbox.checked && !checkbox.disabled) ?? this.checkboxes.find((checkbox) => !checkbox.disabled);
    if (target) target.focus(options);
    else if (!this.hasUpdated) void this.updateComplete.then(() => this.focus(options));
  }
  setCustomValidity(message: string): void { this.customValidityMessage = message; this.syncCheckboxes(); }
  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncCheckboxes());
  }
  formResetCallback(): void { this.values = [...this.defaultValues]; this.syncCheckboxes(); }
  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    try {
      const parsed: unknown = JSON.parse(state);
      if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')) {
        this.values = [...parsed];
        this.syncCheckboxes();
      }
    } catch { /* Ignore malformed platform state. */ }
  }
  private get checkboxes(): AdsCheckbox[] {
    return (this.optionsSlot?.assignedElements({ flatten: true }) ?? []).filter((element): element is AdsCheckbox => element instanceof AdsCheckbox);
  }
  private get groupDisabled(): boolean { return this.disabled || this.formDisabled; }
  private captureDefaults(): void {
    if (this.defaultCaptured || !this.optionsSlot) return;
    const selected = this.values.length ? [...this.values] : this.checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
    this.defaultValues = selected;
    this.defaultCaptured = true;
    if (!sameValues(this.values, selected)) this.values = [...selected];
  }
  private syncFromChildren(): void {
    this.captureDefaults();
    const selected = this.checkboxes.filter((checkbox) => checkbox.checked).map((checkbox) => checkbox.value);
    if (!sameValues(this.values, selected)) this.values = selected;
    this.syncCheckboxes();
  }
  private syncCheckboxes(): void {
    if (!this.optionsSlot) return;
    const checkboxes = this.checkboxes;
    this.captureDefaults();
    const selected = new Set(this.values);
    const disabled = this.groupDisabled;
    for (const old of this.managed) if (!checkboxes.includes(old)) old.setGroupDisabled(false);
    this.managed = new Set(checkboxes);
    for (const checkbox of checkboxes) {
      checkbox.setGroupDisabled(disabled);
      const checked = selected.has(checkbox.value);
      if (checkbox.checked !== checked) checkbox.checked = checked;
    }
    this.internals.ariaDisabled = String(disabled);
    if (disabled) this.internals.states.add('disabled');
    else this.internals.states.delete('disabled');
    // Requested/disabled values may remain in state, but only real enabled options submit.
    const successful = checkboxes.filter((checkbox) => checkbox.checked && !checkbox.disabled);
    const state = JSON.stringify(this.values);
    if (disabled || !this.name) this.setFormValue(null, state);
    else {
      const data = new FormData();
      for (const checkbox of successful) data.append(this.name, checkbox.value);
      this.setFormValue(data, state);
    }
    if (disabled) this.applyValidity({});
    else if (this.customValidityMessage) this.applyValidity({ customError: true }, this.customValidityMessage);
    else if (this.required && !successful.length) this.applyValidity({ valueMissing: true }, 'Please select at least one option.');
    else this.applyValidity({});
  }
  private applyValidity(flags: ValidityStateFlags, message = ''): void {
    this.invalid = Object.values(flags).some(Boolean);
    this.setValidity(flags, message, this.fieldsetElement);
    this.internals.ariaInvalid = String(this.invalid);
    if (this.invalid) this.internals.states.add('invalid');
    else this.internals.states.delete('invalid');
  }
  private handleSelection(event: Event): void {
    const source = event.composedPath().find((node): node is AdsCheckbox => node instanceof AdsCheckbox);
    if (!source || !this.checkboxes.includes(source)) return;
    event.stopPropagation();
    this.syncFromChildren();
    this.dispatchEvent(new Event(event.type, { bubbles: true, composed: true }));
  }
  override render() {
    return html`
      <fieldset part="fieldset" ?disabled=${this.groupDisabled} aria-describedby="description error" aria-invalid=${String(this.invalid)}>
        <legend part="label"><slot name="label">${this.label}</slot></legend>
        <div part="group" @input=${this.handleSelection} @change=${this.handleSelection}>
          <slot @slotchange=${this.syncFromChildren}></slot>
        </div>
        <div id="description" part="description"><slot name="description"></slot></div>
        <div id="error" part="error" role="alert"><slot name="error"></slot></div>
      </fieldset>
    `;
  }
}
registerAdsElement('checkbox-group', AdsCheckboxGroup);
declare global { interface HTMLElementTagNameMap { 'ads-checkbox-group': AdsCheckboxGroup; } }
