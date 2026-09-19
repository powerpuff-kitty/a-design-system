import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import {
  AdsToastItem,
  type AdsToastDismissDetail,
  type AdsToastVariant,
} from './toast-item.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsToastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export type AdsToastLive = 'polite' | 'assertive' | 'off';

export interface AdsToastOptions {
  id?: string;
  title?: string;
  message: string;
  variant?: AdsToastVariant;
  duration?: number;
  dismissible?: boolean;
}

export const adsToastContract = defineComponentContract({
  name: 'Toast',
  tagName: 'ads-toast',
  description: 'Toast viewport and queue manager with configurable live-region policy and placement.',
  status: 'experimental',
  attributes: [
    {
      name: 'position',
      type: "'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'",
      default: 'bottom-end',
    },
    { name: 'live', type: "'polite' | 'assertive' | 'off'", default: 'polite' },
    { name: 'limit', type: 'number', default: '5' },
  ],
  methods: [
    {
      name: 'push',
      signature: 'push(options: AdsToastOptions): AdsToastItem',
      description: 'Adds a toast immediately or queues it until capacity is available.',
    },
    {
      name: 'dismissAll',
      signature: 'dismissAll(): void',
      description: 'Dismisses mounted toasts and clears queued toasts.',
    },
  ],
  events: [
    {
      name: 'ads-toast-dismiss',
      detail: "{ reason: 'action' | 'timeout' | 'programmatic' }",
      description: 'Bubbles from a toast item when it is dismissed.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [{ name: '', description: 'Declarative ads-toast-item children.' }],
  parts: [{ name: 'stack', description: 'Toast stack and live region.' }],
  cssCustomProperties: [
    { name: '--ads-toast-offset', default: '1rem' },
    { name: '--ads-toast-stack-gap', default: '0.75rem' },
    { name: '--ads-toast-stack-z-index', default: '1000' },
  ],
});

export class AdsToast extends LitElement {
  static override styles = css`
    :host {
      position: fixed;
      z-index: var(--ads-toast-stack-z-index, 1000);
      display: block;
      max-inline-size: calc(100vw - (2 * var(--ads-toast-offset, 1rem)));
      pointer-events: none;
    }

    :host([hidden]) {
      display: none;
    }

    :host([position='top-start']) {
      inset-block-start: var(--ads-toast-offset, 1rem);
      inset-inline-start: var(--ads-toast-offset, 1rem);
    }

    :host([position='top-center']) {
      inset-block-start: var(--ads-toast-offset, 1rem);
      inset-inline-start: 50%;
      transform: translateX(-50%);
    }

    :host([position='top-end']) {
      inset-block-start: var(--ads-toast-offset, 1rem);
      inset-inline-end: var(--ads-toast-offset, 1rem);
    }

    :host([position='bottom-start']) {
      inset-block-end: var(--ads-toast-offset, 1rem);
      inset-inline-start: var(--ads-toast-offset, 1rem);
    }

    :host([position='bottom-center']) {
      inset-block-end: var(--ads-toast-offset, 1rem);
      inset-inline-start: 50%;
      transform: translateX(-50%);
    }

    :host([position='bottom-end']) {
      inset-block-end: var(--ads-toast-offset, 1rem);
      inset-inline-end: var(--ads-toast-offset, 1rem);
    }

    [part='stack'] {
      display: flex;
      flex-direction: column;
      gap: var(--ads-toast-stack-gap, 0.75rem);
      align-items: stretch;
    }

    ::slotted(ads-toast-item) {
      pointer-events: auto;
    }
  `;

  @property({ reflect: true }) position: AdsToastPosition = 'bottom-end';
  @property({ reflect: true }) live: AdsToastLive = 'polite';
  @property({ type: Number }) limit = 5;

  private readonly queue: AdsToastItem[] = [];
  private toastCounter = 0;
  private readonly dismissListener = (event: Event) => {
    this.handleDismiss(event as CustomEvent<AdsToastDismissDetail>);
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('ads-toast-dismiss', this.dismissListener);
  }

  override disconnectedCallback(): void {
    this.removeEventListener('ads-toast-dismiss', this.dismissListener);
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has('limit')) this.drainQueue();
  }

  push(options: AdsToastOptions): AdsToastItem {
    const item = document.createElement('ads-toast-item');
    item.id = options.id || `ads-toast-${++this.toastCounter}`;
    item.variant = options.variant ?? 'neutral';
    item.duration = options.duration ?? 5000;
    item.dismissible = options.dismissible ?? true;

    if (options.title) {
      const title = document.createElement('span');
      title.slot = 'title';
      title.textContent = options.title;
      item.append(title);
    }

    item.append(document.createTextNode(options.message));

    if (this.activeItems.length < this.normalizedLimit) {
      this.append(item);
    } else {
      this.queue.push(item);
    }

    return item;
  }

  dismissAll(): void {
    this.queue.splice(0);
    for (const item of this.activeItems) item.dismiss('programmatic');
  }

  private get normalizedLimit(): number {
    if (!Number.isFinite(this.limit)) return 5;
    return Math.max(1, Math.floor(this.limit));
  }

  private get activeItems(): AdsToastItem[] {
    return Array.from(this.children).filter(
      (child): child is AdsToastItem => child instanceof AdsToastItem && child.open,
    );
  }

  private handleDismiss(event: CustomEvent<AdsToastDismissDetail>): void {
    const item = event.target;
    if (!(item instanceof AdsToastItem) || item.parentElement !== this) return;

    item.remove();
    this.drainQueue();
  }

  private drainQueue(): void {
    while (this.queue.length > 0 && this.activeItems.length < this.normalizedLimit) {
      const next = this.queue.shift();
      if (next) this.append(next);
    }
  }

  override render() {
    return html`
      <div
        part="stack"
        aria-live=${this.live}
        aria-relevant=${this.live === 'off' ? nothing : 'additions text'}
        aria-atomic=${this.live === 'off' ? nothing : 'false'}
      >
        <slot></slot>
      </div>
    `;
  }
}

registerAdsElement('toast', AdsToast);

declare global {
  interface HTMLElementTagNameMap {
    'ads-toast': AdsToast;
  }
}
