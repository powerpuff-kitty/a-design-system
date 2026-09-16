import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-switch', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('exposes switch semantics and native checked FormData behavior', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-switch name="notifications" value="enabled">Notifications</ads-switch>
        </form>
      `;
    });

    const host = page.locator('ads-switch');
    const input = host.locator('input');
    await expect(page.getByRole('switch', { name: 'Notifications' })).toHaveCount(1);
    await expect(input).not.toBeChecked();
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({});

    await input.check();
    await expect(input).toBeChecked();
    expect(await host.evaluate((element: HTMLElement & { checked: boolean }) => element.checked)).toBe(true);
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) =>
        Object.fromEntries(new FormData(form).entries()),
      ),
    ).toEqual({ notifications: 'enabled' });
  });

  test('Space toggles and user interaction emits one input/change pair', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-switch>Airplane mode</ads-switch>`;
    });

    await page.evaluate(() => {
      const control = document.querySelector('ads-switch');
      if (!control) throw new Error('switch not found');
      (window as Window & { switchEvents?: string[] }).switchEvents = [];
      control.addEventListener('input', () => (window as Window & { switchEvents: string[] }).switchEvents.push('input'));
      control.addEventListener('change', () => (window as Window & { switchEvents: string[] }).switchEvents.push('change'));
    });

    const input = page.locator('ads-switch input');
    await input.focus();
    await page.keyboard.press('Space');
    await expect(input).toBeChecked();
    expect(await page.evaluate(() => (window as Window & { switchEvents?: string[] }).switchEvents)).toEqual([
      'input',
      'change',
    ]);
  });

  test('required validity follows checked state and can be overridden with custom validity', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-switch required>Enable required setting</ads-switch>
        </form>
      `;
    });

    const host = page.locator('ads-switch');
    const input = host.locator('input');
    expect(await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);
    await input.check();
    expect(await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(true);

    expect(
      await host.evaluate((element) => {
        const control = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
          validationMessage: string;
        };
        control.setCustomValidity('Policy prevents this change');
        return [control.checkValidity(), control.validationMessage];
      }),
    ).toEqual([false, 'Policy prevents this change']);

    expect(
      await host.evaluate((element) => {
        const control = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
        };
        control.setCustomValidity('');
        return control.checkValidity();
      }),
    ).toBe(true);
  });

  test('reset restores default checked state', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-switch name="feature" value="yes" checked>Feature</ads-switch>
        </form>
      `;
    });

    const host = page.locator('ads-switch');
    const input = host.locator('input');
    await expect(input).toBeChecked();
    await input.uncheck();
    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(input).toBeChecked();
    expect(await host.evaluate((element: HTMLElement & { checked: boolean }) => element.checked)).toBe(true);
  });

  test('fieldset disabling is reversible without mutating the host disabled attribute', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <fieldset id="fieldset" disabled>
            <ads-switch name="feature" value="yes" checked>Feature</ads-switch>
          </fieldset>
        </form>
      `;
    });

    const host = page.locator('ads-switch');
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
    ).toEqual({ feature: 'yes' });
  });
});
