import { expect, test } from '@playwright/test';

const cases = [
  { name: 'badge', variants: ['neutral', 'accent', 'success', 'warning', 'danger'] },
  { name: 'alert', variants: ['info', 'success', 'warning', 'danger'] },
  { name: 'callout', variants: ['neutral', 'info', 'tip', 'warning'] },
  { name: 'card', variants: ['outlined', 'filled'] },
];

for (const theme of ['minimal-light', 'minimal-dark', 'minimal-high-contrast']) {
  for (const { name, variants } of cases) {
    test(`${name} respects consumer colors and restores ${theme} defaults across variants`, async ({ page }) => {
      await page.goto(`/?theme=${theme}`);
      await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
      await page.locator('#sandbox').evaluate((sandbox, component) => {
        sandbox.innerHTML = `<div id="context"><ads-${component}>Example status</ads-${component}></div>`;
      }, name);
      const host = page.locator(`ads-${name}`);
      const part = host.locator(`[part="${name}"]`);
      const defaultForeground = await page.locator('html').evaluate((node) => getComputedStyle(node).color);

      for (const variant of variants) {
        await host.evaluate((node, value) => node.setAttribute('variant', value), variant);
        await page.locator('#context').evaluate((node, component) => {
          const context = node as HTMLElement;
          context.style.setProperty(`--ads-${component}-background`, 'rgb(10, 20, 30)');
          context.style.setProperty(`--ads-${component}-color`, 'rgb(220, 230, 240)');
        }, name);
        await expect(part).toHaveCSS('background-color', 'rgb(10, 20, 30)');
        await expect(part).toHaveCSS('color', 'rgb(220, 230, 240)');
        // Instance overrides beat inherited consumer defaults as well.
        await host.evaluate((node, component) => {
          (node as HTMLElement).style.setProperty(`--ads-${component}-background`, 'rgb(40, 50, 60)');
        }, name);
        await expect(part).toHaveCSS('background-color', 'rgb(40, 50, 60)');
        await host.evaluate((node) => node.removeAttribute('style'));
        await page.locator('#context').evaluate((node) => node.removeAttribute('style'));
        await expect(part).toHaveCSS('color', defaultForeground);
        await expect(part).not.toHaveCSS('background-color', 'rgb(40, 50, 60)');
      }
    });
  }
}
