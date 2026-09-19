import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test('ads-table exposes native table semantics and configuration', async ({ page }) => {
  await openLab(page);
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `
      <ads-table label="People" density="compact" striped>
        <span slot="caption">People</span>
        <tr><td>Ada</td><td>Engineer</td></tr>
      </ads-table>
    `;
  });

  const table = page.locator('ads-table');
  await expect(table.locator('[part="table"]')).toHaveAttribute('aria-label', 'People');
  await expect(table.locator('caption')).toBeVisible();
  await expect(table).toHaveAttribute('density', 'compact');
  await expect(table).toHaveAttribute('striped', '');
});
