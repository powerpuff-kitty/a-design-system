import { expect, test, type Page } from '@playwright/test';

type SelectControl = HTMLElement & {
  value: string;
  values: string[];
  size: number;
  updateComplete: Promise<boolean>;
  setCustomValidity(message: string): void;
  checkValidity(): boolean;
  formStateRestoreCallback(state: string): void;
};
type CheckboxGroup = HTMLElement & {
  values: string[];
  updateComplete: Promise<boolean>;
  checkValidity(): boolean;
  formStateRestoreCallback(state: string): void;
};

async function openLab(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ads-ready', 'true');
}
async function submitted(page: Page, name: string): Promise<FormDataEntryValue[]> {
  return page.locator('#form').evaluate((node, key) => new FormData(node as HTMLFormElement).getAll(key), name);
}

test.beforeEach(async ({ page }) => { await openLab(page); });

test('select settles and distinguishes an empty option from an unmatched value', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `<form id="form"><ads-select name="plan" label="Plan" value="">
      <option value="">No plan</option><option value="team">Team</option>
    </ads-select></form>`;
  });
  const control = page.locator('ads-select');
  await expect(control.locator('select')).toHaveValue('');
  await expect.poll(() => submitted(page, 'plan')).toEqual(['']);
  // A runaway Lit update loop would prevent this browser task and timeout from completing.
  expect(await control.evaluate(async (node) => {
    await (node as SelectControl).updateComplete;
    await new Promise((resolve) => setTimeout(resolve, 0));
    return true;
  })).toBe(true);
  await control.evaluate((node) => { (node as SelectControl).value = 'not-an-option'; });
  await expect.poll(() => submitted(page, 'plan')).toEqual([]);
  await control.evaluate((node) => { (node as SelectControl).value = ''; });
  await expect.poll(() => submitted(page, 'plan')).toEqual(['']);
});

test('multiple select omits disabled options, disabled optgroups, and unknown requested values', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `<form id="form"><ads-select name="tool" label="Tools" multiple>
      <option value="map">Map</option><option value="export" disabled>Export</option>
      <optgroup label="Unavailable" disabled><option value="report">Report</option></optgroup>
      <option value="search">Search</option>
    </ads-select></form>`;
  });
  const control = page.locator('ads-select');
  await expect(control.locator('option')).toHaveCount(8); // Four source options and four mirrored native options.
  await control.evaluate((node) => { (node as SelectControl).values = ['map', 'export', 'report', 'missing', 'search']; });
  await expect.poll(() => submitted(page, 'tool')).toEqual(['map', 'search']);
  await control.evaluate((node) => { (node as SelectControl).formStateRestoreCallback('["search"]'); });
  await expect.poll(() => submitted(page, 'tool')).toEqual(['search']);
});

test('select forwards single input/change events and restores its initial value on reset', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `<form id="form"><ads-select name="plan" label="Plan" value="personal">
      <option value="personal">Personal</option><option value="team">Team</option>
    </ads-select></form>`;
    const select = sandbox.querySelector('ads-select')!;
    select.setAttribute('data-events', '');
    for (const name of ['input', 'change']) select.addEventListener(name, () => {
      select.setAttribute('data-events', `${select.getAttribute('data-events')}${name},`);
    });
  });
  const control = page.locator('ads-select');
  await control.locator('select').selectOption('team');
  await expect(control).toHaveAttribute('data-events', 'input,change,');
  await expect.poll(() => submitted(page, 'plan')).toEqual(['team']);
  await page.locator('#form').evaluate((node) => (node as HTMLFormElement).reset());
  await expect(control.locator('select')).toHaveValue('personal');
  await expect.poll(() => submitted(page, 'plan')).toEqual(['personal']);
  await expect(control).toHaveAttribute('data-events', 'input,change,');
});

test('select custom validity and inherited fieldset disabling are reversible', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `<form id="form"><fieldset id="fieldset">
      <ads-select name="plan" label="Plan" value="team" required><option value="team">Team</option></ads-select>
    </fieldset></form>`;
  });
  const control = page.locator('ads-select');
  await expect.poll(() => submitted(page, 'plan')).toEqual(['team']);
  expect(await control.evaluate((node) => {
    const select = node as SelectControl;
    select.setCustomValidity('Plan is unavailable.');
    return select.checkValidity();
  })).toBe(false);
  await page.locator('#fieldset').evaluate((node) => { (node as HTMLFieldSetElement).disabled = true; });
  await expect(control.locator('select')).toBeDisabled();
  await expect.poll(() => submitted(page, 'plan')).toEqual([]);
  await page.locator('#fieldset').evaluate((node) => { (node as HTMLFieldSetElement).disabled = false; });
  await expect(control.locator('select')).toBeEnabled();
  expect(await control.evaluate((node) => {
    const select = node as SelectControl;
    select.setCustomValidity('');
    return select.checkValidity();
  })).toBe(true);
  await expect.poll(() => submitted(page, 'plan')).toEqual(['team']);
});

test('select returns from a listbox size to a native single-row control', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = '<ads-select label="Plan" size="4"><option value="a">A</option><option value="b">B</option></ads-select>';
  });
  const control = page.locator('ads-select');
  await expect(control.locator('select')).toHaveAttribute('size', '4');
  await expect(control.locator('[part="indicator"]')).not.toBeVisible();
  await control.evaluate((node) => { (node as SelectControl).size = 0; });
  await expect(control.locator('select')).not.toHaveAttribute('size');
  await expect(control.locator('[part="indicator"]')).toBeVisible();
});

test('checkbox group submits only real enabled selections and validates required against them', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `<form id="form"><ads-checkbox-group name="tool" label="Tools" required>
      <ads-checkbox value="map">Map</ads-checkbox>
      <ads-checkbox value="export" disabled>Export</ads-checkbox>
    </ads-checkbox-group></form>`;
  });
  const control = page.locator('ads-checkbox-group');
  await expect(page.getByRole('checkbox', { name: 'Map', exact: true })).toBeVisible();
  await control.evaluate((node) => { (node as CheckboxGroup).values = ['export', 'missing']; });
  await expect.poll(() => submitted(page, 'tool')).toEqual([]);
  await expect.poll(() => control.evaluate((node) => (node as CheckboxGroup).checkValidity())).toBe(false);
  await page.getByRole('checkbox', { name: 'Map', exact: true }).check();
  await expect.poll(() => submitted(page, 'tool')).toEqual(['map']);
  await expect.poll(() => control.evaluate((node) => (node as CheckboxGroup).checkValidity())).toBe(true);
});

test('removing a checkbox from a disabled group releases inherited group state', async ({ page }) => {
  await page.locator('#sandbox').evaluate((sandbox) => {
    sandbox.innerHTML = `<ads-checkbox-group label="Tools" disabled>
      <ads-checkbox id="movable" value="map">Map</ads-checkbox>
    </ads-checkbox-group><div id="destination"></div>`;
  });
  await expect(page.getByRole('checkbox', { name: 'Map', exact: true })).toBeDisabled();
  await page.locator('#movable').evaluate((node) => document.querySelector('#destination')!.append(node));
  await expect(page.getByRole('checkbox', { name: 'Map', exact: true })).toBeEnabled();
  await expect(page.locator('#movable')).not.toHaveAttribute('disabled');
  await page.getByRole('checkbox', { name: 'Map', exact: true }).check();
  await expect(page.getByRole('checkbox', { name: 'Map', exact: true })).toBeChecked();
});
