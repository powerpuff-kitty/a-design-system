import { expect, test, type Locator, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

function radioInputs(group: Locator): Locator {
  return group.locator('ads-radio input[type="radio"]');
}

test.describe('ads-radio-group', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('owns required validity and submits exactly one selected value', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-radio-group name="plan" label="Plan" required>
            <ads-radio value="free">Free</ads-radio>
            <ads-radio value="pro">Pro</ads-radio>
            <ads-radio value="team" disabled>Team</ads-radio>
          </ads-radio-group>
        </form>
      `;
    });

    const group = page.locator('ads-radio-group');
    const inputs = radioInputs(group);

    await expect(page.getByRole('radiogroup', { name: 'Plan' })).toHaveCount(1);
    await expect(page.getByRole('radio')).toHaveCount(3);
    await expect(page.getByRole('radio', { name: 'Free' })).toHaveCount(1);
    await expect(page.getByRole('radio', { name: 'Pro' })).toHaveCount(1);
    await expect(page.getByRole('radio', { name: 'Team' })).toBeDisabled();

    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity()),
    ).toBe(false);
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({});
    expect(
      await inputs.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLInputElement).tabIndex),
      ),
    ).toEqual([0, -1, -1]);

    await inputs.nth(1).check();
    await expect(inputs.nth(1)).toBeChecked();
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'pro',
    );
    expect(
      await page.locator('#form').evaluate((form: HTMLFormElement) => form.checkValidity()),
    ).toBe(true);
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ plan: 'pro' });
    expect(
      await inputs.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLInputElement).tabIndex),
      ),
    ).toEqual([-1, 0, -1]);
  });

  test('dispatches group input/change once for a new user selection', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-radio-group value="free">
          <ads-radio value="free">Free</ads-radio>
          <ads-radio value="pro">Pro</ads-radio>
        </ads-radio-group>
      `;
    });

    await page.evaluate(() => {
      const group = document.querySelector('ads-radio-group');
      if (!group) throw new Error('radio group not found');
      (window as Window & { radioEvents?: string[] }).radioEvents = [];
      group.addEventListener('input', () =>
        (window as Window & { radioEvents: string[] }).radioEvents.push('input'),
      );
      group.addEventListener('change', () =>
        (window as Window & { radioEvents: string[] }).radioEvents.push('change'),
      );
    });

    const inputs = radioInputs(page.locator('ads-radio-group'));
    await inputs.nth(1).check();
    expect(
      await page.evaluate(() => (window as Window & { radioEvents?: string[] }).radioEvents),
    ).toEqual(['input', 'change']);

    await inputs.nth(1).click();
    expect(
      await page.evaluate(() => (window as Window & { radioEvents?: string[] }).radioEvents),
    ).toEqual(['input', 'change']);
  });

  test('arrow keys select, focus, skip disabled options, and wrap', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-radio-group value="one" label="Number">
          <ads-radio value="one">One</ads-radio>
          <ads-radio value="two" disabled>Two</ads-radio>
          <ads-radio value="three">Three</ads-radio>
        </ads-radio-group>
      `;
    });

    const group = page.locator('ads-radio-group');
    const inputs = radioInputs(group);

    await inputs.nth(0).focus();
    await page.keyboard.press('ArrowRight');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'three',
    );
    await expect(inputs.nth(2)).toBeChecked();
    expect(
      await inputs.nth(2).evaluate((element) => element === element.getRootNode().activeElement),
    ).toBe(true);

    await page.keyboard.press('ArrowDown');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'one',
    );
    await expect(inputs.nth(0)).toBeChecked();

    await page.keyboard.press('ArrowLeft');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'three',
    );
    await expect(inputs.nth(2)).toBeChecked();

    await page.keyboard.press('ArrowUp');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'one',
    );
    await expect(inputs.nth(0)).toBeChecked();
  });

  test('horizontal navigation follows visual direction in RTL', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <div dir="rtl">
          <ads-radio-group value="a" orientation="horizontal" label="Choice">
            <ads-radio value="a">A</ads-radio>
            <ads-radio value="b">B</ads-radio>
            <ads-radio value="c">C</ads-radio>
          </ads-radio-group>
        </div>
      `;
    });

    const group = page.locator('ads-radio-group');
    const inputs = radioInputs(group);
    await inputs.nth(0).focus();

    await page.keyboard.press('ArrowRight');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'c',
    );
    await expect(inputs.nth(2)).toBeChecked();

    await page.keyboard.press('ArrowLeft');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'a',
    );
    await expect(inputs.nth(0)).toBeChecked();
  });

  test('focus enters on selected option and reset restores initial value', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-radio-group name="size" value="medium" label="Size">
            <ads-radio value="small">Small</ads-radio>
            <ads-radio value="medium">Medium</ads-radio>
            <ads-radio value="large">Large</ads-radio>
          </ads-radio-group>
        </form>
      `;
    });

    const group = page.locator('ads-radio-group');
    const inputs = radioInputs(group);

    await group.evaluate((element: HTMLElement & { focus(): void }) => element.focus());
    expect(
      await inputs.nth(1).evaluate((element) => element === element.getRootNode().activeElement),
    ).toBe(true);

    await inputs.nth(2).check();
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'large',
    );

    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'medium',
    );
    await expect(inputs.nth(1)).toBeChecked();
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ size: 'medium' });
  });

  test('a checked child can define the initial/default group value', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-radio-group name="color" label="Color">
            <ads-radio value="red">Red</ads-radio>
            <ads-radio value="blue" checked>Blue</ads-radio>
          </ads-radio-group>
        </form>
      `;
    });

    const group = page.locator('ads-radio-group');
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'blue',
    );
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ color: 'blue' });

    await radioInputs(group).nth(0).check();
    await page.locator('#form').evaluate((form: HTMLFormElement) => form.reset());
    expect(await group.evaluate((element: HTMLElement & { value: string }) => element.value)).toBe(
      'blue',
    );
  });

  test('fieldset disabling is reversible and omits the group from FormData', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <fieldset id="fieldset" disabled>
            <ads-radio-group name="mode" value="auto" label="Mode">
              <ads-radio value="auto">Auto</ads-radio>
              <ads-radio value="manual">Manual</ads-radio>
            </ads-radio-group>
          </fieldset>
        </form>
      `;
    });

    const group = page.locator('ads-radio-group');
    const inputs = radioInputs(group);
    await expect(group).not.toHaveAttribute('disabled', '');
    await expect(inputs.nth(0)).toBeDisabled();
    await expect(inputs.nth(1)).toBeDisabled();
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({});

    await page.locator('#fieldset').evaluate((fieldset: HTMLFieldSetElement) => {
      fieldset.disabled = false;
    });
    await group.evaluate(async (element) => {
      await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    });

    await expect(group).not.toHaveAttribute('disabled', '');
    await expect(inputs.nth(0)).toBeEnabled();
    expect(
      await page
        .locator('#form')
        .evaluate((form: HTMLFormElement) => Object.fromEntries(new FormData(form).entries())),
    ).toEqual({ mode: 'auto' });
  });

  test('custom validity can invalidate and recover the group', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-radio-group value="a" label="Choice">
          <ads-radio value="a">A</ads-radio>
          <ads-radio value="b">B</ads-radio>
        </ads-radio-group>
      `;
    });

    const group = page.locator('ads-radio-group');
    expect(
      await group.evaluate((element) => {
        const control = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
          validationMessage: string;
        };
        control.setCustomValidity('Unavailable choice');
        return [control.checkValidity(), control.validationMessage];
      }),
    ).toEqual([false, 'Unavailable choice']);

    expect(
      await group.evaluate((element) => {
        const control = element as HTMLElement & {
          setCustomValidity(message: string): void;
          checkValidity(): boolean;
        };
        control.setCustomValidity('');
        return control.checkValidity();
      }),
    ).toBe(true);
  });
});
