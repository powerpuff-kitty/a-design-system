import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-alert-dialog', () => {
  test('opens as an alertdialog and closes on Escape with an event', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-alert-dialog>
          <span slot="title">Delete project?</span>
          <span slot="description">This action cannot be undone.</span>
          <button slot="actions" type="button">Cancel</button>
        </ads-alert-dialog>
      `;
    });

    const host = page.locator('ads-alert-dialog');
    await host.evaluate(async (element) => {
      const dialog = element as HTMLElement & { open: boolean; updateComplete: Promise<unknown> };
      dialog.open = true;
      await dialog.updateComplete;
    });

    const dialog = host.locator('dialog');
    await expect(dialog).toHaveAttribute('role', 'alertdialog');
    await expect(dialog).toBeVisible();
    await expect(host.locator('[slot="title"]')).toHaveText('Delete project?');

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
