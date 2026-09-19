import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-checkbox-group', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('submits multiple selected values and enforces required', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-checkbox-group name="feature" label="Features" required>
            <ads-checkbox value="maps">Maps</ads-checkbox>
            <ads-checkbox value="search">Search</ads-checkbox>
            <ads-checkbox value="exports">Exports</ads-checkbox>
          </ads-checkbox-group>
        </form>
      `;
    });

    const group = page.locator('ads-checkbox-group');
    const form = page.locator('#form');

    expect(await form.evaluate((node: HTMLFormElement) => node.checkValidity())).toBe(false);

    await page.getByRole('checkbox', { name: 'Maps' }).check();
    await page.getByRole('checkbox', { name: 'Exports' }).check();

    expect(await form.evaluate((node: HTMLFormElement) => node.checkValidity())).toBe(true);
    expect(
      await form.evaluate((node: HTMLFormElement) => new FormData(node).getAll('feature')),
    ).toEqual(['maps', 'exports']);

    expect(
      await group.evaluate((node: HTMLElement & { values: string[] }) => node.values),
    ).toEqual(['maps', 'exports']);
  });

  test('reset restores the initial checked children', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-checkbox-group name="scope" label="Scope">
            <ads-checkbox value="read" checked>Read</ads-checkbox>
            <ads-checkbox value="write">Write</ads-checkbox>
          </ads-checkbox-group>
        </form>
      `;
    });

    await page.getByRole('checkbox', { name: 'Read' }).uncheck();
    await page.getByRole('checkbox', { name: 'Write' }).check();

    await page.locator('#form').evaluate((node: HTMLFormElement) => node.reset());

    await expect(page.getByRole('checkbox', { name: 'Read' })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Write' })).not.toBeChecked();
    expect(
      await page.locator('#form').evaluate((node: HTMLFormElement) => new FormData(node).getAll('scope')),
    ).toEqual(['read']);
  });

  test('fieldset disabling is reversible and omits values from FormData', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <fieldset id="outer" disabled>
            <ads-checkbox-group name="mode" label="Mode">
              <ads-checkbox value="auto" checked>Auto</ads-checkbox>
              <ads-checkbox value="manual">Manual</ads-checkbox>
            </ads-checkbox-group>
          </fieldset>
        </form>
      `;
    });

    await expect(page.getByRole('checkbox', { name: 'Auto' })).toBeDisabled();
    expect(
      await page.locator('#form').evaluate((node: HTMLFormElement) => new FormData(node).getAll('mode')),
    ).toEqual([]);

    await page.locator('#outer').evaluate((node: HTMLFieldSetElement) => {
      node.disabled = false;
    });
    await page.locator('ads-checkbox-group').evaluate(async (node) => {
      await (node as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    });

    await expect(page.getByRole('checkbox', { name: 'Auto' })).toBeEnabled();
    expect(
      await page.locator('#form').evaluate((node: HTMLFormElement) => new FormData(node).getAll('mode')),
    ).toEqual(['auto']);
  });

  test('group emits one input and one change event per user toggle', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-checkbox-group name="feature" label="Features">
          <ads-checkbox value="maps">Maps</ads-checkbox>
        </ads-checkbox-group>
      `;
    });

    await page.evaluate(() => {
      const group = document.querySelector('ads-checkbox-group');
      if (!group) throw new Error('checkbox group not found');
      (window as Window & { events?: string[] }).events = [];
      group.addEventListener('input', () => (window as Window & { events: string[] }).events.push('input'));
      group.addEventListener('change', () => (window as Window & { events: string[] }).events.push('change'));
    });

    await page.getByRole('checkbox', { name: 'Maps' }).check();

    expect(await page.evaluate(() => (window as Window & { events?: string[] }).events)).toEqual([
      'input',
      'change',
    ]);
  });
});
