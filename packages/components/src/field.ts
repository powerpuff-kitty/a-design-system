import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsFieldContract = defineComponentContract({
  name: 'Field',
  tagName: 'ads-field',
  description:
    'Composes one form control with label, supporting description, validation error, and required indication.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string', default: '' },
    { name: 'required', type: 'boolean', default: 'false' },
    { name: 'invalid', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
  ],
  slots: [
    { name: 'label', description: 'Visible field label.' },
    { name: 'control', description: 'One native or ADS form control.' },
    { name: 'description', description: 'Supporting help text.' },
    { name: 'error', description: 'Validation error content.' },
  ],
  parts: [
    { name: 'field', description: 'Field layout container.' },
    { name: 'label', description: 'Native label wrapper.' },
    { name: 'label-text', description: 'Visible label text.' },
    { name: 'required', description: 'Visual required indicator.' },
    { name: 'control', description: 'Control slot wrapper.' },
    { name: 'description', description: 'Description region.' },
    { name: 'error', description: 'Error region.' },
  ],
  cssCustomProperties: [
    { name: '--ads-field-gap', default: '0.375rem' },
    { name: '--ads-field-label-color', default: 'inherit' },
    { name: '--ads-field-label-font-size', default: '0.875rem' },
    { name: '--ads-field-label-font-weight', default: '600' },
    { name: '--ads-field-description-color', default: '#606068' },
    { name: '--ads-field-error-color', default: 'var(--ads-color-danger-strong, #b42318)' },
  ],
  states: [
    { name: 'invalid', description: 'Field is presented as invalid.' },
    { name: 'disabled', description: 'Field is presented as disabled.' },
  ],
});

type LabelAwareControl = HTMLElement & {
  label?: string;
  disabled?: boolean;
};

function slotText(slot: HTMLSlotElement | undefined): string {
  return (slot?.assignedNodes({ flatten: true }) ?? [])
    .map((node) => node.textContent?.trim() ?? '')
    .filter(Boolean)
    .join(' ')
    .trim();
}

export class AdsField extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--ads-field-color, inherit);
      font: inherit;
    }

    :host([hidden]) {
      display: none;
    }

    [part='field'] {
      display: grid;
      gap: var(--ads-field-gap, 0.375rem);
    }

    [part='label'] {
      display: grid;
      gap: var(--ads-field-gap, 0.375rem);
      cursor: default;
    }

    [part='label-text'] {
      color: var(--ads-field-label-color, inherit);
      font-size: var(--ads-field-label-font-size, 0.875rem);
      font-weight: var(--ads-field-label-font-weight, 600);
      line-height: 1.3;
    }

    [part='required'] {
      margin-inline-start: 0.2em;
      color: var(--ads-field-error-color, var(--ads-color-danger-strong, #b42318));
    }

    [part='control'] {
      min-inline-size: 0;
    }

    [part='description'],
    [part='error'] {
      font-size: var(--ads-field-message-font-size, 0.8125rem);
      line-height: 1.4;
    }

    [part='description'] {
      color: var(--ads-field-description-color, #606068);
    }

    [part='error'] {
      color: var(--ads-field-error-color, var(--ads-color-danger-strong, #b42318));
    }

    :host([disabled]) {
      opacity: var(--ads-disabled-opacity, 0.5);
    }
  `;

  @property() label = '';
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) invalid = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  @query('slot[name="label"]') private labelSlot?: HTMLSlotElement;
  @query('slot[name="control"]') private controlSlot?: HTMLSlotElement;
  @query('slot[name="description"]') private descriptionSlot?: HTMLSlotElement;
  @query('slot[name="error"]') private errorSlot?: HTMLSlotElement;

  private ownedLabelTarget?: HTMLElement;
  private ownedDescriptionTarget?: HTMLElement;
  private ownedInvalidTarget?: HTMLElement;

  override firstUpdated(): void {
    this.syncControlContext();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has('label') ||
      changed.has('invalid') ||
      changed.has('disabled') ||
      changed.has('required')
    ) {
      this.syncControlContext();
    }
  }

  private get control(): LabelAwareControl | undefined {
    return this.controlSlot?.assignedElements({ flatten: true })[0] as
      | LabelAwareControl
      | undefined;
  }

  private get controlTarget(): HTMLElement | undefined {
    const control = this.control;
    if (!control) return undefined;

    if (
      control instanceof HTMLInputElement ||
      control instanceof HTMLTextAreaElement ||
      control instanceof HTMLSelectElement ||
      control instanceof HTMLButtonElement
    ) {
      return control;
    }

    return (
      control.shadowRoot?.querySelector<HTMLElement>(
        'input, textarea, select, button, [contenteditable="true"], [tabindex]',
      ) ?? control
    );
  }

  private get labelText(): string {
    return slotText(this.labelSlot) || this.label.trim();
  }

  private syncControlContext(): void {
    const control = this.control;
    const target = this.controlTarget;
    if (!control || !target) return;

    const label = this.labelText;
    const description = slotText(this.descriptionSlot);
    const error = slotText(this.errorSlot);

    if ('label' in control && typeof control.label === 'string' && label) {
      control.label = label;
    } else if (label) {
      if (this.ownedLabelTarget && this.ownedLabelTarget !== target) {
        this.ownedLabelTarget.removeAttribute('aria-label');
      }
      target.setAttribute('aria-label', label);
      this.ownedLabelTarget = target;
    } else if (this.ownedLabelTarget === target) {
      target.removeAttribute('aria-label');
      this.ownedLabelTarget = undefined;
    }

    const describedText = [description, error].filter(Boolean).join(' ');
    if (describedText) {
      if (this.ownedDescriptionTarget && this.ownedDescriptionTarget !== target) {
        this.ownedDescriptionTarget.removeAttribute('aria-description');
      }
      target.setAttribute('aria-description', describedText);
      this.ownedDescriptionTarget = target;
    } else if (this.ownedDescriptionTarget === target) {
      target.removeAttribute('aria-description');
      this.ownedDescriptionTarget = undefined;
    }

    if (this.invalid || Boolean(error)) {
      target.setAttribute('aria-invalid', 'true');
      this.ownedInvalidTarget = target;
    } else if (this.ownedInvalidTarget === target) {
      target.removeAttribute('aria-invalid');
      this.ownedInvalidTarget = undefined;
    }

    if (this.disabled && 'disabled' in control) {
      control.disabled = true;
    }
  }

  private handleLabelClick(event: MouseEvent): void {
    const control = this.control;
    if (!control || event.defaultPrevented || event.composedPath().includes(control)) return;
    control.focus();
  }

  private handleSlotChange(): void {
    void this.updateComplete.then(() => this.syncControlContext());
  }

  override render() {
    return html`
      <div part="field">
        <label part="label" @click=${this.handleLabelClick}>
          <span part="label-text">
            <slot name="label" @slotchange=${this.handleSlotChange}>${this.label}</slot>
            ${this.required
              ? html`<span part="required" aria-hidden="true">*</span>`
              : null}
          </span>
          <span part="control">
            <slot name="control" @slotchange=${this.handleSlotChange}></slot>
          </span>
        </label>
        <div part="description">
          <slot name="description" @slotchange=${this.handleSlotChange}></slot>
        </div>
        <div part="error" role="alert">
          <slot name="error" @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

registerAdsElement('field', AdsField);

declare global {
  interface HTMLElementTagNameMap {
    'ads-field': AdsField;
  }
}
