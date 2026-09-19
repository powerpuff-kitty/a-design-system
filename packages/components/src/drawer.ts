import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, query } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsDrawerPosition = 'start' | 'end';

export const adsDrawerContract = defineComponentContract({
  name: 'AdsDrawer',
  tagName: 'ads-drawer',
  description: 'A side panel for navigation, tasks, and contextual content.',
  status: 'experimental',
  attributes: [
    { name: 'open', type: 'boolean', default: 'false' },
    { name: 'position', type: "'start' | 'end'", default: 'end' },
    { name: 'modal', type: 'boolean', default: 'true' },
  ],
  properties: [
    { name: 'open', type: 'boolean' },
    { name: 'position', type: "'start' | 'end'" },
    { name: 'modal', type: 'boolean' },
  ],
  slots: [
    { name: 'title', description: 'The drawer title.' },
    { name: 'default', description: 'The drawer content.' },
    { name: 'actions', description: 'Actions for the drawer.' },
  ],
  parts: [
    { name: 'dialog', description: 'The native drawer dialog.' },
    { name: 'title', description: 'The drawer title.' },
    { name: 'content', description: 'The drawer content region.' },
    { name: 'actions', description: 'The drawer actions region.' },
  ],
  events: [
    {
      name: 'ads-close',
      description: 'Fired when the drawer closes.',
      bubbles: true,
      composed: true,
    },
  ],
});

export class AdsDrawer extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    dialog {
      box-sizing: border-box;
      width: min(90vw, 24rem);
      max-width: 100%;
      height: 100dvh;
      max-height: 100dvh;
      margin: 0;
      border: 0;
      border-inline: 1px solid ButtonBorder;
      padding: 1.25rem;
      background: Canvas;
      color: CanvasText;
      box-shadow: 0 0 1.5rem color-mix(in srgb, CanvasText 18%, transparent);
    }
    dialog[part='dialog'] {
      position: fixed;
      inset-block: 0;
    }
    :host([position='start']) dialog[part='dialog'] {
      inset-inline-start: 0;
    }
    :host([position='end']) dialog[part='dialog'] {
      inset-inline-end: 0;
    }
    dialog::backdrop {
      background: color-mix(in srgb, CanvasText 45%, transparent);
    }
    [part='title'] {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
    }
    [part='content'] {
      overflow: auto;
      margin-block: 1rem;
    }
    [part='actions'] {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-block-start: 1rem;
    }
  `;

  @property({ type: Boolean, reflect: true }) open = false;
  @property({ reflect: true }) position: AdsDrawerPosition = 'end';
  @property({ type: Boolean, reflect: true }) modal = true;

  @query('dialog') private dialog?: HTMLDialogElement;
  private shownModal = false;
  private changingPresentation = false;

  protected override updated(changed: Map<string, unknown>) {
    if (!changed.has('open') && !changed.has('modal')) return;
    if (!this.dialog) return;

    if (this.open && !this.dialog.open) {
      this.shownModal = this.modal;
      if (this.modal) this.dialog.showModal();
      else this.dialog.show();
    } else if (!this.open && this.dialog.open) {
      this.dialog.close();
    } else if (this.open && this.dialog.open && this.shownModal !== this.modal) {
      this.changingPresentation = true;
      this.dialog.close();
      this.changingPresentation = false;
      this.shownModal = this.modal;
      if (this.modal) this.dialog.showModal();
      else this.dialog.show();
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
    if (this.changingPresentation) return;
    this.close();
  };

  private handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && !this.modal) {
      event.preventDefault();
      this.close();
    }
  };

  override render() {
    return html`<dialog
      part="dialog"
      aria-modal=${this.modal ? 'true' : 'false'}
      aria-labelledby="ads-drawer-title"
      @cancel=${this.handleCancel}
      @close=${this.handleNativeClose}
      @keydown=${this.handleKeydown}
    >
      <h2 id="ads-drawer-title" part="title"><slot name="title"></slot></h2>
      <section part="content"><slot></slot></section>
      <footer part="actions"><slot name="actions"></slot></footer>
    </dialog>`;
  }
}

registerAdsElement('drawer', AdsDrawer);
