import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ADS specialized inputs', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('registers search, password, and number inputs from the public entrypoint', async ({ page }) => {
    expect(
      await page.evaluate(() =>
        ['ads-search-input', 'ads-password-input', 'ads-number-input'].every((tag) =>
          Boolean(customElements.get(tag)),
        ),
      ),
    ).toBe(true);
  });

  test('ads-search-input keeps native search semantics while reusing form participation', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-search-input name="query" label="Search" value="lombok"></ads-search-input>
        </form>
      `;
    });

    const host = page.locator('ads-search-input');
    const input = host.locator('input');
    await expect(input).toHaveAttribute('type', 'search');

    await host.evaluate((element) => element.setAttribute('type', 'email'));
    await expect(input).toHaveAttribute('type', 'search');

    await input.fill('bali');
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ query: 'bali' });
  });

  test('ads-password-input defaults to password semantics and current-password autocomplete', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-password-input label="Password" name="password"></ads-password-input>
      `;
    });

    const host = page.locator('ads-password-input');
    const input = host.locator('input');
    await expect(input).toHaveAttribute('type', 'password');
    await expect(input).toHaveAttribute('autocomplete', 'current-password');

    await host.evaluate((element) => element.setAttribute('autocomplete', 'new-password'));
    await expect(input).toHaveAttribute('autocomplete', 'new-password');
  });

  test('ads-number-input participates in FormData and exposes native range validity', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-number-input
            label="Quantity"
            name="quantity"
            value="2"
            min="1"
            max="5"
            step="1"
            required
          ></ads-number-input>
        </form>
      `;
    });

    const host = page.locator('ads-number-input');
    const input = host.locator('input');

    await expect(input).toHaveAttribute('type', 'number');
    await expect(input).toHaveValue('2');
    expect(
      await host.evaluate((element: HTMLElement & { valueAsNumber: number }) => element.valueAsNumber),
    ).toBe(2);

    await input.fill('5');
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ quantity: '5' });

    await host.evaluate((element: HTMLElement & { stepDown(): void }) => element.stepDown());
    await expect(input).toHaveValue('4');

    await input.fill('8');
    expect(
      await host.evaluate((element: HTMLElement & { checkValidity(): boolean }) =>
        element.checkValidity(),
      ),
    ).toBe(false);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('ads-number-input resets to the authored value and follows fieldset disabled state', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <fieldset id="fieldset">
            <ads-number-input name="amount" value="3"></ads-number-input>
          </fieldset>
        </form>
      `;
    });

    const host = page.locator('ads-number-input');
    const input = host.locator('input');
    await input.fill('7');
    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(input).toHaveValue('3');

    await page.locator('#fieldset').evaluate((fieldset: HTMLFieldSetElement) => {
      fieldset.disabled = true;
    });
    await host.evaluate(async (element) => {
      await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    });
    await expect(input).toBeDisabled();
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({});
  });
});
