import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

// Happy-path remains flow: login -> navigate -> intercept remains -> validate table
test('remains page shows table with cluster headers and counts', async ({ page }) => {
  // Seed auth cookie so server middleware allows access
  const token = jwt.sign({ login: 'admin' }, 'test-secret', { expiresIn: '24h' });
  await page.context().addCookies([{ name: 'pewpewpew', value: token, url: 'http://localhost:3000' }]);

  // Intercept login to succeed
  await page.route('**/api/login', async (route) => {
    const body = route.request().postDataJSON?.();
    if (body?.login && body?.password) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', message: 'Successfully auth' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'error', message: 'No login or password' }),
      });
    }
  });

  // Rely on server-side mock (E2E=1) for remains data

  // First load home to ensure client app is mounted (avoids SSR fetch bypassing interception)
  await page.goto('/');
  await expect(page.getByText('Остатки товаров')).toBeVisible();
  // Navigate client-side to remains page
  await page.getByRole('link', { name: 'Остатки товаров' }).click();
  // On remains page, table should render
  await expect(page.getByRole('heading', { name: 'Остатки товаров' })).toBeVisible();

  // Wait for counts to appear to ensure table is populated
  await expect(page.getByText('2 товаров')).toBeVisible();
  // Headers for clusters should be present somewhere in the table UI
  const table = page.locator('table');
  await expect(table.locator('text=Склад 1').first()).toBeVisible();
  await expect(table.locator('text=Склад 2').first()).toBeVisible();

  // Unique goods and clusters counts displayed near title
  await expect(page.getByText('2 товаров')).toBeVisible();
  await expect(page.getByText('2 складов / clusters')).toBeVisible();

  // Search and Export button present
  await expect(page.getByPlaceholder('Поиск товара')).toBeVisible();
  await expect(page.getByRole('button', { name: /Export CSV/i })).toBeVisible();
});
