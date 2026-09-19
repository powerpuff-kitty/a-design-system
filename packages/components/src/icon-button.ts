import { defineComponentContract } from '@a-design-system/core';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsIconButtonContract = defineComponentContract({
  name: 'AdsIconButton',
  tagName: 'ads-icon-button',
  description: 'An accessible icon-only button requiring an explicit accessible label.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string', required: true },
    { name: 'type', type: "'button' | 'submit' | 'reset'", default: 'button' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
  ],
  properties: [
    { name: 'label', type: 'string' },
    { name: 'type', type: "'button' | 'submit' | 'reset'" },
    { name: 'disabled', type: 'boolean' },
    { name: 'name', type: 'string' },
    { name: 'value', type: 'string' },
  ],
  slots: [{ name: 'default', description: 'The icon content.' }],
  parts: [{ name: 'button', description: 'The internal native button.' }],
});

export class AdsIconButton extends FormAssociatedElement {
  static styles = css`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 2.5rem;
      min-height: 2.5rem;
      padding: 0.5rem;
      border: 1px solid transparent;
      border-radius: var(--ads-radius-control, 0.375rem);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    button:focus-visible {
      outline: 2px solid var(--ads-focus-ring-color, currentColor);
      outline-offset: 2px;
    }
  `;
  @property() label = '';
  @property() type: 'button' | 'submit' | 'reset' = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';

  override updated(): void {
    this.internals.ariaDisabled = String(this.disabled || this.formDisabled);
  }

  override click(): void {
    this.renderRoot.querySelector<HTMLButtonElement>('button')?.click();
  }

  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector<HTMLButtonElement>('button')?.focus(options);
  }

  override blur(): void {
    this.renderRoot.querySelector<HTMLButtonElement>('button')?.blur();
  }

  private activateForm(): void {
    const form = this.form;
    if (!form) return;

    if (this.type === 'reset') {
      form.reset();
      return;
    }

    if (this.type !== 'submit') return;

    const submitter = document.createElement('button');
    submitter.type = 'submit';
    submitter.hidden = true;
    submitter.tabIndex = -1;
    if (this.name) submitter.name = this.name;
    submitter.value = this.value;

    form.append(submitter);
    try {
      form.requestSubmit(submitter);
    } finally {
      submitter.remove();
    }
  }

  private handleClick = (event: MouseEvent): void => {
    if (this.disabled || this.formDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.activateForm();
  };

  override render() {
    const unavailable = this.disabled || this.formDisabled;

    return html`<button
      part="button"
      type="button"
      aria-label=${this.label || undefined}
      ?disabled=${unavailable}
      @click=${this.handleClick}
    >
      <slot></slot>
    </button>`;
  }
}
registerAdsElement('icon-button', AdsIconButton);
