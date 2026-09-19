import { defineComponentContract } from '@a-design-system/core';
import { css, html } from 'lit';
import { property } from 'lit/decorators.js';
import { FormAssociatedElement } from './runtime/form-associated-element.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsIconButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AdsIconButtonType = 'button' | 'submit' | 'reset';

export const adsIconButtonContract = defineComponentContract({
  name: 'Icon Button',
  tagName: 'ads-icon-button',
  description: 'Accessible icon-only action control with native button and form semantics.',
  status: 'experimental',
  attributes: [
    { name: 'label', type: 'string', default: '', required: true },
    { name: 'variant', type: "'primary' | 'secondary' | 'ghost' | 'danger'", default: 'ghost' },
    { name: 'type', type: "'button' | 'submit' | 'reset'", default: 'button' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'loading', type: 'boolean', default: 'false' },
    { name: 'name', type: 'string', default: '' },
    { name: 'value', type: 'string', default: '' },
  ],
  slots: [{ name: '', description: 'Icon content. Decorative icon markup should use aria-hidden.' }],
  parts: [
    { name: 'button', description: 'The internal native button.' },
    { name: 'spinner', description: 'Loading indicator rendered while loading.' },
  ],
  cssCustomProperties: [
    { name: '--ads-control-size', default: '2.5rem' },
    { name: '--ads-icon-button-size', default: 'var(--ads-control-size, 2.5rem)' },
    { name: '--ads-icon-button-radius', default: 'var(--ads-radius-control, 0px)' },
    { name: '--ads-disabled-opacity', default: '0.5' },
    { name: '--ads-icon-button-border-width', default: '1px', description: 'Native icon button border width.' },
    { name: '--ads-icon-button-padding', default: '0.5rem', description: 'Internal icon button padding; does not enlarge the configured button size.' },
    { name: '--ads-button-active-brightness', default: '0.9', description: 'Shared button token. Unitless brightness multiplier during enabled pointer activation.' },
    { name: '--ads-button-danger-background', default: 'var(--ads-color-state-danger, #b42318)', description: 'Shared button token. Danger variant background color.' },
    { name: '--ads-button-danger-color', default: 'var(--ads-color-state-dangerText, #fff)', description: 'Shared button token. Danger variant foreground color.' },
    { name: '--ads-button-ghost-color', default: 'var(--ads-color-text-default, #111114)', description: 'Shared button token. Ghost variant foreground color.' },
    { name: '--ads-button-hover-brightness', default: '0.96', description: 'Shared button token. Unitless brightness multiplier on enabled hover.' },
    { name: '--ads-button-primary-background', default: 'var(--ads-color-action-primary, #111114)', description: 'Shared button token. Primary variant background color.' },
    { name: '--ads-button-primary-color', default: 'var(--ads-color-action-primaryText, #fff)', description: 'Shared button token. Primary variant foreground color.' },
    { name: '--ads-button-secondary-background', default: 'var(--ads-color-surface-default, #fff)', description: 'Shared button token. Secondary variant background color.' },
    { name: '--ads-button-secondary-border', default: 'var(--ads-color-line-control, #d7d7dc)', description: 'Shared button token. Secondary variant border color.' },
    { name: '--ads-button-secondary-color', default: 'var(--ads-color-text-default, #111114)', description: 'Shared button token. Secondary variant foreground color.' },
  ],
  states: [
    { name: 'disabled', description: 'Unavailable for interaction.' },
    { name: 'loading', description: 'Busy and unavailable for repeated activation.' },
  ],
});

export class AdsIconButton extends FormAssociatedElement {
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
      inline-size: var(--ads-icon-button-size, var(--ads-control-size, 2.5rem));
      block-size: var(--ads-icon-button-size, var(--ads-control-size, 2.5rem));
      display: inline-grid;
      place-items: center;
      margin: 0;
      padding: var(--ads-icon-button-padding, 0.5rem);
      border: var(--ads-icon-button-border-width, 1px) solid transparent;
      border-radius: var(--ads-icon-button-radius, var(--ads-radius-control, 0px));
      font: inherit;
      line-height: 1;
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
      background: var(--ads-button-primary-background, var(--ads-color-action-primary, #111114));
      color: var(--ads-button-primary-color, var(--ads-color-action-primaryText, #fff));
    }

    :host([variant='secondary']) button {
      border-color: var(--ads-button-secondary-border, var(--ads-color-line-control, #d7d7dc));
      background: var(--ads-button-secondary-background, var(--ads-color-surface-default, #fff));
      color: var(--ads-button-secondary-color, var(--ads-color-text-default, #111114));
    }

    :host([variant='ghost']) button {
      background: transparent;
      color: var(--ads-button-ghost-color, var(--ads-color-text-default, #111114));
    }

    :host([variant='danger']) button {
      background: var(--ads-button-danger-background, var(--ads-color-state-danger, #b42318));
      color: var(--ads-button-danger-color, var(--ads-color-state-dangerText, #fff));
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
      animation: ads-icon-button-spin 0.7s linear infinite;
    }

    ::slotted(*) {
      inline-size: 1em;
      block-size: 1em;
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }

      [part='spinner'] {
        animation-duration: 1.4s;
      }
    }

    @keyframes ads-icon-button-spin {
      to {
        transform: rotate(1turn);
      }
    }
  `;

  @property({ reflect: true }) label = '';
  @property({ reflect: true }) variant: AdsIconButtonVariant = 'ghost';
  @property({ reflect: true }) type: AdsIconButtonType = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';

  override updated(): void {
    this.internals.ariaDisabled = String(this.disabled || this.formDisabled || this.loading);
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
        aria-label=${this.label}
        aria-busy=${this.loading ? 'true' : 'false'}
        @click=${this.handleClick}
      >
        ${this.loading ? html`<span part="spinner" aria-hidden="true"></span>` : html`<slot></slot>`}
      </button>
    `;
  }
}

registerAdsElement('icon-button', AdsIconButton);

declare global {
  interface HTMLElementTagNameMap {
    'ads-icon-button': AdsIconButton;
  }
}
