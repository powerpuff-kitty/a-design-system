import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('uses native required checkedness and FormData semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-checkbox name="terms" value="accepted" required>Accept terms</ads-checkbox>
        </form>
      `;
    });

    const host = page.locator('ads-checkbox');
    const input = host.locator('input');
    const form = page.locator('#form');

    expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
    expect(
      await form.evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element).entries())),
    ).toEqual({});

    await input.check();
    await expect(input).toBeChecked();
    expect(await host.evaluate((element: HTMLElement & { checked: boolean }) => element.checked)).toBe(true);
    expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(true);
    expect(
      await form.evaluate((element: HTMLFormElement) => Object.fromEntries(new FormData(element).entries())),
    ).toEqual({ terms: 'accepted' });

    await input.uncheck();
    expect(await form.evaluate((element: HTMLFormElement) => element.checkValidity())).toBe(false);
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  test('supports keyboard activation and resets checkedness to its initial state', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-checkbox name="feature" value="enabled" checked>Feature</ads-checkbox>
        </form>
      `;
    });

    const host = page.locator('ads-checkbox');
    const input = host.locator('input');

    await expect(input).toBeChecked();
    await input.focus();
    await page.keyboard.press('Space');
    await expect(input).not.toBeChecked();

    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(input).toBeChecked();
    expect(await host.evaluate((element: HTMLElement & { checked: boolean }) => element.checked)).toBe(true);
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ feature: 'enabled' });
  });

  test('indeterminate is visual state and native activation resolves it', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-checkbox>Partial selection</ads-checkbox>`;
    });

    const host = page.locator('ads-checkbox');
    const input = host.locator('input');

    await host.evaluate(async (element) => {
      const checkbox = element as HTMLElement & {
        indeterminate: boolean;
        updateComplete: Promise<unknown>;
      };
      checkbox.indeterminate = true;
      await checkbox.updateComplete;
    });

    expect(await input.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(true);
    expect(
      await host.evaluate((element: HTMLElement & { checked: boolean; indeterminate: boolean }) => [
        element.checked,
        element.indeterminate,
      ]),
    ).toEqual([false, true]);

    await input.click();
    await expect(input).toBeChecked();
    expect(await input.evaluate((element: HTMLInputElement) => element.indeterminate)).toBe(false);
    expect(
      await host.evaluate((element: HTMLElement & { checked: boolean; indeterminate: boolean }) => [
        element.checked,
        element.indeterminate,
      ]),
    ).toEqual([true, false]);
  });

  test('fieldset disabling is reversible without creating a disabled attribute', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <fieldset id="fieldset" disabled>
            <ads-checkbox name="choice" value="yes" checked>Choice</ads-checkbox>
          </fieldset>
        </form>
      `;
    });

    const host = page.locator('ads-checkbox');
    const input = host.locator('input');

    await expect(host).not.toHaveAttribute('disabled', '');
    await expect(input).toBeDisabled();
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({});

    await page.locator('#fieldset').evaluate((fieldset: HTMLFieldSetElement) => {
      fieldset.disabled = false;
    });
    await host.evaluate(async (element) => {
      await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    });

    await expect(host).not.toHaveAttribute('disabled', '');
    await expect(input).toBeEnabled();
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ choice: 'yes' });
  });

  test('supports programmatic activation and custom validity', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-checkbox name="confirm">Confirm</ads-checkbox>`;
    });

    const host = page.locator('ads-checkbox');
    await host.evaluate((element) => {
      const checkbox = element as HTMLElement & { click(): void };
      checkbox.click();
    });
    expect(await host.evaluate((element: HTMLElement & { checked: boolean }) => element.checked)).toBe(true);

    expect(
      await host.evaluate((element) => {
        const checkbox = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
          validationMessage: string;
        };
        checkbox.setCustomValidity('Needs confirmation');
        return [checkbox.checkValidity(), checkbox.validationMessage];
      }),
    ).toEqual([false, 'Needs confirmation']);

    expect(
      await host.evaluate((element) => {
        const checkbox = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
        };
        checkbox.setCustomValidity('');
        return checkbox.checkValidity();
      }),
    ).toBe(true);
  });
});
