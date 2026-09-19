import { defineComponentContract } from '@a-design-system/core';
import { LitElement, css, html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';

export type AdsToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type AdsToastDismissReason = 'action' | 'timeout' | 'programmatic';

export interface AdsToastDismissDetail {
  reason: AdsToastDismissReason;
}

export const adsToastItemContract = defineComponentContract({
  name: 'Toast Item',
  tagName: 'ads-toast-item',
  description: 'Individual toast notification with dismissal, timeout, and pause/resume behavior.',
  status: 'experimental',
  attributes: [
    { name: 'variant', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", default: 'neutral' },
    { name: 'duration', type: 'number', default: '5000' },
    { name: 'dismissible', type: 'boolean', default: 'true' },
    { name: 'open', type: 'boolean', default: 'true' },
  ],
  methods: [
    {
      name: 'dismiss',
      signature: "dismiss(reason?: 'action' | 'timeout' | 'programmatic'): void",
      description: 'Dismisses the toast and emits ads-toast-dismiss.',
    },
  ],
  events: [
    {
      name: 'ads-toast-dismiss',
      detail: "{ reason: 'action' | 'timeout' | 'programmatic' }",
      description: 'Fired when the toast is dismissed.',
      bubbles: true,
      composed: true,
    },
  ],
  slots: [
    { name: 'icon', description: 'Optional leading icon.' },
    { name: 'title', description: 'Optional notification title.' },
    { name: '', description: 'Notification message.' },
    { name: 'actions', description: 'Optional actions.' },
  ],
  parts: [
    { name: 'toast', description: 'Toast surface.' },
    { name: 'icon', description: 'Icon slot.' },
    { name: 'content', description: 'Content region.' },
    { name: 'title', description: 'Title slot.' },
    { name: 'message', description: 'Message slot.' },
    { name: 'actions', description: 'Actions slot.' },
    { name: 'close-button', description: 'Dismiss button.' },
  ],
  cssCustomProperties: [
    { name: '--ads-toast-width', default: 'min(24rem, calc(100vw - 2rem))' },
    { name: '--ads-toast-background', default: 'var(--ads-color-surface-default, #fff)' },
    { name: '--ads-toast-border', default: 'var(--ads-color-line-default, #dedee3)' },
    { name: '--ads-toast-radius', default: 'var(--ads-radius-panel, 0px)' },
    { name: '--ads-toast-shadow', default: 'var(--ads-elevation-overlay, none)' },
    { name: '--ads-toast-accent', default: 'var(--ads-color-line-control, #85858f)', description: 'Leading border color; variants supply a fallback without masking consumer overrides.' },
    { name: '--ads-toast-accent-width', default: '3px', description: 'Logical leading border width.' },
    { name: '--ads-toast-color', default: 'var(--ads-color-text-default, #202025)', description: 'Notification foreground color.' },
    { name: '--ads-toast-message-color', default: 'var(--ads-color-text-muted, #5b5b65)', description: 'Notification message text color.' },
    { name: '--ads-toast-padding', default: '0.875rem', description: 'Notification surface padding.' },
  ],
});

export class AdsToastItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
      inline-size: var(--ads-toast-width, min(24rem, calc(100vw - 2rem)));
      max-inline-size: 100%;
      pointer-events: auto;
    }

    :host([hidden]),
    :host(:not([open])) {
      display: none;
    }

    [part='toast'] {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 0.75rem;
      padding: var(--ads-toast-padding, 0.875rem);
      border: 1px solid var(--ads-toast-border, var(--ads-color-line-default, #dedee3));
      border-inline-start: var(--ads-toast-accent-width, 3px) solid
        var(--ads-toast-accent, var(--ads-color-line-control, #85858f));
      border-radius: var(--ads-toast-radius, var(--ads-radius-panel, 0px));
      background: var(--ads-toast-background, var(--ads-color-surface-default, #fff));
      color: var(--ads-toast-color, var(--ads-color-text-default, #202025));
      box-shadow: var(--ads-toast-shadow, var(--ads-elevation-overlay, none));
    }

    :host([variant='info']) [part='toast'] {
      border-inline-start-color: var(--ads-toast-accent, var(--ads-color-action, var(--ads-color-action-primary, #315efb)));
    }

    :host([variant='success']) [part='toast'] {
      border-inline-start-color: var(--ads-toast-accent, var(--ads-color-success-strong, #067647));
    }

    :host([variant='warning']) [part='toast'] {
      border-inline-start-color: var(--ads-toast-accent, var(--ads-color-warning-strong, #b54708));
    }

    :host([variant='danger']) [part='toast'] {
      border-inline-start-color: var(--ads-toast-accent, var(--ads-color-danger-strong, var(--ads-color-state-danger, #b42318)));
    }

    [part='content'] {
      min-inline-size: 0;
    }

    [part='title'] {
      display: block;
      font-weight: 650;
    }

    [part='message'] {
      display: block;
      margin-block-start: 0.125rem;
      color: var(--ads-toast-message-color, var(--ads-color-text-muted, #5b5b65));
      line-height: 1.45;
    }

    [part='actions'] {
      display: block;
      margin-block-start: 0.625rem;
    }

    [part='close-button'] {
      display: inline-grid;
      inline-size: 1.75rem;
      block-size: 1.75rem;
      place-items: center;
      margin: -0.25rem -0.25rem 0 0;
      padding: 0;
      border: 0;
      border-radius: var(--ads-radius-control, 0.375rem);
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
    }

    [part='close-button']:hover {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }

    [part='close-button']:focus-visible {
      outline: var(--ads-focus-width, 2px) solid var(--ads-focus-color, currentColor);
      outline-offset: var(--ads-focus-offset, 2px);
    }

    ::slotted([slot='icon']) {
      inline-size: 1.25rem;
      block-size: 1.25rem;
    }
  `;

  @property({ reflect: true }) variant: AdsToastVariant = 'neutral';
  @property({ type: Number }) duration = 5000;
  @property({ type: Boolean, reflect: true }) dismissible = true;
  @property({ type: Boolean, reflect: true }) open = true;

  private timeoutId: number | undefined;
  private startedAt = 0;
  private remaining = 0;
  private pointerPaused = false;
  private focusPaused = false;

  override disconnectedCallback(): void {
    this.clearTimer();
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has('duration') || changed.has('open')) {
      this.restartTimer();
    }
  }

  dismiss(reason: AdsToastDismissReason = 'programmatic'): void {
    if (!this.open) return;
    this.open = false;
    this.clearTimer();
    this.dispatchEvent(
      new CustomEvent<AdsToastDismissDetail>('ads-toast-dismiss', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private clearTimer(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  private restartTimer(): void {
    this.clearTimer();
    this.remaining = Math.max(0, Number.isFinite(this.duration) ? this.duration : 0);
    if (!this.open || this.duration <= 0 || this.pointerPaused || this.focusPaused) return;
    this.scheduleTimer();
  }

  private scheduleTimer(): void {
    if (!this.open || this.duration <= 0 || this.remaining <= 0) return;
    this.startedAt = performance.now();
    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = undefined;
      this.remaining = 0;
      this.dismiss('timeout');
    }, this.remaining);
  }

  private pauseTimer(): void {
    if (this.timeoutId === undefined) return;
    const elapsed = performance.now() - this.startedAt;
    this.remaining = Math.max(0, this.remaining - elapsed);
    this.clearTimer();
  }

  private resumeTimer(): void {
    if (this.pointerPaused || this.focusPaused || this.timeoutId !== undefined) return;
    this.scheduleTimer();
  }

  private handlePointerEnter(): void {
    this.pointerPaused = true;
    this.pauseTimer();
  }

  private handlePointerLeave(): void {
    this.pointerPaused = false;
    this.resumeTimer();
  }

  private handleFocusIn(): void {
    this.focusPaused = true;
    this.pauseTimer();
  }

  private handleFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && (this.contains(next) || this.renderRoot.contains(next))) return;
    this.focusPaused = false;
    this.resumeTimer();
  }

  override render() {
    return html`
      <div
        part="toast"
        @pointerenter=${this.handlePointerEnter}
        @pointerleave=${this.handlePointerLeave}
        @focusin=${this.handleFocusIn}
        @focusout=${this.handleFocusOut}
      >
        <slot part="icon" name="icon"></slot>
        <div part="content">
          <slot part="title" name="title"></slot>
          <slot part="message"></slot>
          <slot part="actions" name="actions"></slot>
        </div>
        ${this.dismissible
          ? html`
              <button
                part="close-button"
                type="button"
                aria-label="Dismiss notification"
                @click=${() => this.dismiss('action')}
              >
                <span aria-hidden="true">×</span>
              </button>
            `
          : null}
      </div>
    `;
  }
}

registerAdsElement('toast-item', AdsToastItem);

declare global {
  interface HTMLElementTagNameMap {
    'ads-toast-item': AdsToastItem;
  }
}
