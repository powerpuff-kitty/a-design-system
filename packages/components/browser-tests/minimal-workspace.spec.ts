import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/?theme=minimal-light');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

async function mountWorkspace(page: Page): Promise<void> {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `
      <div class="ads-workspace" data-tools-collapsed="false" data-document-collapsed="false">
        <nav class="ads-workspace__rail" aria-label="Workspace tools">
          <button type="button">PA</button>
          <button type="button">3D</button>
        </nav>
        <aside class="ads-workspace__tools" data-pinned="true" data-mobile-open="false">
          <div class="ads-workspace__panel-controls">Tools</div>
          <div class="ads-workspace__panel-content">Palette controls</div>
        </aside>
        <main class="ads-workspace__result">Primary result</main>
        <aside class="ads-workspace__document" data-pinned="true" data-mobile-open="false">
          <div class="ads-workspace__panel-controls">Document</div>
          <div class="ads-workspace__panel-content">Export controls</div>
        </aside>
        <div class="ads-workspace__mobile-launchers">
          <button type="button">Tools</button>
          <button type="button">Document</button>
        </div>
      </div>
    `;
  });
}

test.describe('Minimal workspace recipe', () => {
  test('desktop keeps a dominant result with independent inspector collapse and pin states', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openLab(page);
    await mountWorkspace(page);

    const workspace = page.locator('.ads-workspace');
    const result = page.locator('.ads-workspace__result');
    const tools = page.locator('.ads-workspace__tools');
    const document = page.locator('.ads-workspace__document');

    await expect(result).toBeVisible();
    await expect(tools).toBeVisible();
    await expect(document).toBeVisible();

    const grid = await workspace.evaluate((element) => getComputedStyle(element).gridTemplateColumns);
    expect(grid.split(' ').length).toBeGreaterThanOrEqual(4);

    await workspace.evaluate((element) => {
      element.setAttribute('data-tools-collapsed', 'true');
    });
    await expect(page.locator('.ads-workspace__tools .ads-workspace__panel-content')).toBeHidden();

    const pinned = await tools.evaluate((element) => getComputedStyle(element).position);
    expect(pinned).toBe('sticky');

    await tools.evaluate((element) => element.setAttribute('data-pinned', 'false'));
    expect(await tools.evaluate((element) => getComputedStyle(element).position)).not.toBe('sticky');
  });

  test('mobile keeps result first and exposes inspectors only as explicit sheets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openLab(page);
    await mountWorkspace(page);

    const result = page.locator('.ads-workspace__result');
    const tools = page.locator('.ads-workspace__tools');
    const document = page.locator('.ads-workspace__document');
    const launchers = page.locator('.ads-workspace__mobile-launchers');

    await expect(result).toBeVisible();
    await expect(launchers).toBeVisible();
    await expect(tools).toBeHidden();
    await expect(document).toBeHidden();

    await tools.evaluate((element) => element.setAttribute('data-mobile-open', 'true'));
    await expect(tools).toBeVisible();

    await tools.evaluate((element) => element.setAttribute('data-mobile-open', 'false'));
    await document.evaluate((element) => element.setAttribute('data-mobile-open', 'true'));
    await expect(tools).toBeHidden();
    await expect(document).toBeVisible();

    const areas = await page.locator('.ads-workspace').evaluate((element) => getComputedStyle(element).gridTemplateAreas);
    expect(areas).toContain('result');
    expect(areas.indexOf('result')).toBeLessThan(areas.indexOf('rail'));
  });

  test('workspace CSS consumes theme tokens rather than introducing rounded/elevated card chrome', async ({ page }) => {
    await openLab(page);
    await mountWorkspace(page);

    const resultStyle = await page.locator('.ads-workspace__result').evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        radius: style.borderRadius,
        borderWidth: style.borderTopWidth,
        background: style.backgroundColor,
      };
    });

    expect(resultStyle.radius).toBe('0px');
    expect(resultStyle.borderWidth).toBe('1px');
    expect(resultStyle.background).not.toBe('');
  });
});
