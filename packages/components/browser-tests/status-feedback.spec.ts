import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('status and feedback components', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('ads-progress clamps values and keeps valid progressbar semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-progress value="125" max="100"></ads-progress>
        <ads-progress value="20" max="0"></ads-progress>
        <ads-progress></ads-progress>
      `;
    });

    const progressbars = page.locator('ads-progress [role="progressbar"]');
    await expect(progressbars.nth(0)).toHaveAttribute('aria-valuemax', '100');
    await expect(progressbars.nth(0)).toHaveAttribute('aria-valuenow', '100');
    await expect(progressbars.nth(0).locator('[part="bar"]')).toHaveAttribute(
      'style',
      'width:100%',
    );

    await expect(progressbars.nth(1)).toHaveAttribute('aria-valuemax', '100');
    await expect(progressbars.nth(1)).toHaveAttribute('aria-valuenow', '20');
    await expect(progressbars.nth(2)).not.toHaveAttribute('aria-valuenow');
    await expect(progressbars.nth(2)).toHaveAttribute('aria-label', 'Loading');
  });

  test('ads-progress-ring normalizes invalid ranges and values', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-progress-ring value="150" max="0"></ads-progress-ring>
        <ads-progress-ring value="not-a-number" max="200"></ads-progress-ring>
      `;
    });

    const progressbars = page.locator('ads-progress-ring [role="progressbar"]');
    await expect(progressbars.nth(0)).toHaveAttribute('aria-valuemax', '100');
    await expect(progressbars.nth(0)).toHaveAttribute('aria-valuenow', '100');
    await expect(progressbars.nth(0).locator('.value')).toHaveAttribute('stroke-dashoffset', '0');
    await expect(progressbars.nth(1)).toHaveAttribute('aria-valuemax', '200');
    await expect(progressbars.nth(1)).not.toHaveAttribute('aria-valuenow');
    await expect(progressbars.nth(1)).toHaveAttribute('aria-label', 'Loading');
  });

  test('ads-spinner stops animation when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = '<ads-spinner size="lg"></ads-spinner>';
    });

    const spinner = page.locator('ads-spinner');
    await expect(spinner.locator('[role="status"]')).toHaveAttribute('aria-label', 'Loading');
    await expect(spinner.locator('span')).toHaveCSS('animation-name', 'none');
  });

  test('ads-alert and ads-tag expose keyboard-operable dismiss and remove actions', async ({
    page,
  }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-alert dismissible>Saved</ads-alert>
        <ads-tag removable>Filter</ads-tag>
      `;
      sandbox.querySelector('ads-alert')?.addEventListener('ads-dismiss', () => {
        sandbox.setAttribute('data-alert-dismissed', 'true');
      });
      sandbox.querySelector('ads-tag')?.addEventListener('ads-remove', () => {
        sandbox.setAttribute('data-tag-removed', 'true');
      });
    });

    const alert = page.locator('ads-alert');
    await expect(alert.locator('[part="alert"]')).toHaveAttribute('role', 'status');
    await alert.locator('button').focus();
    await expect(alert.locator('button')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#sandbox')).toHaveAttribute('data-alert-dismissed', 'true');

    const tag = page.locator('ads-tag');
    await tag.locator('button').focus();
    await page.keyboard.press(' ');
    await expect(page.locator('#sandbox')).toHaveAttribute('data-tag-removed', 'true');
  });

  test('ads-badge exposes its tone and ads-skeleton exposes loading status', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-badge tone="info">Queued</ads-badge>
        <ads-skeleton></ads-skeleton>
      `;
    });

    await expect(page.locator('ads-badge')).toHaveAttribute('tone', 'info');
    await expect(page.locator('ads-badge [part="badge"]')).toBeVisible();
    await expect(page.locator('ads-skeleton [role="status"]')).toHaveAttribute(
      'aria-label',
      'Loading',
    );
  });

  test('feedback components preserve supplied labels and optional content semantics', async ({
    page,
  }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-progress value="40"><span>Uploading</span></ads-progress>
        <ads-skeleton>Loading profile</ads-skeleton>
        <ads-callout><span slot="heading">Heads up</span>Check this value.</ads-callout>
        <ads-toast tone="danger">Something went wrong</ads-toast>
        <ads-toast-item>Message only</ads-toast-item>
      `;
    });

    await expect(page.locator('ads-progress [role="progressbar"]')).not.toHaveAttribute(
      'aria-label',
    );
    await expect(page.locator('ads-skeleton [role="status"]')).not.toHaveAttribute('aria-label');
    await expect(page.locator('ads-callout [part="heading"]')).toBeVisible();
    await expect(page.locator('ads-toast [part="toast"]')).toHaveAttribute('role', 'alert');
    await expect(page.locator('ads-toast [part="toast"]')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
    await expect(page.locator('ads-toast-item [part="title"]')).toHaveAttribute('hidden', '');
    await expect(page.locator('ads-toast-item [part="actions"]')).toHaveAttribute('hidden', '');
  });
});
