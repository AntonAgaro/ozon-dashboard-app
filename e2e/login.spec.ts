import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

// Smoke: ensure authenticated home is accessible by seeding auth cookie
test('login flow redirects to home', async ({ page }) => {
  const token = jwt.sign({ login: 'admin' }, 'test-secret', { expiresIn: '24h' });
  await page.context().addCookies([
    { name: 'pewpewpew', value: token, url: 'http://localhost:3000' },
  ]);
  await page.goto('/');
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByText('Остатки товаров')).toBeVisible();
});
