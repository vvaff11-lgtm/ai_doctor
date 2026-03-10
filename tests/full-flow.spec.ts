import { expect, test } from '@playwright/test';

test('login -> consult -> send -> exit -> history', async ({ page }) => {
  test.setTimeout(90000);
  const question = `最近总是头晕怎么办-${Date.now()}`;

  await page.goto('/login');
  await page.locator('input[type="text"]').fill('demouser');
  await page.locator('input[type="password"]').fill('demo123');
  await page.locator('button[type="submit"]').click();

  await page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 });

  // Clear old history first
  await page.locator('a[href="/history"]').click();
  await expect(page).toHaveURL(/\/history$/);
  const clearBtn = page.getByRole('button', { name: /全部清除|清除中/ });
  if ((await clearBtn.count()) > 0 && (await clearBtn.isEnabled())) {
    await clearBtn.click();
  }

  await page.locator('a[href="/"]').click();
  await expect(page).toHaveURL(/\/$/);

  // Immediate consultation
  await page.getByRole('button', { name: '立即咨询' }).first().click();
  await expect(page).toHaveURL(/\/doctor\//);

  await page.getByRole('button', { name: '开始咨询' }).click();
  await expect(page).toHaveURL(/\/chat\//);

  await page.locator('textarea').fill(question);
  await page.keyboard.press('Enter');
  await expect(page.getByText(question)).toBeVisible({ timeout: 15000 });

  // Exit chat -> doctor details -> home
  await page.locator('header button').first().click();
  await expect(page).toHaveURL(/\/doctor\//);
  await page.locator('header button').first().click();
  await expect(page).toHaveURL(/\/$/);

  // Open history and verify record exists
  await page.locator('a[href="/history"]').click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByText(question)).toBeVisible({ timeout: 15000 });
});
