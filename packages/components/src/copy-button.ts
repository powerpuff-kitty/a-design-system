import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsCopyButtonContract = defineComponentContract({
  name: 'Copy Button',
  tagName: 'ads-copy-button',
  description: 'Native-button clipboard action that copies an explicit value or text/value from a referenced element.',
  status: 'experimental',
  attributes: [
    { name: 'value', type: 'string', default: '' },
    { name: 'for', type: 'string', default: '' },
    { name: 'label', type: 'string', default: 'Copy' },
    { name: 'copied-label', type: 'string', default: 'Copied' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'feedback-duration', type: 'number', default: '1500' },
  ],
  methods: [
    { name: 'copy', signature: 'copy(): Promise<boolean>', description: 'Copies the resolved text and returns whether it succeeded.' },
  ],
  events: [
    {
      name: 'ads-copy',
      detail: '{ value: string }',
      description: 'Fired after text is copied.',
      bubbles: true,
      composed: true,
    },
    {
      name: 'ads-copy-error',
      detail: '{ error: unknown }',
      description: 'Fired when clipboard write fails or no copyable value is available.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [{ name: '', description: 'Optional visible button label/content.' }],
  parts: [{ name: 'button', description: 'The internal native button.' }],
  cssCustomProperties: [
    { name: '--ads-copy-button-radius', default: 'var(--ads-radius-control, 0px)' },
    { name: '--ads-copy-button-background', default: 'var(--ads-color-surface-default, #fff)' },
    { name: '--ads-copy-button-border', default: 'var(--ads-color-line-control, #d7d7dc)' },
    { name: '--ads-copy-button-color', default: 'var(--ads-color-text-default, #111114)', description: 'Text color inherited by the component content.' },
  ],
});

function elementText(element: Element | null): string {
  if (!element) return '';
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return element.value;
  return element.textContent ?? '';
}

export class AdsCopyButton extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
    }

    :host([hidden]) {
      display: none;
    }

    button {
      box-sizing: border-box;
      min-block-size: var(--ads-control-size, 2.5rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      margin: 0;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--ads-copy-button-border, var(--ads-color-line-control, #d7d7dc));
      border-radius: var(--ads-copy-button-radius, var(--ads-radius-control, 0px));
      background: var(--ads-copy-button-background, var(--ads-color-surface-default, #fff));
      color: var(--ads-copy-button-color, var(--ads-color-text-default, #111114));
      font: inherit;
      font-weight: 600;
      line-height: 1;
      cursor: pointer;
    }

    button:focus-visible {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }
  `;

  @property() value = '';
  @property({ attribute: 'for' }) forId = '';
  @property() label = 'Copy';
  @property({ attribute: 'copied-label' }) copiedLabel = 'Copied';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Number, attribute: 'feedback-duration' }) feedbackDuration = 1500;
  @state() private copied = false;
  private feedbackTimer?: number;

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.feedbackTimer !== undefined) window.clearTimeout(this.feedbackTimer);
  }

  private resolveValue(): string {
    if (this.value) return this.value;
    if (!this.forId) return '';

    const root = this.getRootNode();
    if (root instanceof Document || root instanceof ShadowRoot) {
      return elementText(root.getElementById(this.forId));
    }
    return '';
  }

  async copy(): Promise<boolean> {
    if (this.disabled) return false;
    const value = this.resolveValue();

    if (!value || !navigator.clipboard?.writeText) {
      this.dispatchEvent(
        new CustomEvent('ads-copy-error', {
          detail: { error: new Error('Clipboard API unavailable or no copyable value resolved.') },
          bubbles: true,
          composed: true,
        }),
      );
      return false;
    }

    try {
      await navigator.clipboard.writeText(value);
      this.copied = true;
      this.setAttribute('data-copied', '');
      this.dispatchEvent(
        new CustomEvent('ads-copy', {
          detail: { value },
          bubbles: true,
          composed: true,
        }),
      );

      if (this.feedbackTimer !== undefined) window.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = window.setTimeout(() => {
        this.copied = false;
        this.removeAttribute('data-copied');
      }, Math.max(0, this.feedbackDuration));
      return true;
    } catch (error) {
      this.dispatchEvent(
        new CustomEvent('ads-copy-error', {
          detail: { error },
          bubbles: true,
          composed: true,
        }),
      );
      return false;
    }
  }

  private handleClick(): void {
    void this.copy();
  }

  override render() {
    return html`
      <button
        part="button"
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.copied ? this.copiedLabel : this.label}
        @click=${this.handleClick}
      >
        <slot>${this.copied ? this.copiedLabel : this.label}</slot>
      </button>
    `;
  }
}

registerAdsElement('copy-button', AdsCopyButton);

declare global {
  interface HTMLElementTagNameMap {
    'ads-copy-button': AdsCopyButton;
  }
}
