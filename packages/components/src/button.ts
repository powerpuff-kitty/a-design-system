import { defineComponentContract } from '@a-design-system/core';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AdsButtonType = 'button' | 'submit' | 'reset';

export const adsButtonContract = defineComponentContract({
  name: 'Button',
  tagName: 'ads-button',
  description: 'Accessible action control with native form submit/reset integration.',
  status: 'experimental',
  attributes: [
    { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: 'primary' },
    { name: 'type', type: "'button' | 'submit' | 'reset'", default: 'button' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'loading', type: 'boolean', default: 'false' },
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
  ],
  slots: [
    { name: '', description: 'Button label/content.' },
    { name: 'start', description: 'Leading icon or decoration.' },
    { name: 'end', description: 'Trailing icon or decoration.' },
  ],
  parts: [
    { name: 'button', description: 'The internal native button.' },
    { name: 'spinner', description: 'Loading spinner rendered while loading.' },
  ],
  cssCustomProperties: [
    { name: '--ads-control-size', default: '2.5rem' },
    { name: '--ads-button-gap', default: '0.5rem' },
    { name: '--ads-button-padding-block', default: '0.625rem' },
    { name: '--ads-button-padding-inline', default: '0.875rem' },
    { name: '--ads-button-radius', default: 'var(--ads-radius-control, 0.375rem)' },
    { name: '--ads-button-font-weight', default: '600' },
    { name: '--ads-disabled-opacity', default: '0.5' },
  ],
  states: [
    { name: 'disabled', description: 'Unavailable for interaction.' },
    { name: 'loading', description: 'Busy and unavailable for repeated activation.' },
  ],
});

/**
 * Accessible action control for A Design System.
 *
 * @slot - Button label/content.
 * @slot start - Leading icon or decoration.
 * @slot end - Trailing icon or decoration.
 * @csspart button - The native button element.
 * @csspart spinner - Loading indicator.
 */
export class AdsButton extends FormAssociatedElement {
  static override styles = css`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    :host([hidden]) {
      display: none;
    }

    button {
      box-sizing: border-box;
      display: inline-flex;
      min-block-size: var(--ads-control-size, 2.5rem);
      align-items: center;
      justify-content: center;
      gap: var(--ads-button-gap, 0.5rem);
      margin: 0;
      padding: var(--ads-button-padding-block, 0.625rem) var(--ads-button-padding-inline, 0.875rem);
      border: var(--ads-button-border-width, 1px) solid transparent;
      border-radius: var(--ads-button-radius, var(--ads-radius-control, 0.375rem));
      font: inherit;
      font-weight: var(--ads-button-font-weight, 600);
      line-height: 1;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background-color var(--ads-motion-duration-fast, 120ms),
        border-color var(--ads-motion-duration-fast, 120ms),
        color var(--ads-motion-duration-fast, 120ms),
        opacity var(--ads-motion-duration-fast, 120ms);
    }

    button:focus-visible {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }

    :host([variant='primary']) button {
      background: var(--ads-button-primary-background, #111114);
      color: var(--ads-button-primary-color, #fff);
    }

    :host([variant='secondary']) button {
      border-color: var(--ads-button-secondary-border, #d7d7dc);
      background: var(--ads-button-secondary-background, #fff);
      color: var(--ads-button-secondary-color, #111114);
    }

    :host([variant='ghost']) button {
      background: transparent;
      color: var(--ads-button-ghost-color, #111114);
    }

    :host([variant='danger']) button {
      background: var(--ads-button-danger-background, #b42318);
      color: var(--ads-button-danger-color, #fff);
    }

    button:not(:disabled):hover {
      filter: brightness(var(--ads-button-hover-brightness, 0.96));
    }

    button:not(:disabled):active {
      filter: brightness(var(--ads-button-active-brightness, 0.9));
    }

    [part='spinner'] {
      inline-size: 1em;
      block-size: 1em;
      border: 0.125em solid currentColor;
      border-inline-end-color: transparent;
      border-radius: 50%;
      animation: ads-button-spin 0.7s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }

      [part='spinner'] {
        animation-duration: 1.4s;
      }
    }

    @keyframes ads-button-spin {
      to {
        transform: rotate(1turn);
      }
    }
  `;

  @property({ reflect: true }) variant: AdsButtonVariant = 'primary';
  @property({ reflect: true }) type: AdsButtonType = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';

  override updated(): void {
    this.internals.ariaDisabled = String(this.disabled || this.formDisabled || this.loading);
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

    // A transient native submitter preserves browser validation and includes
    // the custom button's name/value in the submission.
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

  private handleClick(event: MouseEvent): void {
    if (this.disabled || this.formDisabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.activateForm();
  }

  override render() {
    const unavailable = this.disabled || this.formDisabled || this.loading;

    return html`
      <button
        part="button"
        type="button"
        ?disabled=${unavailable}
        aria-busy=${this.loading ? 'true' : 'false'}
        @click=${this.handleClick}
      >
        ${
          this.loading
            ? html`<span part="spinner" aria-hidden="true"></span>`
            : html`<slot name="start"></slot>`
        }
        <slot></slot>
        <slot name="end"></slot>
      </button>
    `;
  }
}

registerAdsElement('button', AdsButton);

declare global {
  interface HTMLElementTagNameMap {
    'ads-button': AdsButton;
  }
}
