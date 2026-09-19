import { defineComponentContract } from '@a-design-system/core';
import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';
import { validityStateToFlags } from './runtime/validity.js';

interface AdsSelectOptionModel {
  kind: 'option';
  value: string;
  label: string;
  disabled: boolean;
  defaultSelected: boolean;
}
interface AdsSelectGroupModel {
  kind: 'group';
  label: string;
  disabled: boolean;
  options: AdsSelectOptionModel[];
}
type AdsSelectEntryModel = AdsSelectOptionModel | AdsSelectGroupModel;

export const adsSelectContract = defineComponentContract({
  name: 'Select',
  tagName: 'ads-select',
  description: 'Form-associated select backed by a native select element while mirroring light-DOM option definitions.',
  status: 'experimental',
  attributes: [
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
    { name: 'label', type: 'string', default: '' },
    { name: 'autocomplete', type: 'string', default: '' },
    { name: 'multiple', type: 'boolean', default: 'false' },
    { name: 'size', type: 'number', default: '0' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'required', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'values', type: 'string[]', description: 'All selected values, especially for multiple mode.' },
    { name: 'form', type: 'HTMLFormElement | null', readonly: true },
    { name: 'validity', type: 'ValidityState', readonly: true },
    { name: 'validationMessage', type: 'string', readonly: true },
  ],
  methods: [
    { name: 'focus', signature: 'focus(options?: FocusOptions): void' },
    { name: 'blur', signature: 'blur(): void' },
    { name: 'setCustomValidity', signature: 'setCustomValidity(message: string): void' },
    { name: 'checkValidity', signature: 'checkValidity(): boolean' },
    { name: 'reportValidity', signature: 'reportValidity(): boolean' },
  ],
  events: [
    { name: 'input', detail: 'Event', description: 'Dispatched when the native selection changes.', bubbles: true, composed: true },
    { name: 'change', detail: 'Event', description: 'Dispatched when the native selection is committed.', bubbles: true, composed: true },
  ],
  slots: [
    { name: '', description: 'Native option and optgroup definitions mirrored into the shadow select.' },
    { name: 'label', description: 'Visible select label.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation error message.' },
  ],
  parts: [
    { name: 'label', description: 'Label wrapper.' },
    { name: 'label-text', description: 'Visible label text.' },
    { name: 'control', description: 'Select chrome container.' },
    { name: 'select', description: 'Native select element.' },
    { name: 'indicator', description: 'Visual dropdown indicator.' },
    { name: 'description', description: 'Description region.' },
    { name: 'error', description: 'Error region.' },
  ],
  cssCustomProperties: [
    { name: '--ads-select-min-block-size', default: 'var(--ads-control-size, 2.5rem)' },
    { name: '--ads-select-padding-inline', default: '0.75rem' },
    { name: '--ads-select-border-color', default: 'var(--ads-color-line-control, #d7d7dc)' },
    { name: '--ads-select-background', default: 'var(--ads-color-surface-default, #fff)' },
    { name: '--ads-select-color', default: 'var(--ads-color-text-default, #111114)' },
    { name: '--ads-select-radius', default: 'var(--ads-radius-control, 0px)' },
    { name: '--ads-select-border-width', default: '1px', description: 'Control border width.' },
    { name: '--ads-select-description-color', default: 'var(--ads-color-text-muted, #606068)', description: 'Supporting description text color.' },
    { name: '--ads-select-error-border-color', default: 'var(--ads-color-state-danger, #b42318)', description: 'Control border color while invalid.' },
    { name: '--ads-select-error-color', default: 'var(--ads-color-state-danger, #b42318)', description: 'Validation message text color.' },
    { name: '--ads-select-inline-size', default: 'auto', description: 'Logical width of the select host.' },
    { name: '--ads-select-label-font-size', default: '0.875rem', description: 'Visible label text size.' },
    { name: '--ads-select-label-font-weight', default: '600', description: 'Visible label font weight.' },
    { name: '--ads-select-label-gap', default: '0.375rem', description: 'Spacing between the visible label and control.' },
    { name: '--ads-select-message-font-size', default: '0.8125rem', description: 'Supporting description and error text size.' },
    { name: '--ads-select-padding-block', default: '0.5rem', description: 'Native select vertical padding in dropdown and listbox modes.' },
  ],
  states: [
    { name: 'invalid', description: 'Native select validity currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

function optionModel(option: HTMLOptionElement): AdsSelectOptionModel {
  return { kind: 'option', value: option.value, label: option.label || option.textContent?.trim() || option.value, disabled: option.disabled, defaultSelected: option.defaultSelected };
}
function sameValues(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export class AdsSelect extends FormAssociatedElement {
  static override styles = css`
    :host { display: inline-block; inline-size: var(--ads-select-inline-size, auto); min-inline-size: 0; color: var(--ads-select-color, var(--ads-color-text-default, #111114)); font: inherit; }
    :host([hidden]) { display: none; }
    [part='label'] { display: grid; gap: var(--ads-select-label-gap, 0.375rem); }
    [part='label-text'] { font-size: var(--ads-select-label-font-size, 0.875rem); font-weight: var(--ads-select-label-font-weight, 600); line-height: 1.3; }
    [part='control'] { position: relative; display: grid; min-inline-size: 0; }
    select {
      box-sizing: border-box; inline-size: 100%; min-block-size: var(--ads-select-min-block-size, var(--ads-control-size, 2.5rem)); margin: 0;
      padding-block: var(--ads-select-padding-block, 0.5rem);
      padding-inline: var(--ads-select-padding-inline, 0.75rem) calc(var(--ads-select-padding-inline, 0.75rem) + 1.25rem);
      border: var(--ads-select-border-width, 1px) solid var(--ads-select-border-color, var(--ads-color-line-control, #d7d7dc));
      border-radius: var(--ads-select-radius, var(--ads-radius-control, 0px));
      background: var(--ads-select-background, var(--ads-color-surface-default, #fff));
      color: var(--ads-select-color, var(--ads-color-text-default, #111114)); font: inherit; line-height: 1.25; appearance: none;
    }
    [data-listbox] select { padding-inline-end: var(--ads-select-padding-inline, 0.75rem); appearance: auto; }
    select:focus-visible { outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, var(--ads-color-focus-ring, currentColor)); outline-offset: var(--ads-focus-offset, 2px); }
    :host(:state(invalid)) select { border-color: var(--ads-select-error-border-color, var(--ads-color-state-danger, #b42318)); }
    select:disabled { cursor: not-allowed; opacity: var(--ads-disabled-opacity, 0.5); }
    [part='indicator'] { position: absolute; inset-block-start: 50%; inset-inline-end: var(--ads-select-padding-inline, 0.75rem); inline-size: 0.45rem; block-size: 0.45rem; border-inline-end: 1.5px solid currentColor; border-block-end: 1.5px solid currentColor; transform: translateY(-65%) rotate(45deg); pointer-events: none; }
    [data-listbox] [part='indicator'] { display: none; }
    [part='description'], [part='error'] { font-size: var(--ads-select-message-font-size, 0.8125rem); line-height: 1.4; }
    [part='description'] { color: var(--ads-select-description-color, var(--ads-color-text-muted, #606068)); }
    [part='error'] { color: var(--ads-select-error-color, var(--ads-color-state-danger, #b42318)); }
    [part='source'] { display: none; }
  `;

  @property({ reflect: true }) name = '';
  @property() value = '';
  @property({ attribute: false }) values: string[] = [];
  @property() label = '';
  @property() autocomplete = '';
  @property({ type: Boolean, reflect: true }) multiple = false;
  @property({ type: Number, reflect: true }) size = 0;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @query('select') private selectElement?: HTMLSelectElement;
  @state() private entries: AdsSelectEntryModel[] = [];
  @state() private invalid = false;
  private observer: MutationObserver | undefined;
  private defaultValue = '';
  private defaultValues: string[] = [];
  private defaultCaptured = false;
  private customValidityMessage = '';

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new MutationObserver(() => this.refreshOptions());
    this.observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['value', 'label', 'disabled', 'selected'] });
    if (this.hasUpdated) this.refreshOptions();
  }
  override disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    super.disconnectedCallback();
  }
  override firstUpdated(): void { this.refreshOptions(); }
  // Private reactive keys such as entries are intentionally included in this map.
  override updated(changed: PropertyValues): void {
    if (['value', 'values', 'multiple', 'size', 'disabled', 'required', 'name', 'autocomplete', 'entries'].some((key) => changed.has(key))) {
      this.syncNativeState();
    }
  }
  override focus(options?: FocusOptions): void {
    if (this.selectElement) this.selectElement.focus(options);
    else void this.updateComplete.then(() => this.selectElement?.focus(options));
  }
  override blur(): void { this.selectElement?.blur(); }
  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    this.syncNativeState();
  }
  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncNativeState());
  }
  formResetCallback(): void {
    this.value = this.defaultValue;
    this.values = [...this.defaultValues];
    void this.updateComplete.then(() => this.syncNativeState());
  }
  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;
    if (this.multiple) {
      try {
        const parsed: unknown = JSON.parse(state);
        if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === 'string')) return;
        this.values = [...parsed];
        this.value = this.values[0] ?? '';
      } catch { return; }
    } else { this.value = state; }
    void this.updateComplete.then(() => this.syncNativeState());
  }
  private sourceEntries(): AdsSelectEntryModel[] {
    const entries: AdsSelectEntryModel[] = [];
    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLOptionElement) entries.push(optionModel(child));
      else if (child instanceof HTMLOptGroupElement) {
        entries.push({ kind: 'group', label: child.label, disabled: child.disabled, options: Array.from(child.children).filter((option): option is HTMLOptionElement => option instanceof HTMLOptionElement).map(optionModel) });
      }
    }
    return entries;
  }
  private refreshOptions(): void {
    const entries = this.sourceEntries();
    const options = entries.flatMap((entry) => entry.kind === 'option' ? [entry] : entry.options.map((option) => ({ ...option, disabled: entry.disabled || option.disabled })));
    if (!this.defaultCaptured && options.length) {
      const selected = options.filter((option) => option.defaultSelected).map((option) => option.value);
      if (this.multiple) {
        if (!this.values.length && selected.length) this.values = [...selected];
        this.value = this.values[0] ?? '';
        this.defaultValues = [...this.values];
      } else {
        // A nonempty property value set before connection is as intentional as an attribute.
        if (!this.hasAttribute('value') && this.value === '') this.value = selected.at(-1) ?? options.find((option) => !option.disabled)?.value ?? '';
        this.defaultValues = options.some((option) => option.value === this.value) ? [this.value] : [];
      }
      this.defaultValue = this.value;
      this.defaultCaptured = true;
    }
    this.entries = entries;
  }
  private syncSelectionFromNative(): void {
    const select = this.selectElement;
    if (!select) return;
    const values = Array.from(select.selectedOptions, (option) => option.value);
    if (!sameValues(this.values, values)) this.values = values;
    this.value = select.value;
  }
  private syncNativeState(): void {
    const select = this.selectElement;
    if (!select) return;
    const disabled = this.disabled || this.formDisabled;
    select.disabled = disabled;
    select.required = this.required;
    select.multiple = this.multiple;
    select.setAttribute('autocomplete', this.autocomplete);
    const size = Number.isFinite(this.size) ? Math.max(0, Math.floor(this.size)) : 0;
    if (size > 0) select.size = size;
    else select.removeAttribute('size');
    if (this.multiple) {
      const wanted = new Set(this.values);
      for (const option of Array.from(select.options)) option.selected = wanted.has(option.value);
    } else {
      select.value = this.value;
      const values = Array.from(select.selectedOptions, (option) => option.value);
      // Never allocate a new reactive array on every update: it creates an endless update loop.
      if (!sameValues(this.values, values)) this.values = values;
    }
    select.setCustomValidity(this.customValidityMessage);
    this.internals.ariaDisabled = String(disabled);
    if (disabled) this.internals.states.add('disabled');
    else this.internals.states.delete('disabled');
    const selected = Array.from(select.selectedOptions).filter((option) => !option.disabled && !(option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled));
    const state = this.multiple ? JSON.stringify(this.values) : this.value;
    if (disabled || !this.name) this.setFormValue(null, state);
    else if (this.multiple) {
      const data = new FormData();
      for (const option of selected) data.append(this.name, option.value);
      this.setFormValue(data, state);
    } else this.setFormValue(selected[0]?.value ?? null, state);
    this.invalid = !select.validity.valid;
    this.setValidity(validityStateToFlags(select.validity), select.validationMessage, select);
    this.internals.ariaInvalid = String(this.invalid);
    if (this.invalid) this.internals.states.add('invalid');
    else this.internals.states.delete('invalid');
  }
  private handleInput(event: Event): void {
    event.stopPropagation();
    this.syncSelectionFromNative();
    this.syncNativeState();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  }
  private handleChange(event: Event): void {
    event.stopPropagation();
    this.syncSelectionFromNative();
    this.syncNativeState();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }
  private renderOption(option: AdsSelectOptionModel): TemplateResult {
    return html`<option value=${option.value} ?disabled=${option.disabled}>${option.label}</option>`;
  }
  private renderEntry(entry: AdsSelectEntryModel): TemplateResult {
    return entry.kind === 'option' ? this.renderOption(entry) : html`<optgroup label=${entry.label} ?disabled=${entry.disabled}>${entry.options.map((option) => this.renderOption(option))}</optgroup>`;
  }
  override render() {
    const disabled = this.disabled || this.formDisabled;
    return html`
      <label part="label">
        <span part="label-text"><slot name="label">${this.label}</slot></span>
        <span part="control" ?data-listbox=${this.multiple || this.size > 1}>
          <select part="select" autocomplete=${this.autocomplete} ?multiple=${this.multiple}
            size=${Number.isFinite(this.size) && this.size > 0 ? String(Math.floor(this.size)) : nothing}
            ?disabled=${disabled} ?required=${this.required} aria-describedby="description error"
            aria-invalid=${String(this.invalid)} @input=${this.handleInput} @change=${this.handleChange}>
            ${this.entries.map((entry) => this.renderEntry(entry))}
          </select>
          <span part="indicator" aria-hidden="true"></span>
        </span>
      </label>
      <div id="description" part="description"><slot name="description"></slot></div>
      <div id="error" part="error" role="alert"><slot name="error"></slot></div>
      <span part="source" hidden><slot @slotchange=${this.refreshOptions}></slot></span>
    `;
  }
}
registerAdsElement('select', AdsSelect);
declare global { interface HTMLElementTagNameMap { 'ads-select': AdsSelect; } }
