import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ADS field composition', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('registers field, label, description, and error primitives', async ({ page }) => {
    expect(
      await page.evaluate(() =>
        ['ads-field', 'ads-label', 'ads-description', 'ads-error'].every((tag) =>
          Boolean(customElements.get(tag)),
        ),
      ),
    ).toBe(true);
  });

  test('labels and focuses a slotted native control and exposes supporting text', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-field label="Email address" required>
          <input slot="control" type="email" />
          <ads-description slot="description">Used for receipts.</ads-description>
          <ads-error slot="error">Enter a valid email.</ads-error>
        </ads-field>
      `;
    });

    const field = page.locator('ads-field');
    const input = field.locator('input');

    await expect(input).toHaveAttribute('aria-label', 'Email address');
    await expect(input).toHaveAttribute(
      'aria-description',
      'Used for receipts. Enter a valid email.',
    );
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(field.locator('[part="required"]')).toHaveAttribute('aria-hidden', 'true');

    await field.locator('[part="label-text"]').click();
    await expect(input).toBeFocused();
  });

  test('propagates field context into an ADS shadow-backed input without duplicating form logic', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-field label="Search query">
          <ads-search-input slot="control" name="query"></ads-search-input>
          <ads-description slot="description">Search all indexed properties.</ads-description>
        </ads-field>
      `;
    });

    const host = page.locator('ads-search-input');
    const input = host.locator('input');

    await expect(input).toHaveAttribute('type', 'search');
    await expect(input).toHaveAttribute('aria-description', 'Search all indexed properties.');
    await expect(host.locator('[part="label-text"]')).toHaveText('Search query');

    await page.locator('ads-field').locator('[part="label-text"]').click();
    await expect(input).toBeFocused();
  });

  test('restores a consumer-owned aria-description when field description is removed', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-field id="field" label="Name">
          <input slot="control" aria-description="Original description" />
          <span id="help" slot="description">Temporary field help.</span>
        </ads-field>
      `;
    });

    const input = page.locator('ads-field input');
    await expect(input).toHaveAttribute('aria-description', 'Temporary field help.');

    await page.locator('#help').evaluate((element) => element.remove());
    await expect(input).toHaveAttribute('aria-description', 'Original description');
  });

  test('standalone label/error primitives expose visual required and alert semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-label required>Username</ads-label>
        <ads-error>Username is required.</ads-error>
      `;
    });

    await expect(page.locator('ads-label').locator('[part="required"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(page.getByRole('alert')).toHaveText('Username is required.');
  });
});
