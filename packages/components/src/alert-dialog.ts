import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export const adsAlertDialogContract = defineComponentContract({
  name: 'AdsAlertDialog',
  tagName: 'ads-alert-dialog',
  description: 'A modal confirmation dialog for urgent, consequential actions.',
  status: 'experimental',
  attributes: [{ name: 'open', type: 'boolean', default: 'false' }],
  properties: [{ name: 'open', type: 'boolean' }],
  slots: [
    { name: 'title', description: 'The alert dialog title.' },
    { name: 'description', description: 'The alert dialog message.' },
    { name: 'actions', description: 'Confirmation and cancellation actions.' },
  ],
  parts: [{ name: 'dialog', description: 'The native modal alert dialog.' }],
  events: [
    {
      name: 'ads-close',
      description: 'Fired when the alert dialog closes.',
      bubbles: true,
      composed: true,
    },
  ],
});

let alertDialogId = 0;

export class AdsAlertDialog extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    dialog {
      width: min(90vw, 32rem);
      max-width: 100%;
      border: 1px solid ButtonBorder;
      border-radius: 0.75rem;
      padding: 1.5rem;
      background: Canvas;
      color: CanvasText;
    }
    dialog::backdrop {
      background: color-mix(in srgb, CanvasText 55%, transparent);
    }
    [part='title'] {
      margin: 0;
      font-weight: 700;
    }
    [part='description'] {
      margin: 0.75rem 0 0;
    }
    [part='actions'] {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;

  @query('dialog') private dialog?: HTMLDialogElement;
  private readonly titleId = `ads-alert-dialog-title-${++alertDialogId}`;
  private readonly descriptionId = `ads-alert-dialog-description-${alertDialogId}`;

  protected override updated(changed: Map<string, unknown>) {
    if (!changed.has('open') || !this.dialog) return;

    if (this.open && !this.dialog.open) {
      this.dialog.showModal();
    } else if (!this.open && this.dialog.open) {
      this.dialog.close();
    }
  }

  private close = () => {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event('ads-close', { bubbles: true, composed: true }));
  };

  private handleCancel = (event: Event) => {
    event.preventDefault();
    this.close();
  };

  private handleNativeClose = () => {
    this.close();
  };

  override render() {
    return html`<dialog
      part="dialog"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby=${this.titleId}
      aria-describedby=${this.descriptionId}
      @cancel=${this.handleCancel}
      @close=${this.handleNativeClose}
    >
      <h2 id=${this.titleId} part="title"><slot name="title"></slot></h2>
      <p id=${this.descriptionId} part="description"><slot name="description"></slot></p>
      <footer part="actions"><slot name="actions"></slot></footer>
    </dialog>`;
  }
}

registerAdsElement('alert-dialog', AdsAlertDialog);
