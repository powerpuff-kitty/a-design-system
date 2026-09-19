import { expect, test } from '@playwright/test';

test('specialized controls expose the complete shared input styling contract', async ({ page }) => {
  await page.goto('/#ads-number-input');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
  const gap = page.getByRole('textbox', { name: '--ads-input-label-gap', exact: true });
  await expect(gap).toBeVisible();
  await gap.fill('18px');
  await expect(page.locator('#preview-content ads-number-input [part="label"]')).toHaveCSS('row-gap', '18px');
  await expect(page.locator('#preview-content ads-number-input input')).toHaveAttribute('type', 'number');
  await page.getByRole('tab', { name: 'API', exact: true }).click();
  await expect(page.getByRole('table', { name: 'CSS custom properties', exact: true })).toContainText('--ads-input-invalid-border-color');
  await expect(page.getByRole('table', { name: 'CSS custom properties', exact: true })).toContainText('Control border color while invalid.');
});

test('toast item exposes its borrowed namespace and state-aware descriptions', async ({ page }) => {
  await page.goto('/#ads-toast-item');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
  const accent = page.getByRole('textbox', { name: '--ads-toast-accent', exact: true });
  await expect(accent).toBeAttached();
  await accent.fill('rgb(51, 34, 17)');
  await expect(page.locator('#preview-content ads-toast-item [part="toast"]')).toHaveCSS('border-inline-start-color', 'rgb(51, 34, 17)');
  await page.getByRole('tab', { name: 'API', exact: true }).click();
  await expect(page.getByRole('table', { name: 'CSS custom properties', exact: true })).toContainText('variants supply a fallback');
});
