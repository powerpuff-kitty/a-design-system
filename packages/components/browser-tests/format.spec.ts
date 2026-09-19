import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ADS Intl format helpers', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('registers all formatter elements from the public entrypoint', async ({ page }) => {
    expect(
      await page.evaluate(() =>
        ['ads-format-date', 'ads-format-number', 'ads-format-bytes', 'ads-relative-time'].every(
          (tag) => Boolean(customElements.get(tag)),
        ),
      ),
    ).toBe(true);
  });

  test('formats a date with explicit locale and time zone', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-format-date
          value="2026-01-02T12:00:00Z"
          locale="en-US"
          date-style="medium"
          time-zone="UTC"
        ></ads-format-date>
      `;
    });

    await expect(page.locator('ads-format-date').locator('[part="value"]')).toHaveText('Jan 2, 2026');
  });

  test('formats currency through Intl.NumberFormat', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-format-number
          value="1234.5"
          locale="en-US"
          format-style="currency"
          currency="USD"
          minimum-fraction-digits="2"
          maximum-fraction-digits="2"
        ></ads-format-number>
      `;
    });

    await expect(page.locator('ads-format-number').locator('[part="value"]')).toHaveText('$1,234.50');
  });

  test('formats bytes with binary and decimal unit systems', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-format-bytes id="binary" value="1536" locale="en-US"></ads-format-bytes>
        <ads-format-bytes id="decimal" value="1500" locale="en-US" unit-system="decimal"></ads-format-bytes>
      `;
    });

    await expect(page.locator('#binary').locator('[part="value"]')).toHaveText('1.5 KiB');
    await expect(page.locator('#decimal').locator('[part="value"]')).toHaveText('1.5 kB');
  });

  test('formats relative time with native auto labels', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-relative-time value="-1" unit="day" locale="en-US" numeric="auto"></ads-relative-time>
      `;
    });

    await expect(page.locator('ads-relative-time').locator('[part="value"]')).toHaveText('yesterday');
  });

  test('returns configured fallbacks for invalid values or Intl option combinations', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-format-date id="date" value="not-a-date" fallback="N/A"></ads-format-date>
        <ads-format-number id="currency" value="42" format-style="currency" fallback="invalid"></ads-format-number>
      `;
    });

    await expect(page.locator('#date').locator('[part="value"]')).toHaveText('N/A');
    await expect(page.locator('#currency').locator('[part="value"]')).toHaveText('invalid');
  });
});
