import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/?theme=minimal-light');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

async function mountPalette(page: Page): Promise<void> {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `
      <dialog class="ads-command-palette" open aria-label="Command palette">
        <label class="ads-command-palette__search">
          <span aria-hidden="true">⌘</span>
          <input aria-label="Search commands" value="col" />
          <kbd>ESC</kbd>
        </label>
        <div class="ads-command-palette__list" role="listbox" aria-label="Commands">
          <div class="ads-command-palette__group-label">Tools</div>
          <button class="ads-command-palette__item" role="option" aria-selected="true">
            <span class="ads-command-palette__item-main">
              <strong>Color Space</strong>
              <span class="ads-command-palette__item-description">Explore colors in 3D.</span>
            </span>
            <kbd class="ads-command-palette__shortcut">3D</kbd>
          </button>
          <button class="ads-command-palette__item" role="option" aria-selected="false">
            <span class="ads-command-palette__item-main">
              <strong>Palette</strong>
              <span class="ads-command-palette__item-description">Edit artwork colors.</span>
            </span>
          </button>
          <div class="ads-command-palette__group-label">Actions</div>
          <button class="ads-command-palette__item" role="option" aria-selected="false">
            <span class="ads-command-palette__item-main">
              <strong>Undo</strong>
              <span class="ads-command-palette__item-description">Move back in history.</span>
            </span>
            <kbd class="ads-command-palette__shortcut">⌘ Z</kbd>
          </button>
        </div>
      </dialog>
    `;
  });
}

test.describe('Minimal command palette recipe', () => {
  test('uses sharp hairline overlay chrome and visible selected state', async ({ page }) => {
    await openLab(page);
    await mountPalette(page);

    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    await expect(dialog).toBeVisible();

    const chrome = await dialog.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        radius: style.borderRadius,
        border: style.borderTopWidth,
        background: style.backgroundColor,
        shadow: style.boxShadow,
      };
    });

    expect(chrome.radius).toBe('0px');
    expect(chrome.border).toBe('1px');
    expect(chrome.background).not.toBe('');
    expect(chrome.shadow).not.toBe('');

    const selected = page.locator('.ads-command-palette__item[aria-selected="true"]');
    await expect(selected).toBeVisible();
    const selectedBackground = await selected.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(selectedBackground).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('keeps a keyboard-visible focus treatment', async ({ page }) => {
    await openLab(page);
    await mountPalette(page);

    const input = page.getByLabel('Search commands');
    await input.focus();
    await page.keyboard.press('Tab');

    const focused = page.locator('.ads-command-palette__item').first();
    await expect(focused).toBeFocused();
    const outline = await focused.evaluate((element) => {
      const style = getComputedStyle(element);
      return { style: style.outlineStyle, width: style.outlineWidth };
    });
    expect(outline.style).not.toBe('none');
    expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
  });

  test('becomes a bottom-sheet composition on narrow viewports', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openLab(page);
    await mountPalette(page);

    const dialog = page.getByRole('dialog', { name: 'Command palette' });
    const box = await dialog.boundingBox();
    if (!box) throw new Error('Command palette did not render');

    expect(box.width).toBeCloseTo(390, 0);
    expect(box.y + box.height).toBeCloseTo(844, 0);
  });
});
