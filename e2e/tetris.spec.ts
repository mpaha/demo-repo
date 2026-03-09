import { test, expect } from '@playwright/test';

test('shows start screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('TETRIS');
  await expect(page.getByRole('button', { name: 'START GAME' })).toBeVisible();
});

test('starts game when clicking start', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'START GAME' }).click();
  await expect(page.locator('.board')).toBeVisible();
  await expect(page.locator('.overlay')).not.toBeVisible();
});

test('shows next piece preview', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'START GAME' }).click();
  const nextPanel = page.locator('.panel', { has: page.locator('h3', { hasText: 'NEXT' }) });
  await expect(nextPanel).toBeVisible();
});

test('shows hold piece panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'START GAME' }).click();
  const holdPanel = page.locator('.panel', { has: page.locator('h3', { hasText: 'HOLD' }) });
  await expect(holdPanel).toBeVisible();
});

test('can pause and resume', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'START GAME' }).click();
  await expect(page.locator('.overlay')).not.toBeVisible();

  await page.keyboard.press('p');
  await expect(page.locator('.overlay h2')).toHaveText('PAUSED');

  await page.keyboard.press('p');
  await expect(page.locator('.overlay')).not.toBeVisible();
});

test('shows score panel with initial values', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'START GAME' }).click();
  await expect(page.locator('.stat-label', { hasText: 'SCORE' })).toBeVisible();
  await expect(page.locator('.stat-label', { hasText: 'LEVEL' })).toBeVisible();
  await expect(page.locator('.stat-label', { hasText: 'LINES' })).toBeVisible();
});
