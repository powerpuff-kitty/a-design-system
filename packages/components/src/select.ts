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
  description:
    'Form-associated select backed by a native select element while mirroring light-DOM option definitions.',
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
    {
      name: 'input',
      detail: 'Event',
      description: 'Dispatched when the native selection changes.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'change',
      detail: 'Event',
      description: 'Dispatched when the native selection is committed.',
      bubbles: true,
      composed: true,
    },
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
    { name: '--ads-select-min-block-size', default: '2.5rem' },
    { name: '--ads-select-padding-inline', default: '0.75rem' },
    { name: '--ads-select-border-color', default: '#d7d7dc' },
    { name: '--ads-select-background', default: '#fff' },
    { name: '--ads-select-color', default: '#111114' },
    { name: '--ads-select-radius', default: 'var(--ads-radius-control, 0.375rem)' },
  ],
  states: [
    { name: 'invalid', description: 'Native select validity currently fails.' },
    { name: 'disabled', description: 'Disabled by attribute or containing fieldset.' },
  ],
});

function optionModel(option: HTMLOptionElement): AdsSelectOptionModel {
  return {
    kind: 'option',
    value: option.value,
    label: option.label || option.textContent?.trim() || option.value,
    disabled: option.disabled,
    defaultSelected: option.defaultSelected,
  };
}

