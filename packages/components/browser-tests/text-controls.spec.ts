import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ADS text controls', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('ads-input mirrors native focus, selection, custom validity, and programmatic name semantics', async ({
    page,
  }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-input value="hello world"></ads-input>
        </form>
      `;
    });

    const host = page.locator('ads-input');
    const input = host.locator('input');
    await expect(input).toHaveValue('hello world');

    await host.evaluate(async (element) => {
      const control = element as HTMLElement & {
        updateComplete: Promise<unknown>;
        name: string;
        focus(): void;
        select(): void;
      };
      control.name = 'message';
      await control.updateComplete;
      control.focus();
      control.select();
    });

    await expect(host).toHaveAttribute('name', 'message');
    expect(
      await host.evaluate((element) => {
        const root = element.shadowRoot;
        return root?.activeElement?.tagName;
      }),
    ).toBe('INPUT');

    expect(
      await host.evaluate((element) => {
        const control = element as HTMLElement & {
          selectionStart: number | null;
          selectionEnd: number | null;
        };
        return [control.selectionStart, control.selectionEnd];
      }),
    ).toEqual([0, 11]);

    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ message: 'hello world' });

    expect(
      await host.evaluate((element) => {
        const control = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
          validationMessage: string;
        };
        control.setCustomValidity('Needs review');
        return [control.checkValidity(), control.validationMessage];
      }),
    ).toEqual([false, 'Needs review']);

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

  test('ads-textarea participates in forms, validates, and resets', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-textarea
            label="Notes"
            name="notes"
            required
            minlength="3"
            value="initial"
          ></ads-textarea>
        </form>
      `;
    });

    const host = page.locator('ads-textarea');
    const textarea = host.locator('textarea');
    await expect(textarea).toHaveValue('initial');

    await textarea.fill('updated notes');
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ notes: 'updated notes' });
    expect(
      await host.evaluate((element: HTMLElement & { checkValidity(): boolean }) =>
        element.checkValidity(),
      ),
    ).toBe(true);

    await textarea.fill('');
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity()),
    ).toBe(false);
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');

    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    await expect(textarea).toHaveValue('initial');
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity()),
    ).toBe(true);
  });

  test('ads-textarea mirrors native focus, selection, custom validity, and disabled semantics', async ({
    page,
  }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-textarea value="abcdef"></ads-textarea>
        </form>
      `;
    });

    const host = page.locator('ads-textarea');

    await host.evaluate(async (element) => {
      const control = element as HTMLElement & {
        updateComplete: Promise<unknown>;
        name: string;
        focus(): void;
        setSelectionRange(
          start: number,
          end: number,
          direction?: 'forward' | 'backward' | 'none',
        ): void;
      };
      control.name = 'body';
      await control.updateComplete;
      control.focus();
      control.setSelectionRange(1, 4, 'forward');
    });

    expect(
      await host.evaluate((element) => {
        const control = element as HTMLElement & {
          selectionStart: number;
          selectionEnd: number;
          selectionDirection: string;
        };
        return [
          control.selectionStart,
          control.selectionEnd,
          control.selectionDirection,
          element.shadowRoot?.activeElement?.tagName,
        ];
      }),
    ).toEqual([1, 4, 'forward', 'TEXTAREA']);

    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ body: 'abcdef' });

    expect(
      await host.evaluate((element) => {
        const control = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
          validationMessage: string;
        };
        control.setCustomValidity('Custom error');
        return [control.checkValidity(), control.validationMessage];
      }),
    ).toEqual([false, 'Custom error']);

    await host.evaluate((element) => {
      const control = element as HTMLElement & {
        setCustomValidity(message: string): void;
        disabled: boolean;
      };
      control.setCustomValidity('');
      control.disabled = true;
    });

    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({});
  });
});
