import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// The Node runner does not apply Vite's browser JSON import transformation.
const examples: Record<string, string> = JSON.parse(
  readFileSync(new URL('../src/examples.json', import.meta.url), 'utf8'),
);
const tags = Object.keys(examples);

for (const theme of ['minimal-light', 'minimal-dark', 'minimal-high-contrast']) {
  test(`every integrated preview renders under ${theme}`, async ({ page }, info) => {
    test.setTimeout(90_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/?theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
    await expect(page.locator('#component-list a')).toHaveCount(tags.length);

    for (const tag of tags) {
      await test.step(tag, async () => {
        await page.locator(`#component-list a[href="#${tag}"]`).click();
        await expect(page.locator('#component-meta')).toContainText(tag);
        const component = page.locator(`#preview-content ${tag}`).first();
        await expect(component).toBeAttached();
        await expect.poll(() => component.evaluate((node) => Boolean(node.shadowRoot?.childNodes.length))).toBe(true);
        await expect(page.locator('#preview-stage')).toBeVisible();
        await page.getByRole('tab', { name: 'Usage', exact: true }).click();
        await expect(page.locator('#source-code')).toContainText(`<${tag}`);
        await page.getByRole('tab', { name: 'API', exact: true }).click();
        await expect(page.getByRole('table', { name: 'CSS parts', exact: true })).toBeVisible();
      });
    }
    expect(errors).toEqual([]);
    await page.locator('#component-list a[href="#ads-checkbox-group"]').click();
    await info.attach(`integrated-${theme}`, { body: await page.screenshot(), contentType: 'image/png' });
  });
}

test('specialized inputs retain native types after combining theme and form branches', async ({ page }) => {
  await page.goto('/?theme=minimal-dark#ads-search-input');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
  await expect(page.locator('#preview-content ads-search-input input')).toHaveAttribute('type', 'search');
  await page.locator('#component-list a[href="#ads-password-input"]').click();
  await expect(page.locator('#preview-content ads-password-input input')).toHaveAttribute('type', 'password');
});

test('select styling is instance-scoped and the integrated checkbox group keeps disabled behavior', async ({ page }) => {
  await page.goto('/#ads-select');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
  const radius = page.getByRole('textbox', { name: '--ads-select-radius', exact: true });
  await radius.fill('12px');
  await radius.press('Tab');
  await expect(page.locator('#preview-content ads-select select')).toHaveCSS('border-radius', '12px');
  await expect(page.locator('#command-trigger')).toHaveCSS('border-radius', '0px');
  await page.locator('#component-list a[href="#ads-checkbox-group"]').click();
  await page.locator('#state-controls').getByLabel('disabled', { exact: true }).check();
  await expect(page.locator('#preview-content').getByRole('checkbox', { name: 'Map', exact: true })).toBeDisabled();
  await page.locator('#state-controls').getByLabel('disabled', { exact: true }).uncheck();
  await expect(page.locator('#preview-content').getByRole('checkbox', { name: 'Map', exact: true })).toBeEnabled();
  await expect(page.locator('#preview-content').getByRole('checkbox', { name: 'Export', exact: true })).toBeDisabled();
});
