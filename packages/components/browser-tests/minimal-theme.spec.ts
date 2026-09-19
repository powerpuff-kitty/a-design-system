import { expect, test, type Page } from '@playwright/test';

async function openTheme(page: Page, theme: 'minimal-light' | 'minimal-dark' | 'minimal-high-contrast'): Promise<void> {
  await page.goto(`/?theme=${theme}`);
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-ads-theme', theme);
}

test.describe('ADS Minimal reference theme', () => {
  test('light theme exposes square controls, compact visual height, and semantic chrome tokens', async ({ page }) => {
    await openTheme(page, 'minimal-light');

    const tokens = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        radius: style.getPropertyValue('--ads-radius-control').trim(),
        control: style.getPropertyValue('--ads-size-control-default').trim(),
        target: style.getPropertyValue('--ads-size-target-minimum').trim(),
        line: style.getPropertyValue('--ads-color-line-control').trim(),
        surface: style.getPropertyValue('--ads-color-surface-page').trim(),
        elevation: style.getPropertyValue('--ads-elevation-none').trim(),
      };
    });

    expect(tokens.radius).toBe('0px');
    expect(tokens.control).toBe('36px');
    expect(tokens.target).toBe('44px');
    expect(tokens.line).not.toBe('');
    expect(tokens.surface).not.toBe('');
    expect(tokens.elevation).toContain('0px 0px 0px 0px');
  });

  test('current core controls consume Minimal semantic tokens instead of rounded component defaults', async ({ page }) => {
    await openTheme(page, 'minimal-light');
    await page.locator('#sandbox').evaluate((sandbox) => {
      sandbox.innerHTML = `
        <ads-button>Save</ads-button>
        <ads-input label="Title" value="Minimal"></ads-input>
        <ads-textarea label="Notes">Text</ads-textarea>
        <ads-checkbox checked>Enabled</ads-checkbox>
        <ads-radio-group label="Mode" value="a">
          <ads-radio value="a">A</ads-radio>
          <ads-radio value="b">B</ads-radio>
        </ads-radio-group>
      `;
    });

    const result = await page.evaluate(() => {
      const button = document.querySelector('ads-button')?.shadowRoot?.querySelector('button');
      const input = document.querySelector('ads-input')?.shadowRoot?.querySelector('[part="control"]');
      const textarea = document.querySelector('ads-textarea')?.shadowRoot?.querySelector('[part="control"]');
      const checkbox = document.querySelector('ads-checkbox')?.shadowRoot?.querySelector('[part="indicator"]');
      const radio = document.querySelector('ads-radio')?.shadowRoot?.querySelector('[part="indicator"]');
      if (!button || !input || !textarea || !checkbox || !radio) throw new Error('Minimal fixtures did not render');
      return {
        buttonRadius: getComputedStyle(button).borderRadius,
        buttonHeight: getComputedStyle(button).minBlockSize,
        inputRadius: getComputedStyle(input).borderRadius,
        textareaRadius: getComputedStyle(textarea).borderRadius,
        checkboxRadius: getComputedStyle(checkbox).borderRadius,
        radioRadius: getComputedStyle(radio).borderRadius,
      };
    });

    expect(result.buttonRadius).toBe('0px');
    expect(result.buttonHeight).toBe('36px');
    expect(result.inputRadius).toBe('0px');
    expect(result.textareaRadius).toBe('0px');
    expect(result.checkboxRadius).toBe('0px');
    expect(result.radioRadius).not.toBe('0px');
  });

  test('dark and high-contrast variants preserve token shape while changing visual roles', async ({ page }) => {
    await openTheme(page, 'minimal-dark');
    const dark = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        page: style.getPropertyValue('--ads-color-surface-page').trim(),
        text: style.getPropertyValue('--ads-color-text-default').trim(),
        focus: style.getPropertyValue('--ads-focus-width').trim(),
      };
    });

    await openTheme(page, 'minimal-high-contrast');
    const contrast = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      return {
        page: style.getPropertyValue('--ads-color-surface-page').trim(),
        text: style.getPropertyValue('--ads-color-text-default').trim(),
        focus: style.getPropertyValue('--ads-focus-width').trim(),
      };
    });

    expect(dark.page).not.toBe(contrast.page);
    expect(dark.text).not.toBe(contrast.text);
    expect(dark.focus).toBe('2px');
    expect(contrast.focus).toBe('3px');
  });
});
