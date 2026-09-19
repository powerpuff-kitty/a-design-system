import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsCopyButtonContract = defineComponentContract({
  name: 'AdsCopyButton',
  tagName: 'ads-copy-button',
  description: 'Copies a text value to the clipboard.',
  status: 'experimental',
  attributes: [{ name: 'value', type: 'string', required: true }],
  properties: [
    { name: 'value', type: 'string' },
    { name: 'disabled', type: 'boolean' },
  ],
  slots: [{ name: 'default', description: 'Button label.' }],
  parts: [{ name: 'button', description: 'The copy button.' }],
  events: [
    {
      name: 'ads-copy',
      description: 'Fired after a successful copy.',
      bubbles: true,
      composed: true,
    },
  ],
  states: [{ name: 'disabled', description: 'Unavailable for interaction.' }],
});
export class AdsCopyButton extends LitElement {
  static styles = css`
    button {
      min-height: 2rem;
      padding: 0.375rem 0.625rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.375rem;
      background: ButtonFace;
      color: ButtonText;
      font: inherit;
      cursor: pointer;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    button:disabled {
      cursor: not-allowed;
      opacity: var(--ads-disabled-opacity, 0.5);
    }
    [part='status'] {
      margin-inline-start: 0.5rem;
    }
  `;
  @property() value = '';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @state() private copied = false;
  @state() private copying = false;
  @state() private status = '';
  private statusTimer?: ReturnType<typeof setTimeout>;

  override disconnectedCallback(): void {
    if (this.statusTimer) clearTimeout(this.statusTimer);
    super.disconnectedCallback();
  }

  private async copy() {
    if (this.disabled || this.copying) return;

    this.copying = true;
    this.status = '';
    try {
      await this.writeClipboard(this.value);
      this.copied = true;
      this.status = 'Copied';
      this.dispatchEvent(new Event('ads-copy', { bubbles: true, composed: true }));
      this.statusTimer = setTimeout(() => {
        this.copied = false;
        this.status = '';
      }, 1500);
    } catch {
      this.copied = false;
      this.status = 'Unable to copy';
    } finally {
      this.copying = false;
    }
  }

  private async writeClipboard(value: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('aria-hidden', 'true');
    textarea.readOnly = true;
    textarea.style.position = 'fixed';
    textarea.style.inset = '0';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    try {
      if (!document.execCommand('copy')) throw new Error('Clipboard copy failed');
    } finally {
      textarea.remove();
    }
  }

  override render() {
    return html`
      <button
        part="button"
        type="button"
        ?disabled=${this.disabled || this.copying}
        aria-busy=${this.copying ? 'true' : 'false'}
        @click=${this.copy}
      >
        <slot>Copy</slot>
      </button>
      <span part="status" role="status" aria-live="polite" aria-atomic="true">${this.status}</span>
    `;
  }
}
registerAdsElement('copy-button', AdsCopyButton);
