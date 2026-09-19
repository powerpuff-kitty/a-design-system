import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsDialogContract = defineComponentContract({
  name: 'AdsDialog',
  tagName: 'ads-dialog',
  description: 'A modal dialog backed by the native dialog element.',
  status: 'experimental',
  attributes: [{ name: 'open', type: 'boolean', default: 'false' }],
  properties: [{ name: 'open', type: 'boolean' }],
  slots: [
    { name: 'title', description: 'Dialog title.' },
    { name: 'default', description: 'Dialog content.' },
    { name: 'actions', description: 'Dialog actions.' },
  ],
  parts: [
    { name: 'dialog', description: 'The native dialog.' },
    { name: 'title', description: 'The dialog title.' },
    { name: 'content', description: 'The dialog content.' },
    { name: 'actions', description: 'The dialog actions.' },
  ],
  events: [
    {
      name: 'ads-close',
      description: 'Fired when the dialog closes.',
      bubbles: true,
      composed: true,
    },
  ],
});

let dialogId = 0;
export class AdsDialog extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    dialog {
      max-width: min(90vw, 36rem);
      border: 1px solid ButtonBorder;
      border-radius: 0.75rem;
      padding: 1.5rem;
      background: Canvas;
      color: CanvasText;
    }
    dialog::backdrop {
      background: color-mix(in srgb, CanvasText 45%, transparent);
    }
    header {
      font-weight: 700;
      margin-bottom: 1rem;
    }
    footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `;
  @property({ type: Boolean, reflect: true }) open = false;
  @query('dialog') private dialog?: HTMLDialogElement;
  private readonly titleId = `ads-dialog-title-${++dialogId}`;
  private readonly contentId = `ads-dialog-content-${dialogId}`;
  protected updated(changed: Map<string, unknown>) {
    if (!changed.has('open') || !this.dialog) return;
    if (this.open && !this.dialog.open) this.dialog.showModal();
    else if (!this.open && this.dialog.open) this.dialog.close();
  }
  private handleCancel = (event: Event) => {
    event.preventDefault();
    this.close();
  };

  private handleNativeClose = () => {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('ads-close', { bubbles: true, composed: true }));
  };

  private close = () => {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('ads-close', { bubbles: true, composed: true }));
  };
  override render() {
    return html`<dialog
      part="dialog"
      aria-labelledby=${this.titleId}
      aria-describedby=${this.contentId}
      @cancel=${this.handleCancel}
      @close=${this.handleNativeClose}
    >
      <header part="title" id=${this.titleId}><slot name="title"></slot></header>
      <section part="content" id=${this.contentId}><slot></slot></section>
      <footer part="actions"><slot name="actions"></slot></footer>
    </dialog>`;
  }
}
registerAdsElement('dialog', AdsDialog);
