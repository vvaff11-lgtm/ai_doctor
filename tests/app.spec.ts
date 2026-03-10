import { expect, test } from '@playwright/test';

test('login page renders key controls', async ({ page }) => {
  await page.goto('/login');

  await expect(page.locator('input[type="text"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});
