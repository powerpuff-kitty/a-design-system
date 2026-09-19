import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { registerAdsElement } from './runtime/registration.js';
export const adsSwitchContract = defineComponentContract({
  name: 'AdsSwitch',
  tagName: 'ads-switch',
  description: 'Toggles a setting between on and off.',
  status: 'experimental',
  attributes: [
    { name: 'checked', type: 'boolean', default: 'false' },
    { name: 'disabled', type: 'boolean', default: 'false' },
  ],
  properties: [
    { name: 'checked', type: 'boolean' },
    { name: 'disabled', type: 'boolean' },
  ],
  slots: [{ name: 'default', description: 'Switch label.' }],
  events: [
    {
      name: 'ads-change',
      description: 'Fired when the switch changes.',
      bubbles: true,
      composed: true,
    },
  ],
});
export class AdsSwitch extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
    }
    label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }
    input {
      width: 2.25rem;
      height: 1.25rem;
      accent-color: currentColor;
    }
    input:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  `;
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  private change = (event: Event) => {
    this.checked = (event.target as HTMLInputElement).checked;
    this.dispatchEvent(new Event('ads-change', { bubbles: true, composed: true }));
  };
  override render() {
    return html`<label
      ><input
        type="checkbox"
        role="switch"
        .checked=${this.checked}
        ?disabled=${this.disabled}
        @change=${this.change} /><slot></slot
    ></label>`;
  }
}
registerAdsElement('switch', AdsSwitch);
