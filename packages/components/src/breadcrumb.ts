import { defineComponentContract } from '@a-design-system/core';
import { css, html, LitElement } from 'lit';
import { registerAdsElement } from './runtime/registration.js';
export const adsBreadcrumbContract = defineComponentContract({
  name: 'AdsBreadcrumb',
  tagName: 'ads-breadcrumb',
  description: 'Provides a hierarchical path for the current page.',
  status: 'experimental',
  slots: [{ name: 'default', description: 'Breadcrumb links and separators.' }],
  parts: [{ name: 'breadcrumb', description: 'The navigation container.' }],
});
export class AdsBreadcrumb extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    nav {
      color: color-mix(in srgb, currentColor 75%, transparent);
      font-size: 0.9rem;
    }
  `;
  override render() {
    return html`<nav part="breadcrumb" aria-label="Breadcrumb"><slot></slot></nav>`;
  }
}
registerAdsElement('breadcrumb', AdsBreadcrumb);
