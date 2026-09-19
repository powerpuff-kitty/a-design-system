import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page, theme = 'minimal-light'): Promise<void> {
  await page.goto(`/?theme=${theme}`);
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('Minimal native HTML base styles', () => {
  test('keeps native controls sharp, tokenized, and visually compact', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <button id="native-button" type="button">Action</button>
        <input id="native-input" value="Value">
        <select id="native-select"><option>One</option></select>
        <textarea id="native-textarea">Notes</textarea>
        <kbd id="native-kbd">⌘ K</kbd>
      `;
    });

    for (const selector of ['#native-button', '#native-input', '#native-select', '#native-textarea', '#native-kbd']) {
      const radius = await page.locator(selector).evaluate((element) => getComputedStyle(element).borderRadius);
      expect(radius).toBe('0px');
    }

    const height = await page.locator('#native-button').evaluate((element) => getComputedStyle(element).minBlockSize);
    expect(height).toBe('36px');

    const border = await page.locator('#native-input').evaluate((element) => getComputedStyle(element).borderTopWidth);
    expect(border).toBe('1px');
  });

  test('applies keyboard focus and disabled semantics without decorative elevation', async ({ page }) => {
    await openLab(page, 'minimal-high-contrast');
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <button id="focus-button" type="button">Focus me</button>
        <button id="disabled-button" type="button" disabled>Disabled</button>
      `;
    });

    await page.getByRole('button', { name: 'Focus me' }).focus();
    const focus = await page.locator('#focus-button').evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle, shadow: style.boxShadow };
    });
    expect(Number.parseFloat(focus.width)).toBeGreaterThanOrEqual(3);
    expect(focus.style).not.toBe('none');
    expect(focus.shadow).toBe('none');

    const opacity = Number(await page.locator('#disabled-button').evaluate((element) => getComputedStyle(element).opacity));
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  test('styles native tables and code with hairline/data-oriented chrome', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <table>
          <thead><tr><th>Token</th><th>Value</th></tr></thead>
          <tbody><tr><td>radius.control</td><td><code>0px</code></td></tr></tbody>
        </table>
      `;
    });

    await expect(page.getByRole('columnheader', { name: 'Token' })).toBeVisible();
    const border = await page.getByRole('cell', { name: 'radius.control' }).evaluate((element) => getComputedStyle(element).borderBottomWidth);
    expect(border).toBe('1px');
    const codeFont = await page.getByText('0px', { exact: true }).evaluate((element) => getComputedStyle(element).fontFamily);
    expect(codeFont.toLowerCase()).toMatch(/mono|consolas|sfmono/);
  });
});
