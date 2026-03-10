import { expect, test } from '@playwright/test';

test('profile edit and dynamic recent consultations', async ({ page }) => {
  test.setTimeout(120000);
  const question = `profile-flow-${Date.now()}`;
  const newName = `Profile${Date.now().toString().slice(-4)}`;

  await page.goto('http://127.0.0.1:3002/login');
  await page.locator('input[type="text"]').fill('demouser');
  await page.locator('input[type="password"]').fill('demo123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 });

  await page.getByRole('button', { name: '立即咨询' }).first().click();
  await page.getByRole('button', { name: '开始咨询' }).click();
  await page.locator('textarea').fill(question);
  await page.keyboard.press('Enter');
  await expect(page.getByText(question).first()).toBeVisible({ timeout: 15000 });
  await page.locator('header button').first().click();
  await page.locator('header button').first().click();

  await page.getByRole('link', { name: '我的' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.locator('section').nth(1).locator('button').first()).toBeVisible({ timeout: 15000 });

  await page.getByTestId('profile-edit-btn').click();
  await expect(page).toHaveURL(/\/profile\/edit$/);
  await expect(page.getByTestId('profile-save-btn')).toBeEnabled({ timeout: 15000 });

  await page.getByTestId('profile-name-input').fill(newName);

  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9n3qkAAAAASUVORK5CYII=',
    'base64'
  );
  await page.getByTestId('profile-avatar-file').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: png1x1,
  });

  await page.getByTestId('profile-save-btn').click();
  await expect(page).toHaveURL(/\/profile$/);

  await expect(page.getByTestId('profile-name')).toContainText(newName);
  await expect
    .poll(async () => (await page.getByTestId('profile-avatar').getAttribute('src')) || '', { timeout: 15000 })
    .toContain('/api/auth/avatar/');
});