export class AdsSelect extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: inline-block;
      inline-size: var(--ads-select-inline-size, auto);
      min-inline-size: 0;
      color: var(--ads-select-color, #111114);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='label'] {
      display: grid;
      gap: var(--ads-select-label-gap, 0.375rem);
    }

    [part='label-text'] {
      font-size: var(--ads-select-label-font-size, 0.875rem);
      font-weight: var(--ads-select-label-font-weight, 600);
      line-height: 1.3;
    }

    [part='control'] {
      position: relative;
      display: grid;
      min-inline-size: 0;
    }

    select {
      box-sizing: border-box;
      inline-size: 100%;
      min-block-size: var(--ads-select-min-block-size, 2.5rem);
      margin: 0;
      padding-block: var(--ads-select-padding-block, 0.5rem);
      padding-inline:
        var(--ads-select-padding-inline, 0.75rem)
        calc(var(--ads-select-padding-inline, 0.75rem) + 1.25rem);
      border: var(--ads-select-border-width, 1px) solid
        var(--ads-select-border-color, #d7d7dc);
      border-radius: var(--ads-select-radius, var(--ads-radius-control, 0.375rem));
      outline: none;
      background: var(--ads-select-background, #fff);
      color: var(--ads-select-color, #111114);
      font: inherit;
      line-height: 1.25;
      appearance: none;
    }

    :host([multiple]) select,
    :host([size]) select {
      padding-inline-end: var(--ads-select-padding-inline, 0.75rem);
      appearance: auto;
    }

    select:focus-visible {
      border-color: var(--ads-focus-color, #315efb);
      box-shadow: 0 0 0 var(--ads-focus-width, 2px)
        color-mix(in srgb, var(--ads-focus-color, #315efb) 22%, transparent);
    }

    :host(:state(invalid)) select {
      border-color: var(--ads-select-error-border-color, #d92d20);
    }

    select:disabled {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    [part='indicator'] {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-end: var(--ads-select-padding-inline, 0.75rem);
      inline-size: 0.45rem;
      block-size: 0.45rem;
      border-inline-end: 1.5px solid currentColor;
      border-block-end: 1.5px solid currentColor;
      transform: translateY(-65%) rotate(45deg);
      pointer-events: none;
    }

    :host([multiple]) [part='indicator'],
    :host([size]) [part='indicator'] {
      display: none;
    }

    [part='description'],
    [part='error'] {
      font-size: var(--ads-select-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-select-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-select-error-color, #b42318);
    }

    [part='source'] {
      display: none;
    }
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

  private observer?: MutationObserver;
  private defaultValue = '';
  private defaultValues: string[] = [];
  private defaultCaptured = false;
  private customValidityMessage = '';

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new MutationObserver(() => this.refreshOptions());
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['value', 'label', 'disabled', 'selected'],
    });
  }

  override disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    this.refreshOptions();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('value') ||
      changed.has('values') ||
      changed.has('multiple') ||
      changed.has('size') ||
      changed.has('disabled') ||
      changed.has('required') ||
      changed.has('name') ||
      changed.has('autocomplete') ||
      changed.has('entries')
    ) {
      void this.updateComplete.then(() => this.syncNativeState());
    }
  }

  override focus(options?: FocusOptions): void {
    if (this.selectElement) {
      this.selectElement.focus(options);
      return;
    }
    void this.updateComplete.then(() => this.selectElement?.focus(options));
  }

  override blur(): void {
    this.selectElement?.blur();
  }

  setCustomValidity(message: string): void {
    this.customValidityMessage = message;
    if (this.selectElement) {
      this.selectElement.setCustomValidity(message);
      this.syncNativeState();
    }
  }

  protected override onFormDisabledChange(): void {
    void this.updateComplete.then(() => this.syncNativeState());
  }

  formResetCallback(): void {
    if (this.multiple) {
      this.values = [...this.defaultValues];
      this.value = this.values[0] ?? '';
    } else {
      this.value = this.defaultValue;
      this.values = this.value ? [this.value] : [];
    }
    void this.updateComplete.then(() => this.syncNativeState());
  }

  formStateRestoreCallback(state: string | File | FormData | null): void {
    if (typeof state !== 'string') return;

    if (this.multiple) {
      try {
        const parsed: unknown = JSON.parse(state);
        if (Array.isArray(parsed) && parsed.every((entry) => typeof entry === 'string')) {
          this.values = [...parsed];
          this.value = this.values[0] ?? '';
        }
      } catch {
        return;
      }
    } else {
      this.value = state;
      this.values = state ? [state] : [];
    }

    void this.updateComplete.then(() => this.syncNativeState());
  }

  private sourceEntries(): AdsSelectEntryModel[] {
    const entries: AdsSelectEntryModel[] = [];

    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLOptionElement) {
        entries.push(optionModel(child));
        continue;
      }

      if (child instanceof HTMLOptGroupElement) {
        entries.push({
          kind: 'group',
          label: child.label,
          disabled: child.disabled,
          options: Array.from(child.children)
            .filter((option): option is HTMLOptionElement => option instanceof HTMLOptionElement)
            .map(optionModel),
        });
      }
    }

    return entries;
  }

  private flatOptions(entries = this.entries): AdsSelectOptionModel[] {
    return entries.flatMap((entry) => (entry.kind === 'option' ? [entry] : entry.options));
  }

  private refreshOptions(): void {
    const entries = this.sourceEntries();
    const options = this.flatOptions(entries);

    if (!this.defaultCaptured && options.length > 0) {
      const selected = options.filter((option) => option.defaultSelected).map((option) => option.value);

      if (this.multiple) {
        if (this.values.length === 0 && selected.length > 0) this.values = [...selected];
        this.defaultValues = this.values.length ? [...this.values] : [...selected];
        this.value = this.values[0] ?? '';
      } else {
        if (!this.hasAttribute('value')) {
          this.value =
            selected[0] ??
            options.find((option) => !option.disabled)?.value ??
            '';
        }
        this.values = this.value ? [this.value] : [];
        this.defaultValue = this.value;
        this.defaultValues = this.value ? [this.value] : [];
      }

      this.defaultCaptured = true;
    }

    this.entries = entries;
    void this.updateComplete.then(() => this.syncNativeState());
  }

  private selectedSet(): Set<string> {
    if (this.multiple) return new Set(this.values);
    return new Set(this.value ? [this.value] : []);
  }

  private syncSelectionFromNative(): void {
    const select = this.selectElement;
    if (!select) return;
    const selected = Array.from(select.selectedOptions).map((option) => option.value);

    if (this.multiple) {
      this.values = selected;
      this.value = selected[0] ?? '';
    } else {
      this.value = select.value;
      this.values = this.value ? [this.value] : [];
    }
  }

  private syncNativeState(): void {
    const select = this.selectElement;
    if (!select) return;

    const disabled = this.disabled || this.formDisabled;
    select.disabled = disabled;
    select.required = this.required;
    select.multiple = this.multiple;
    select.autocomplete = this.autocomplete;
    if (this.size > 0) select.size = this.size;

    const selected = this.selectedSet();
    for (const option of Array.from(select.options)) {
      option.selected = selected.has(option.value);
    }

    if (!this.multiple) {
      select.value = this.value;
      this.values = this.value ? [this.value] : [];
    }

    if (this.customValidityMessage) {
      select.setCustomValidity(this.customValidityMessage);
    } else if (select.validity.customError) {
      select.setCustomValidity('');
    }

    this.internals.ariaDisabled = String(disabled);

    const state = this.multiple ? JSON.stringify(this.values) : this.value;
    if (disabled || !this.name) {
      this.setFormValue(null, state);
    } else if (this.multiple) {
      const formData = new FormData();
      for (const value of this.values) formData.append(this.name, value);
      this.setFormValue(formData, state);
    } else {
      this.setFormValue(this.value, state);
    }

    if (select.validity.valid) {
      this.setValidity({});
      this.invalid = false;
      this.internals.ariaInvalid = 'false';
      this.internals.states.delete('invalid');
      return;
    }

    this.setValidity(validityStateToFlags(select.validity), select.validationMessage, select);
    this.invalid = true;
    this.internals.ariaInvalid = 'true';
    this.internals.states.add('invalid');
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
    const selected = this.multiple ? this.values.includes(option.value) : this.value === option.value;
    return html`
      <option value=${option.value} ?disabled=${option.disabled} ?selected=${selected}>
        ${option.label}
      </option>
    `;
  }

  private renderEntry(entry: AdsSelectEntryModel): TemplateResult {
    if (entry.kind === 'option') return this.renderOption(entry);
    return html`
      <optgroup label=${entry.label} ?disabled=${entry.disabled}>
        ${entry.options.map((option) => this.renderOption(option))}
      </optgroup>
    `;
  }

  override render() {
    const disabled = this.disabled || this.formDisabled;

    return html`
      <label part="label">
        <span part="label-text"><slot name="label">${this.label}</slot></span>
        <span part="control">
          <select
            part="select"
            .name=${''}
            .autocomplete=${this.autocomplete}
            ?multiple=${this.multiple}
            size=${this.size > 0 ? String(this.size) : nothing}
            ?disabled=${disabled}
            ?required=${this.required}
            aria-describedby="description error"
            aria-invalid=${this.invalid ? 'true' : 'false'}
            @input=${this.handleInput}
            @change=${this.handleChange}
          >
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

declare global {
  interface HTMLElementTagNameMap {
    'ads-select': AdsSelect;
  }
}
