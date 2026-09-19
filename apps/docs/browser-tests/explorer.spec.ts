import { expect, test } from '@playwright/test';

async function openDocs(page: import('@playwright/test').Page, path = '/'): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test('catalogue lists only registered exports and opens without a marketing hero', async ({ page }, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openDocs(page);
  await expect(page.getByRole('heading', { name: 'Button', exact: true })).toBeVisible();
  const count = Number(await page.locator('#component-count').textContent());
  expect(count).toBeGreaterThanOrEqual(6);
  await expect(page.locator('#component-list a')).toHaveCount(count);
  expect(await page.locator('#component-list a').evaluateAll((links) => links.every((link) => Boolean(customElements.get(link.getAttribute('href')!.slice(1)))))).toBe(true);
  await expect(page.locator('.hero')).toHaveCount(0);
  await expect(page.locator('#preview-content ads-button button')).toBeVisible();
  await info.attach('minimal-docs-desktop', { body: await page.screenshot(), contentType: 'image/png' });
});

test('search filters the library and API comes from the selected contract', async ({ page }) => {
  await openDocs(page);
  await page.getByLabel('Find a component').fill('radio');
  await expect(page.locator('#component-list a')).toHaveCount(2);
  await page.getByRole('link', { name: 'Radio Group', exact: true }).click();
  await page.getByRole('tab', { name: 'API', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Attributes', exact: true })).toContainText('required');
  await expect(page.getByRole('table', { name: 'CSS parts', exact: true })).toBeVisible();
  await page.getByLabel('Find a component').fill('nothing-like-this');
  await expect(page.locator('#library-empty')).toBeVisible();
});

test('all three theme presets and densities remain available', async ({ page }) => {
  await openDocs(page);
  const backgrounds: string[] = [];
  for (const theme of ['minimal-light', 'minimal-dark', 'minimal-high-contrast']) {
    await page.getByLabel('Theme preset', { exact: true }).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-ads-theme', theme);
    backgrounds.push(await page.locator('html').evaluate((node) => getComputedStyle(node).backgroundColor));
  }
  expect(new Set(backgrounds).size).toBeGreaterThan(1);
  for (const density of ['compact', 'default', 'comfortable']) {
    await page.getByLabel('Density', { exact: true }).selectOption(density);
    await expect(page.locator('html')).toHaveAttribute('data-ads-density', density);
    await expect(page.locator('#preview-mode')).toContainText(density);
  }
  await page.getByLabel('Preview direction').selectOption('rtl');
  await expect(page.locator('#preview-stage')).toHaveAttribute('dir', 'rtl');
});

test('component token overrides style the instance without changing docs chrome', async ({ page }) => {
  await openDocs(page);
  const radius = page.getByRole('textbox', { name: '--ads-button-radius', exact: true });
  await radius.fill('12px');
  await radius.press('Tab');
  await expect(page.locator('#preview-content ads-button button')).toHaveCSS('border-radius', '12px');
  await expect(page.locator('#command-trigger')).toHaveCSS('border-radius', '0px');
  await page.getByRole('tab', { name: 'Styling', exact: true }).click();
  await expect(page.locator('#override-code')).toContainText('--ads-button-radius: 12px;');
  await page.locator('#reset-overrides').click();
  await expect(page.locator('#preview-content ads-button button')).toHaveCSS('border-radius', '0px');
});

test('preview state and tab keyboard navigation are operational', async ({ page }) => {
  await openDocs(page);
  await page.locator('#state-controls').getByLabel('disabled', { exact: true }).check();
  await expect(page.locator('#preview-content ads-button button')).toBeDisabled();
  await page.getByRole('tab', { name: 'Preview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Usage', exact: true })).toBeFocused();
  await expect(page.locator('#usage-view')).toBeVisible();
  await expect(page.locator('#source-code')).toContainText('<ads-button>');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Styling', exact: true })).toBeFocused();
});

test('command search supports active descendant, empty results, Escape and selection', async ({ page }) => {
  await openDocs(page);
  await page.locator('#command-trigger').click();
  const search = page.getByRole('combobox', { name: 'Search documentation', exact: true });
  await expect(search).toBeFocused();
  await search.fill('no match exists');
  await expect(page.locator('#command-empty')).toBeVisible();
  await expect(search).not.toHaveAttribute('aria-activedescendant');
  await search.fill('radio group');
  await expect(search).toHaveAttribute('aria-activedescendant', 'command-0');
  await search.press('Enter');
  await expect(page.locator('#command-palette')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Radio Group', exact: true })).toBeVisible();
  await page.locator('#command-trigger').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#command-trigger')).toBeFocused();
});

test('mobile panels are modal, single-instance, reversible and do not overflow', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDocs(page);
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await expect(page.locator('#panel-sheet')).toBeVisible();
  await expect(page.locator('#navigation')).toHaveCount(1);
  await page.locator('#panel-sheet').getByRole('link', { name: 'Input', exact: true }).click();
  await expect(page.locator('#panel-sheet')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Library', exact: true })).toBeFocused();
  await expect(page.getByRole('heading', { name: 'Input', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Customize', exact: true }).click();
  await expect(page.locator('#panel-sheet').getByLabel('Theme preset')).toBeVisible();
  await expect(page.locator('#inspector')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Customize', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await info.attach('minimal-docs-mobile', { body: await page.screenshot(), contentType: 'image/png' });
});

test('layout starters expose honest scope and usable source', async ({ page }) => {
  await openDocs(page);
  await expect(page.locator('#recipe-list a')).toHaveCount(3);
  await page.getByRole('link', { name: 'Settings form', exact: true }).click();
  await expect(page.locator('#preview-content form')).toBeVisible();
  await page.locator('#preview-content').getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.locator('#preview-events')).toContainText('Nothing was saved or sent');
  await page.getByRole('tab', { name: 'Usage', exact: true }).click();
  await expect(page.locator('#usage-note')).toContainText('not a CLI-installed application template');
  await expect(page.locator('#source-code')).toContainText('name="displayName"');
});

test('query presets work when storage is blocked and history restores selection', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('blocked'); };
    Storage.prototype.setItem = () => { throw new Error('blocked'); };
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openDocs(page, '/?theme=minimal-dark&density=comfortable#ads-input');
  await expect(page.locator('html')).toHaveAttribute('data-ads-theme', 'minimal-dark');
  await expect(page.locator('html')).toHaveAttribute('data-ads-density', 'comfortable');
  await page.getByRole('link', { name: 'Checkbox', exact: true }).click();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Input', exact: true })).toBeVisible();
});
