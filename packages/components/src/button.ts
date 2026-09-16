import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type AdsButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type AdsButtonType = 'button' | 'submit' | 'reset';

/**
 * Accessible action control for A Design System.
 *
 * @slot - Button label/content.
 * @slot start - Leading icon or decoration.
 * @slot end - Trailing icon or decoration.
 * @csspart button - The native button element.
 */
@customElement('ads-button')
export class AdsButton extends LitElement {
  static formAssociated = true;

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
      padding: var(--ads-button-padding-block, 0.625rem)
        var(--ads-button-padding-inline, 0.875rem);
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

  private readonly internals = this.attachInternals();

  @property({ reflect: true }) variant: AdsButtonVariant = 'primary';
  @property({ reflect: true }) type: AdsButtonType = 'button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ reflect: true }) name = '';
  @property({ reflect: true }) value = '';

  override updated(): void {
    this.internals.ariaDisabled = String(this.disabled || this.loading);
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  private activateForm(): void {
    const form = this.internals.form;
    if (!form) return;

    if (this.type === 'reset') {
      form.reset();
      return;
    }

    if (this.type !== 'submit') return;

    // A native submitter in the light DOM preserves native submit/validation
    // semantics while the visible native <button> remains inside Shadow DOM.
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
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.activateForm();
  }

  override render() {
    const unavailable = this.disabled || this.loading;

    return html`
      <button
        part="button"
        type="button"
        ?disabled=${unavailable}
        aria-busy=${this.loading ? 'true' : 'false'}
        @click=${this.handleClick}
      >
        ${this.loading
          ? html`<span part="spinner" aria-hidden="true"></span>`
          : html`<slot name="start"></slot>`}
        <slot></slot>
        <slot name="end"></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ads-button': AdsButton;
  }
}
