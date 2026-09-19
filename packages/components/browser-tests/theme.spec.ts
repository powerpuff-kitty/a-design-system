import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/?theme=minimal-light&density=default');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('a-design-system-theme', () => {
  test('scopes Minimal theme and density through inherited public tokens', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-button id="root-button">Root</ads-button>
        <a-design-system-theme id="scope" theme="minimal-dark" density="compact">
          <ads-button id="scoped-button">Scoped</ads-button>
        </a-design-system-theme>
      `;
    });

    const scope = page.locator('#scope');
    await expect(scope).toHaveAttribute('data-ads-theme', 'minimal-dark');
    await expect(scope).toHaveAttribute('data-ads-density', 'compact');

    const values = await page.evaluate(() => {
      const root = document.querySelector('#root-button')?.shadowRoot?.querySelector('button');
      const scoped = document.querySelector('#scoped-button')?.shadowRoot?.querySelector('button');
      if (!root || !scoped) throw new Error('Scoped theme fixtures did not render');
      return {
        rootBackground: getComputedStyle(root).backgroundColor,
        scopedBackground: getComputedStyle(scoped).backgroundColor,
        rootHeight: getComputedStyle(root).minBlockSize,
        scopedHeight: getComputedStyle(scoped).minBlockSize,
      };
    });

    expect(values.rootBackground).not.toBe(values.scopedBackground);
    expect(values.rootHeight).toBe('36px');
    expect(values.scopedHeight).toBe('32px');
  });

  test('updates scoped high-contrast and comfortable modes without re-registering components', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <a-design-system-theme id="scope" theme="minimal-light" density="default">
          <ads-input id="scoped-input" label="Scoped input"></ads-input>
        </a-design-system-theme>
      `;
    });

    await page.locator('#scope').evaluate((element) => {
      element.setAttribute('theme', 'minimal-high-contrast');
      element.setAttribute('density', 'comfortable');
    });
    await expect(page.locator('#scope')).toHaveAttribute('data-ads-theme', 'minimal-high-contrast');
    await expect(page.locator('#scope')).toHaveAttribute('data-ads-density', 'comfortable');

    const result = await page.evaluate(() => {
      const host = document.querySelector('#scope');
      const control = document.querySelector('#scoped-input')?.shadowRoot?.querySelector('[part="control"]');
      if (!host || !control) throw new Error('Scoped input did not render');
      const hostStyle = getComputedStyle(host);
      return {
        focusWidth: hostStyle.getPropertyValue('--ads-focus-width').trim(),
        height: getComputedStyle(control).minBlockSize,
      };
    });

    expect(result.focusWidth).toBe('3px');
    expect(result.height).toBe('44px');
  });
});
