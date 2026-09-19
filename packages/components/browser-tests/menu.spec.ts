import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-menu', () => {
  test('supports roving focus, typeahead, selection, and dismissal', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-menu label="Actions">
          <button type="button">Archive</button>
          <button type="button">Delete</button>
          <button type="button">Rename</button>
        </ads-menu>
      `;
    });

    const menu = page.locator('ads-menu');
    const items = menu.locator('button');
    await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(1)).toHaveAttribute('tabindex', '-1');

    await items.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();

    await page.keyboard.press('r');
    await expect(items.nth(2)).toBeFocused();

    await menu.evaluate((element) => {
      element.addEventListener('ads-select', () => element.setAttribute('data-selected', 'true'), {
        once: true,
      });
      element.addEventListener(
        'ads-dismiss',
        () => element.setAttribute('data-dismissed', 'true'),
        {
          once: true,
        },
      );
    });
    await page.keyboard.press('Enter');
    await expect(menu).toHaveAttribute('data-selected', 'true');
    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('data-dismissed', 'true');
  });
});
