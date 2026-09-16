import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('form-associated ADS controls', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('ads-input participates in FormData and native constraint validation', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-input
            label="Email"
            name="email"
            type="email"
            required
            value="start@example.com"
          ></ads-input>
        </form>
      `;
    });

    const host = page.locator('ads-input');
    const nativeInput = host.locator('input');

    await expect(nativeInput).toHaveValue('start@example.com');
    expect(await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(true);

    await nativeInput.fill('next@example.com');
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ email: 'next@example.com' });

    await nativeInput.fill('not-an-email');
    expect(await host.evaluate((element: HTMLElement & { checkValidity(): boolean }) => element.checkValidity())).toBe(false);
    expect(await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);
    await expect(nativeInput).toHaveAttribute('aria-invalid', 'true');

    await nativeInput.fill('');
    expect(await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);
  });

  test('ads-input resets to its initial value and disabled inputs leave FormData', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-input name="query" value="initial"></ads-input>
        </form>
      `;
    });

    const host = page.locator('ads-input');
    const nativeInput = host.locator('input');

    await nativeInput.fill('changed');
    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(nativeInput).toHaveValue('initial');

    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ query: 'initial' });

    await host.evaluate((element) => element.setAttribute('disabled', ''));
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({});
  });

  test('ads-button preserves validation and submitter name/value semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-input name="email" type="email" required></ads-input>
          <ads-button type="submit" name="intent" value="save">Save</ads-button>
        </form>
      `;
    });

    await page.evaluate(() => {
      const form = document.querySelector<HTMLFormElement>('#form');
      if (!form) throw new Error('Test form not found');

      (window as Window & { adsSubmissions?: Array<Record<string, FormDataEntryValue>> }).adsSubmissions = [];
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitEvent = event as SubmitEvent;
        const data = Object.fromEntries(new FormData(form, submitEvent.submitter).entries());
        (window as Window & { adsSubmissions: Array<Record<string, FormDataEntryValue>> }).adsSubmissions.push(data);
      });
    });

    const submitButton = page.locator('ads-button').locator('button');
    await submitButton.click();
    expect(
      await page.evaluate(() =>
        (window as Window & { adsSubmissions?: Array<Record<string, FormDataEntryValue>> }).adsSubmissions?.length,
      ),
    ).toBe(0);

    await page.locator('ads-input').locator('input').fill('valid@example.com');
    await submitButton.click();

    expect(
      await page.evaluate(() =>
        (window as Window & { adsSubmissions?: Array<Record<string, FormDataEntryValue>> }).adsSubmissions,
      ),
    ).toEqual([{ email: 'valid@example.com', intent: 'save' }]);
  });

  test('ads-button reset restores form-associated controls', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-input name="query" value="initial"></ads-input>
          <ads-button type="reset">Reset</ads-button>
        </form>
      `;
    });

    const input = page.locator('ads-input').locator('input');
    await input.fill('changed');
    await page.locator('ads-button').locator('button').click();
    await expect(input).toHaveValue('initial');
  });
});
