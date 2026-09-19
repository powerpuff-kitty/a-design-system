import { expect, test, type Locator, type Page } from '@playwright/test';

const themes = ['minimal-light', 'minimal-dark', 'minimal-high-contrast'] as const;
async function openLab(page: Page, theme: string): Promise<void> {
  await page.goto(`/?theme=${theme}`);
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}
async function style(host: Locator, selector: string, property: string): Promise<string> {
  return host.evaluate((node, args) => {
    const target = node.shadowRoot?.querySelector(args.selector);
    return target ? getComputedStyle(target).getPropertyValue(args.property) : '';
  }, { selector, property });
}
interface Binding {
  tag: string;
  markup: string;
  selector: string;
  token: string;
  property: string;
  value: string;
}
const bindings: Binding[] = [
  { tag: 'ads-avatar', markup: '<ads-avatar shape="square" alt="Alex" initials="AL"></ads-avatar>', selector: '[part="avatar"]', token: '--ads-avatar-square-radius', property: 'border-top-left-radius', value: '9px' },
  { tag: 'ads-button', markup: '<ads-button variant="secondary">Action</ads-button>', selector: 'button', token: '--ads-button-border-width', property: 'border-top-width', value: '3px' },
  { tag: 'ads-checkbox', markup: '<ads-checkbox>Option</ads-checkbox>', selector: '[part="indicator"]', token: '--ads-checkbox-border-width', property: 'border-top-width', value: '3px' },
  { tag: 'ads-checkbox-group', markup: '<ads-checkbox-group label="Options"><ads-checkbox>One</ads-checkbox></ads-checkbox-group>', selector: '[part="label"]', token: '--ads-checkbox-group-label-font-size', property: 'font-size', value: '21px' },
  { tag: 'ads-code', markup: '<ads-code block>const value = 1;</ads-code>', selector: 'pre', token: '--ads-code-block-padding', property: 'padding-top', value: '22px' },
  { tag: 'ads-copy-button', markup: '<ads-copy-button value="text"></ads-copy-button>', selector: 'button', token: '--ads-copy-button-color', property: 'color', value: 'rgb(15, 40, 55)' },
  { tag: 'ads-field', markup: '<ads-field label="Name"><input slot="control"><span slot="description">Help</span></ads-field>', selector: '[part="description"]', token: '--ads-field-message-font-size', property: 'font-size', value: '19px' },
  { tag: 'ads-icon-button', markup: '<ads-icon-button label="Settings">+</ads-icon-button>', selector: 'button', token: '--ads-icon-button-padding', property: 'padding-top', value: '9px' },
  { tag: 'ads-input', markup: '<ads-input label="Name"><span slot="description">Help</span></ads-input>', selector: '[part="description"]', token: '--ads-input-message-gap', property: 'margin-block-start', value: '17px' },
  { tag: 'ads-kbd', markup: '<ads-kbd>Enter</ads-kbd>', selector: 'kbd', token: '--ads-kbd-color', property: 'color', value: 'rgb(15, 40, 55)' },
  { tag: 'ads-link', markup: '<ads-link href="#target">Read more</ads-link>', selector: '.content', token: '--ads-link-gap', property: 'column-gap', value: '11px' },
  { tag: 'ads-radio', markup: '<ads-radio-group label="Options"><ads-radio value="one">One</ads-radio></ads-radio-group>', selector: '[part="indicator"]', token: '--ads-radio-border-width', property: 'border-top-width', value: '3px' },
  { tag: 'ads-radio-group', markup: '<ads-radio-group label="Options"><ads-radio value="one">One</ads-radio></ads-radio-group>', selector: '[part="label"]', token: '--ads-radio-group-label-font-size', property: 'font-size', value: '21px' },
  { tag: 'ads-select', markup: '<ads-select label="Plan"><option value="one">One</option></ads-select>', selector: 'select', token: '--ads-select-padding-block', property: 'padding-block-start', value: '11px' },
  { tag: 'ads-skeleton', markup: '<ads-skeleton></ads-skeleton>', selector: '[part="skeleton"]', token: '--ads-skeleton-width', property: 'width', value: '125px' },
  { tag: 'ads-tag', markup: '<ads-tag variant="accent">Tag</ads-tag>', selector: '[part="tag"]', token: '--ads-tag-border', property: 'border-top-color', value: 'rgb(15, 40, 55)' },
  { tag: 'ads-textarea', markup: '<ads-textarea label="Notes"></ads-textarea>', selector: '[part="label"]', token: '--ads-textarea-label-gap', property: 'row-gap', value: '15px' },
  { tag: 'ads-number-input', markup: '<ads-number-input label="Amount"></ads-number-input>', selector: '[part="label"]', token: '--ads-input-label-gap', property: 'row-gap', value: '15px' },
  { tag: 'ads-toast-item', markup: '<ads-toast-item duration="0">Saved</ads-toast-item>', selector: '[part="toast"]', token: '--ads-toast-padding', property: 'padding-top', value: '22px' },
];

