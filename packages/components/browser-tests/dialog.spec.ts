import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-dialog', () => {
  test('labels each instance and emits one close event when cancelled', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-dialog>
          <span slot="title">First dialog</span>
          <p>First content</p>
        </ads-dialog>
        <ads-dialog>
          <span slot="title">Second dialog</span>
          <p>Second content</p>
        </ads-dialog>
      `;
    });

    const dialogs = page.locator('ads-dialog');
    await dialogs.nth(0).evaluate(async (element) => {
      const dialog = element as HTMLElement & { open: boolean; updateComplete: Promise<unknown> };
      dialog.open = true;
      await dialog.updateComplete;
    });

    const nativeDialog = dialogs.nth(0).locator('dialog');
    const titleId = await nativeDialog.getAttribute('aria-labelledby');
    const contentId = await nativeDialog.getAttribute('aria-describedby');
    expect(titleId).toBeTruthy();
    expect(contentId).toBeTruthy();
    const secondTitleId = await dialogs.nth(1).locator('dialog').getAttribute('aria-labelledby');
    expect(secondTitleId).toBeTruthy();
    expect(secondTitleId).not.toBe(titleId);

    await dialogs.nth(0).evaluate((element) => {
      let closeCount = 0;
      element.addEventListener('ads-close', () => {
        closeCount += 1;
        element.setAttribute('data-close-count', String(closeCount));
      });
    });
    await page.keyboard.press('Escape');
    await expect(dialogs.nth(0)).toHaveAttribute('data-close-count', '1');
    await expect(nativeDialog).not.toBeVisible();
  });
});
