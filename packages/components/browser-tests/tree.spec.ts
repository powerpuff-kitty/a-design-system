import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('ads-tree', () => {
  test('synchronizes nested tree state and supports keyboard navigation', async ({ page }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-tree label="Files">
          <div role="treeitem" aria-expanded="true">
            src
            <div role="group">
              <div role="treeitem">index.ts</div>
              <div role="treeitem" aria-expanded="false">
                components
                <div role="group"><div role="treeitem">button.ts</div></div>
              </div>
            </div>
          </div>
          <div role="treeitem">README.md</div>
        </ads-tree>
      `;
    });

    const tree = page.locator('ads-tree');
    const items = tree.locator('[role="treeitem"]');
    const root = items.nth(0);
    const index = items.nth(1);
    const components = items.nth(2);
    const button = items.nth(3);
    const readme = items.nth(4);

    await expect(tree.locator('[role="tree"]')).toHaveAttribute('aria-label', 'Files');
    await expect(root).toHaveAttribute('aria-expanded', 'true');
    await expect(components).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeHidden();
    await expect(root).toHaveAttribute('tabindex', '0');
    await expect(index).toHaveAttribute('aria-selected', 'false');

    await root.focus();
    await page.keyboard.press('ArrowDown');
    await expect(index).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(components).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(components).toHaveAttribute('aria-expanded', 'true');
    await expect(button).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(button).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(components).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(components).toHaveAttribute('aria-expanded', 'false');

    await page.keyboard.press('End');
    await expect(readme).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(readme).toHaveAttribute('aria-selected', 'true');
    await expect(root).toHaveAttribute('aria-selected', 'false');
  });
});
