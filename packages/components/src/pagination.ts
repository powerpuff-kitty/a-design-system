import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsPaginationContract = defineComponentContract({
  name: 'AdsPagination',
  tagName: 'ads-pagination',
  description: 'Navigates between pages of a collection.',
  status: 'experimental',
  attributes: [
    { name: 'page', type: 'number', default: '1' },
    { name: 'pages', type: 'number', default: '1' },
  ],
  properties: [
    { name: 'page', type: 'number' },
    { name: 'pages', type: 'number' },
  ],
  parts: [{ name: 'pagination', description: 'The pagination navigation.' }],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when the page changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsPagination extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }
    nav {
      display: flex;
      gap: 0.25rem;
      align-items: center;
    }
    button {
      min-width: 2rem;
      min-height: 2rem;
      border: 1px solid ButtonBorder;
      border-radius: 0.375rem;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }
    button[aria-current='page'] {
      background: currentColor;
      color: Canvas;
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  @property({ type: Number, reflect: true }) page = 1;
  @property({ type: Number }) pages = 1;
  private change = (page: number) => {
    this.page = Math.min(this.pages, Math.max(1, page));
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };
  override render() {
    const items = Array.from({ length: Math.min(this.pages, 7) }, (_, index) => index + 1);
    return html`<nav part="pagination" aria-label="Pagination">
      <button
        type="button"
        ?disabled=${this.page === 1}
        @click=${() => this.change(this.page - 1)}
        aria-label="Previous page"
      >
        ‹</button
      >${items.map((item) => html`<button type="button" aria-current=${item === this.page ? 'page' : undefined} @click=${() => this.change(item)}>${item}</button>`)}<button
        type="button"
        ?disabled=${this.page === this.pages}
        @click=${() => this.change(this.page + 1)}
        aria-label="Next page"
      >
        ›
      </button>
    </nav>`;
  }
}
registerAdsElement('pagination', AdsPagination);
