import { expect, test } from '@playwright/test';

test('theme and density controls change computed preview sizes while preserving local overrides', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
  const button = page.locator('#preview-content ads-button button');
  const theme = page.getByLabel('Theme preset', { exact: true });
  const density = page.getByLabel('Density', { exact: true });

  for (const preset of ['minimal-light', 'minimal-dark', 'minimal-high-contrast']) {
    await theme.selectOption(preset);
    for (const [mode, minimum] of [['compact', '32px'], ['default', '36px'], ['comfortable', '44px']] as const) {
      await density.selectOption(mode);
      // Dataset text alone is insufficient: raw token CSS previously prevented the visual override.
      await expect(button).toHaveCSS('min-block-size', minimum);
    }
  }

  const localSize = page.getByRole('textbox', { name: '--ads-control-size', exact: true });
  await localSize.fill('48px');
  await localSize.press('Tab');
  await expect(button).toHaveCSS('min-block-size', '48px');
  await density.selectOption('compact');
  await theme.selectOption('minimal-dark');
  await expect(button).toHaveCSS('min-block-size', '48px');
  await page.locator('#reset-overrides').click();
  await expect(button).toHaveCSS('min-block-size', '32px');
});
