import { expect, test, type Page } from '@playwright/test';

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}

test.describe('data and content components', () => {
  test('ads-card only exposes header and footer landmarks when they contain content', async ({
    page,
  }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-card id="body-only"><p>Body</p></ads-card>
        <ads-card id="with-sections">
          <h2 slot="header">Heading</h2>
          <p>Body</p>
          <div slot="footer">Actions</div>
        </ads-card>
      `;
    });

    const bodyOnly = page.locator('#body-only');
    await expect(bodyOnly.locator('header')).toBeHidden();
    await expect(bodyOnly.locator('footer')).toBeHidden();

    const withSections = page.locator('#with-sections');
    await expect(withSections.locator('header')).toBeVisible();
    await expect(withSections.locator('footer')).toBeVisible();
  });

  test('ads-avatar gives fallback content a name and keeps image alt text native', async ({
    page,
  }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-avatar alt="Jane Doe">JD</ads-avatar>
        <ads-avatar src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" alt="Jane Doe"></ads-avatar>
      `;
    });

    const avatars = page.locator('ads-avatar');
    await expect(avatars.nth(0).locator('[part="avatar"]')).toHaveAttribute('role', 'img');
    await expect(avatars.nth(0).locator('[part="avatar"]')).toHaveAttribute(
      'aria-label',
      'Jane Doe',
    );
    await expect(avatars.nth(1).locator('img')).toHaveAttribute('alt', 'Jane Doe');
    await expect(avatars.nth(1).locator('[part="avatar"]')).not.toHaveAttribute('role');
  });

  test('ads-popover connects its trigger and content and emits changes for activation', async ({
    page,
  }) => {
    await openLab(page);
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-popover>
          <span slot="trigger">Details</span>
          <p>More information</p>
        </ads-popover>
      `;
    });

    const popover = page.locator('ads-popover');
    const trigger = popover.locator('[part="trigger"]');
    const content = popover.locator('[part="popover"]');
    const contentId = await content.getAttribute('id');
    expect(contentId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-controls', contentId!);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await popover.evaluate((element) => {
      element.addEventListener('ads-toggle', () => element.setAttribute('data-toggle-count', '1'));
    });
    await trigger.click();
    await expect(popover).toHaveAttribute('open', '');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(popover).toHaveAttribute('data-toggle-count', '1');
  });
});
