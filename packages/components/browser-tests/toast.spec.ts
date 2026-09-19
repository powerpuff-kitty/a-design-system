import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ADS toast components', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('registers toast viewport and item through the public entrypoint', async ({ page }) => {
    expect(
      await page.evaluate(() =>
        ['ads-toast', 'ads-toast-item'].every((tag) => Boolean(customElements.get(tag))),
      ),
    ).toBe(true);
  });

  test('uses explicit live-region policy without forcing alert semantics on items', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-toast live="assertive"><ads-toast-item duration="0">Offline</ads-toast-item></ads-toast>`;
    });

    const stack = page.locator('ads-toast').locator('[part="stack"]');
    await expect(stack).toHaveAttribute('aria-live', 'assertive');
    await expect(page.locator('ads-toast-item').locator('[part="toast"]')).not.toHaveAttribute('role');
  });

  test('push queues above the limit and drains after a dismissal', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-toast id="viewport" limit="1"></ads-toast>`;
      const viewport = sandbox.querySelector('#viewport') as HTMLElement & {
        push(options: { message: string; duration?: number }): HTMLElement & {
          dismiss(reason?: 'programmatic'): void;
        };
      };

      const first = viewport.push({ message: 'First', duration: 0 });
      viewport.push({ message: 'Second', duration: 0 });
      (window as Window & { firstToast?: HTMLElement & { dismiss(reason?: 'programmatic'): void } }).firstToast = first;
    });

    await expect(page.locator('ads-toast-item')).toHaveCount(1);
    await expect(page.locator('ads-toast-item')).toContainText('First');

    await page.evaluate(() => {
      (window as Window & { firstToast?: { dismiss(reason?: 'programmatic'): void } }).firstToast?.dismiss('programmatic');
    });

    await expect(page.locator('ads-toast-item')).toHaveCount(1);
    await expect(page.locator('ads-toast-item')).toContainText('Second');
  });

  test('dismiss button emits action reason and closes a standalone item', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-toast-item id="item" duration="0">Saved</ads-toast-item>`;
      const item = sandbox.querySelector('#item');
      (window as Window & { toastReason?: string }).toastReason = '';
      item?.addEventListener('ads-toast-dismiss', (event) => {
        (window as Window & { toastReason?: string }).toastReason =
          (event as CustomEvent<{ reason: string }>).detail.reason;
      });
    });

    await page.getByRole('button', { name: 'Dismiss notification' }).click();
    await expect(page.locator('#item')).not.toHaveAttribute('open');
    expect(await page.evaluate(() => (window as Window & { toastReason?: string }).toastReason)).toBe('action');
  });

  test('dismissAll clears mounted and queued notifications', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-toast id="viewport" limit="1"></ads-toast>`;
      const viewport = sandbox.querySelector('#viewport') as HTMLElement & {
        push(options: { message: string; duration?: number }): unknown;
        dismissAll(): void;
      };
      viewport.push({ message: 'First', duration: 0 });
      viewport.push({ message: 'Second', duration: 0 });
      viewport.dismissAll();
    });

    await expect(page.locator('ads-toast-item')).toHaveCount(0);
  });
});
