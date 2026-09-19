import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-tabs', () => {
  test('keeps tabs and panels synchronized and supports keyboard navigation', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-tabs>
          <ads-tab value="overview">Overview</ads-tab>
          <ads-tab value="details">Details</ads-tab>
          <ads-tab-panel value="overview">Overview content</ads-tab-panel>
          <ads-tab-panel value="details">Details content</ads-tab-panel>
        </ads-tabs>
      `;
    });

    const tabs = page.locator('ads-tabs');
    const first = tabs.locator('ads-tab').nth(0);
    const second = tabs.locator('ads-tab').nth(1);
    const firstButton = first.locator('button');
    const secondButton = second.locator('button');
    const firstPanel = tabs.locator('ads-tab-panel').nth(0).locator('section');
    const secondPanel = tabs.locator('ads-tab-panel').nth(1).locator('section');

    await expect(firstButton).toHaveAttribute('aria-selected', 'true');
    await expect(secondButton).toHaveAttribute('aria-selected', 'false');
    await expect(firstPanel).toBeVisible();
    await expect(secondPanel).toBeHidden();

    await firstButton.focus();
    await page.keyboard.press('ArrowRight');
    await expect(secondButton).toBeFocused();
    await expect(secondButton).toHaveAttribute('aria-selected', 'true');
    await expect(firstPanel).toBeHidden();
    await expect(secondPanel).toBeVisible();
    await expect(tabs).toHaveAttribute('value', 'details');
    await expect(secondButton).toHaveAttribute(
      'aria-controls',
      await tabs.locator('ads-tab-panel').nth(1).getAttribute('id'),
    );
  });
});
