import { expect, test } from '@playwright/test';

test('login then go to profile', async ({ page }) => {
  await page.goto('/login');

  await page.locator('input[type="text"]').fill('demouser');
  await page.locator('input[type="password"]').fill('demo123');
  await page.locator('button[type="submit"]').click();

  await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 15000 });

  const avatar = page.locator('header img[alt="Profile"]');
  await expect(avatar).toBeVisible();
  await avatar.click();

  await expect(page).toHaveURL(/\/profile$/);
});
