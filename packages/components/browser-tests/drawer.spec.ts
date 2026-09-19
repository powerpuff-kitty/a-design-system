import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-drawer', () => {
  test('opens as a modal drawer and closes on Escape', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-drawer>
          <span slot="title">Navigation</span>
          <p>Drawer content</p>
        </ads-drawer>
      `;
    });

    const host = page.locator('ads-drawer');
    await host.evaluate(async (element) => {
      const drawer = element as HTMLElement & { open: boolean; updateComplete: Promise<unknown> };
      drawer.open = true;
      await drawer.updateComplete;
    });

    const dialog = host.locator('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(host.locator('[slot="title"]')).toHaveText('Navigation');

    await host.evaluate((element) => {
      element.addEventListener('ads-close', () => element.setAttribute('data-closed', 'true'), {
        once: true,
      });
    });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(host).toHaveAttribute('data-closed', 'true');
  });
});