for (const theme of themes) {
  test(`newly documented controls consume inherited overrides and restore ${theme} defaults`, async ({ page }) => {
    test.setTimeout(90_000);
    await openLab(page, theme);
    for (const binding of bindings) {
      await test.step(binding.token, async () => {
        const sandbox = page.locator('#sandbox');
        await sandbox.evaluate((node, markup) => { node.innerHTML = markup; }, binding.markup);
        const host = sandbox.locator(binding.tag).first();
        await expect.poll(() => style(host, binding.selector, binding.property)).not.toBe('');
        const baseline = await style(host, binding.selector, binding.property);
        expect(baseline).not.toBe(binding.value);
        await sandbox.evaluate((node, item) => node.style.setProperty(item.token, item.value), binding);
        await expect.poll(() => style(host, binding.selector, binding.property)).toBe(binding.value);
        await sandbox.evaluate((node, token) => node.style.removeProperty(token), binding.token);
        await expect.poll(() => style(host, binding.selector, binding.property)).toBe(baseline);
      });
    }
  });

  test(`tag and toast variants preserve ancestor and instance color overrides in ${theme}`, async ({ page }) => {
    await openLab(page, theme);
    for (const item of [
      { tag: 'ads-tag', part: '[part="tag"]', token: '--ads-tag-background', property: 'background-color', variants: ['neutral', 'accent'] },
      { tag: 'ads-toast-item', part: '[part="toast"]', token: '--ads-toast-accent', property: 'border-inline-start-color', variants: ['neutral', 'info', 'success', 'warning', 'danger'] },
    ]) {
      const sandbox = page.locator('#sandbox');
      await sandbox.evaluate((node, tag) => { node.innerHTML = `<${tag} duration="0">Example</${tag}><${tag} duration="0">Sibling</${tag}>`; }, item.tag);
      const host = sandbox.locator(item.tag).first();
      const sibling = sandbox.locator(item.tag).nth(1);
      for (const variant of item.variants) {
        await host.evaluate((node, value) => node.setAttribute('variant', value), variant);
        await expect.poll(() => style(host, item.part, item.property)).not.toBe('');
        const baseline = await style(host, item.part, item.property);
        await sandbox.evaluate((node, token) => node.style.setProperty(token, 'rgb(17, 51, 34)'), item.token);
        await expect.poll(() => style(host, item.part, item.property)).toBe('rgb(17, 51, 34)');
        await host.evaluate((node, token) => (node as HTMLElement).style.setProperty(token, 'rgb(51, 34, 17)'), item.token);
        await expect.poll(() => style(host, item.part, item.property)).toBe('rgb(51, 34, 17)');
        await expect.poll(() => style(sibling, item.part, item.property)).toBe('rgb(17, 51, 34)');
        await host.evaluate((node, token) => (node as HTMLElement).style.removeProperty(token), item.token);
        await expect.poll(() => style(host, item.part, item.property)).toBe('rgb(17, 51, 34)');
        await sandbox.evaluate((node, token) => node.style.removeProperty(token), item.token);
        await expect.poll(() => style(host, item.part, item.property)).toBe(baseline);
      }
    }
  });

  test(`skeleton dimensions affect its painted box in ${theme}, including reduced motion`, async ({ page }) => {
    await openLab(page, theme);
    await page.locator('#sandbox').evaluate((node) => {
      document.documentElement.style.fontSize = '16px';
      node.innerHTML = '<ads-skeleton style="width: 200px; font-size: 16px;"></ads-skeleton>';
    });
    const host = page.locator('ads-skeleton');
    const surface = host.locator('[part="skeleton"]');
    for (const [shape, width, height] of [['rect', 200, 16], ['text', 200, 12], ['circle', 40, 40]] as const) {
      await host.evaluate((node, value) => node.setAttribute('shape', value), shape);
      await expect.poll(async () => {
        const box = await surface.boundingBox();
        return box ? [box.width, box.height] : null;
      }).toEqual([width, height]);
      await host.evaluate((node) => {
        (node as HTMLElement).style.setProperty('--ads-skeleton-width', '120px');
        (node as HTMLElement).style.setProperty('--ads-skeleton-height', '28px');
      });
      await expect(surface).toHaveCSS('width', '120px');
      await expect(surface).toHaveCSS('height', '28px');
      await host.evaluate((node) => {
        (node as HTMLElement).style.removeProperty('--ads-skeleton-width');
        (node as HTMLElement).style.removeProperty('--ads-skeleton-height');
      });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(surface).toHaveCSS('animation-name', 'none');
    await expect(surface).toHaveAttribute('aria-hidden', 'true');
  });
}

test('invalid and focus styling remain state-specific and consumer-controlled', async ({ page }) => {
  await openLab(page, 'minimal-dark');
  await page.locator('#sandbox').evaluate((node) => {
    node.innerHTML = `<ads-input label="Email" required style="--ads-input-invalid-border-color: rgb(200, 60, 80); --ads-input-focus-border-color: rgb(60, 180, 200)"></ads-input>`;
  });
  const host = page.locator('ads-input');
  await expect.poll(() => style(host, '[part="control"]', 'border-top-color')).toBe('rgb(200, 60, 80)');
  await host.locator('input').fill('alex');
  await expect.poll(() => style(host, '[part="control"]', 'border-top-color')).toBe('rgb(60, 180, 200)');
  await host.locator('input').blur();
  await expect.poll(() => style(host, '[part="control"]', 'border-top-color')).not.toBe('rgb(60, 180, 200)');
});
