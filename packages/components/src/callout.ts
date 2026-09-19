import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsCalloutContract = defineComponentContract({
  name: 'AdsCallout',
  tagName: 'ads-callout',
  description: 'Highlights supporting guidance or important context.',
  status: 'experimental',
  attributes: [
    {
      name: 'tone',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'",
      default: 'neutral',
    },
  ],
  properties: [{ name: 'tone', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'" }],
  slots: [
    { name: 'heading', description: 'Callout heading.' },
    { name: 'default', description: 'Callout content.' },
  ],
  parts: [
    { name: 'callout', description: 'The callout surface.' },
    { name: 'heading', description: 'The callout heading.' },
  ],
});
export class AdsCallout extends LitElement {
  @state() private hasHeading = false;

  static styles = css`
    :host {
      display: block;
    }
    [part='callout'] {
      padding: 1rem;
      border-inline-start: 0.25rem solid var(--ads-callout-accent, currentColor);
      border-radius: var(--ads-callout-radius, var(--ads-radius-control, 0.375rem));
      background: var(--ads-callout-background, Canvas);
      color: var(--ads-callout-color, CanvasText);
    }
    [part='heading'] {
      display: block;
      margin-bottom: 0.375rem;
      font-weight: 650;
    }
    [hidden] {
      display: none;
    }
  `;
  @property({ reflect: true }) tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' =
    'neutral';
  protected firstUpdated() {
    this.updateHeadingState();
  }

  private updateHeadingState = () => {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot[name="heading"]');
    this.hasHeading = Boolean(
      slot
        ?.assignedNodes({ flatten: true })
        .some((node) => node.nodeType === Node.ELEMENT_NODE || Boolean(node.textContent?.trim())),
    );
  };

  override render() {
    return html`<aside part="callout" data-tone=${this.tone} role="note">
      <strong part="heading" ?hidden=${!this.hasHeading}
        ><slot name="heading" @slotchange=${this.updateHeadingState}></slot
      ></strong>
      <slot></slot>
    </aside>`;
  }
}
registerAdsElement('callout', AdsCallout);
