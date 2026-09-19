import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('core ADS actions and content components', () => {
  test.beforeEach(async ({ page }) => {
    await openLab(page);
  });

  test('registers the core content/action tranche through the public package entrypoint', async ({ page }) => {
    expect(
      await page.evaluate(() =>
        [
          'ads-avatar',
          'ads-badge',
          'ads-button-group',
          'ads-card',
          'ads-code',
          'ads-copy-button',
          'ads-icon-button',
          'ads-kbd',
          'ads-link',
          'ads-separator',
          'ads-tag',
        ].every((tag) => Boolean(customElements.get(tag))),
      ),
    ).toBe(true);
  });

  test('ads-icon-button exposes its required accessible name and native disabled state', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-icon-button label="Open settings" disabled>
          <span aria-hidden="true">⚙</span>
        </ads-icon-button>
      `;
    });

    const button = page.getByRole('button', { name: 'Open settings' });
    await expect(button).toBeDisabled();
  });

  test('ads-button-group uses a named semantic group without overriding button semantics', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-button-group label="Editor actions">
          <ads-button>Save</ads-button>
          <ads-button variant="secondary">Preview</ads-button>
        </ads-button-group>
      `;
    });

    await expect(page.getByRole('group', { name: 'Editor actions' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible();
  });

  test('ads-tag dispatches one composed removal event from its native remove button', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-tag id="tag" label="TypeScript" removable>TypeScript</ads-tag>`;
      const tag = sandbox.querySelector('#tag');
      (window as Window & { adsRemoveCount?: number }).adsRemoveCount = 0;
      tag?.addEventListener('ads-remove', () => {
        (window as Window & { adsRemoveCount: number }).adsRemoveCount += 1;
      });
    });

    await page.getByRole('button', { name: 'Remove TypeScript' }).click();
    expect(
      await page.evaluate(() => (window as Window & { adsRemoveCount?: number }).adsRemoveCount),
    ).toBe(1);
  });

  test('ads-link adds noopener for blank-target links while preserving native anchor behavior', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-link href="https://example.com" target="_blank">Docs</ads-link>`;
    });

    const link = page.getByRole('link', { name: 'Docs' });
    await expect(link).toHaveAttribute('href', 'https://example.com');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('ads-separator exposes orientation and can opt into decorative presentation', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-separator orientation="vertical"></ads-separator>
        <ads-separator id="decorative" decorative></ads-separator>
      `;
    });

    await expect(page.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    await expect(page.locator('#decorative').locator('[part="separator"]')).toHaveAttribute('role', 'presentation');
  });

  test('ads-code uses native pre/code semantics in block mode', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-code block language="ts">const answer = 42;</ads-code>`;
    });

    await expect(page.locator('ads-code').locator('pre')).toBeVisible();
    await expect(page.locator('ads-code').locator('code')).toHaveAttribute('data-language', 'ts');
  });

  test('ads-avatar falls back to initials after an image error', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-avatar
          src="/definitely-missing-avatar.png"
          alt="Ada Lovelace"
          initials="AL"
        ></ads-avatar>
      `;
    });

    const avatar = page.locator('ads-avatar');
    await expect(avatar.locator('[part="fallback"]')).toHaveText('AL');
    await expect(avatar.locator('[part="avatar"]')).toHaveAttribute('aria-label', 'Ada Lovelace');
  });

  test('ads-copy-button exposes a deterministic error event when no value can be resolved', async ({ page }) => {
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `<ads-copy-button id="copy"></ads-copy-button>`;
      const copy = sandbox.querySelector('#copy');
      (window as Window & { adsCopyErrors?: number }).adsCopyErrors = 0;
      copy?.addEventListener('ads-copy-error', () => {
        (window as Window & { adsCopyErrors: number }).adsCopyErrors += 1;
      });
    });

    await page.getByRole('button', { name: 'Copy' }).click();
    expect(
      await page.evaluate(() => (window as Window & { adsCopyErrors?: number }).adsCopyErrors),
    ).toBe(1);
  });
});
