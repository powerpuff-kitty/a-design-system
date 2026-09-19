import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ADS feedback and loading primitives', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('registers the feedback/loading tranche through the public entrypoint', async ({ page }) => {
    expect(
      await page.evaluate(() =>
        [
          'ads-alert',
          'ads-callout',
          'ads-progress',
          'ads-progress-ring',
          'ads-skeleton',
          'ads-spinner',
          'ads-visually-hidden',
        ].every((tag) => Boolean(customElements.get(tag))),
      ),
    ).toBe(true);
  });

  test('ads-alert maps live modes to status/alert semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-alert id="polite">Saved</ads-alert>
        <ads-alert id="assertive" live="assertive" variant="danger">Connection lost</ads-alert>
        <ads-alert id="static" live="off">Reference note</ads-alert>
      `;
    });

    await expect(page.locator('#polite').locator('[part="alert"]')).toHaveAttribute('role', 'status');
    await expect(page.locator('#assertive').locator('[part="alert"]')).toHaveAttribute('role', 'alert');
    await expect(page.locator('#static').locator('[part="alert"]')).not.toHaveAttribute('role');
  });

  test('ads-progress preserves native determinate and indeterminate progress semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-progress id="determinate" label="Upload" value="25" max="50"></ads-progress>
        <ads-progress id="indeterminate" label="Processing"></ads-progress>
      `;
    });

    const determinate = page.locator('#determinate').locator('progress');
    await expect(determinate).toHaveAttribute('value', '25');
    await expect(determinate).toHaveAttribute('max', '50');
    await expect(page.getByRole('progressbar', { name: 'Upload' })).toBeVisible();

    const indeterminate = page.locator('#indeterminate').locator('progress');
    await expect(indeterminate).not.toHaveAttribute('value');
    await expect(page.getByRole('progressbar', { name: 'Processing' })).toBeVisible();
  });

  test('ads-progress-ring exposes values and omits aria-valuenow when indeterminate', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-progress-ring label="Indexing" value="40" max="80"></ads-progress-ring>
        <ads-progress-ring label="Waiting"></ads-progress-ring>
      `;
    });

    const done = page.getByRole('progressbar', { name: 'Indexing' });
    await expect(done).toHaveAttribute('aria-valuenow', '40');
    await expect(done).toHaveAttribute('aria-valuemax', '80');

    const pending = page.getByRole('progressbar', { name: 'Waiting' });
    await expect(pending).not.toHaveAttribute('aria-valuenow');
  });

  test('ads-spinner announces status while its graphic remains decorative', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-spinner label="Loading properties"></ads-spinner>`;
    });

    await expect(page.getByRole('status')).toHaveText('Loading properties');
    await expect(page.locator('ads-spinner').locator('[part="spinner"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('ads-skeleton is hidden from assistive technologies', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-skeleton shape="text"></ads-skeleton>`;
    });

    await expect(page.locator('ads-skeleton').locator('[part="skeleton"]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('ads-visually-hidden keeps text in the accessibility tree', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<button>Delete <ads-visually-hidden>current document</ads-visually-hidden></button>`;
    });

    await expect(page.getByRole('button', { name: 'Delete current document' })).toBeVisible();
  });
});
