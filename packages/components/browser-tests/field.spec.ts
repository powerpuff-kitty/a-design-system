import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test('ads-field keeps its label and control in one native label relationship', async ({ page }) => {
  await openLab(page);
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `
      <ads-field required>
        <span slot="label">Email</span>
        <input type="email" aria-label="Email input">
        <span slot="description">We will not share it.</span>
        <span slot="error">Enter a valid address.</span>
      </ads-field>
    `;
  });

  const field = page.locator('ads-field');
  await expect(field.locator('[slot="label"]')).toHaveText('Email');
  await expect(field.locator('[part="label"] [aria-hidden="true"]')).toHaveText('*');
  await expect(field.locator('[slot="description"]')).toHaveText('We will not share it.');
  await expect(field.locator('[part="error"]')).toHaveAttribute('role', 'alert');
  await field.locator('input').focus();
  await expect(field.locator('input')).toBeFocused();
});
