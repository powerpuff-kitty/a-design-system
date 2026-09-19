import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('core action controls', () => {
  test('ads-button forwards focus and programmatic activation to its native button', async ({
    page,
  }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = '<ads-button>Save</ads-button>';
      sandbox.querySelector('ads-button')?.addEventListener('click', () => {
        sandbox.setAttribute('data-clicked', 'true');
      });
    });

    const host = page.locator('ads-button');
    await host.evaluate(async (element) => {
      await (element as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    });
    await host.focus();
    await expect(host.locator('button')).toBeFocused();
    await host.evaluate((element) => (element as HTMLElement).click());
    await expect(page.locator('#sandbox')).toHaveAttribute('data-clicked', 'true');
  });

  test('ads-link preserves native link semantics and secures blank targets', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-link href="/docs" target="_blank">Docs</ads-link>
        <ads-link>Not a link</ads-link>
      `;
    });

    const links = page.locator('ads-link');
    await expect(links.nth(0).locator('a')).toHaveAttribute('href', '/docs');
    await expect(links.nth(0).locator('a')).toHaveAttribute('rel', /noopener/);
    await expect(links.nth(1).locator('a')).not.toHaveAttribute('href');
    await links.nth(0).focus();
    await expect(links.nth(0).locator('a')).toBeFocused();
  });

  test('ads-icon-button has an accessible name and submits through its containing form', async ({
    page,
  }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <form id="form">
          <ads-icon-button type="submit" name="action" value="save" label="Save"></ads-icon-button>
        </form>
      `;
      sandbox.querySelector('form')?.addEventListener('submit', (event) => {
        event.preventDefault();
        sandbox.setAttribute('data-submitted', 'true');
      });
    });

    const host = page.locator('ads-icon-button');
    await expect(host.locator('button')).toHaveAttribute('aria-label', 'Save');
    await host.evaluate((element) => (element as HTMLElement).click());
    await expect(page.locator('#sandbox')).toHaveAttribute('data-submitted', 'true');
  });
});
