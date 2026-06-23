import { test, expect } from '@playwright/test';

// E2E tests for browser automation behaviors
// These tests verify the app's automation is safe and respects constraints.

test.describe('Browser Automation Safety', () => {
  test('app loads without errors', async ({ page }) => {
    // In a real Electron test, we'd launch the app
    // Here we test the renderer standalone
    await page.goto('http://localhost:5173');
    await expect(page).toHaveTitle('AI Browser Agent');
  });

  test('URL bar accepts valid URLs', async ({ page }) => {
    await page.goto('http://localhost:5173');
    const urlInput = page.locator('input[placeholder*="URL"]');
    await urlInput.fill('https://example.com');
    await expect(urlInput).toHaveValue('https://example.com');
  });
});

test.describe('Security Constraints', () => {
  test('settings page shows approval mode options', async ({ page }) => {
    await page.goto('http://localhost:5173');
    // Settings button
    const settingsBtn = page.locator('button[title="Settings"]');
    await settingsBtn.click();
    await expect(page.locator('text=Approval Mode')).toBeVisible();
    await expect(page.locator('text=Manual')).toBeVisible();
    await expect(page.locator('text=Semi-Auto')).toBeVisible();
    await expect(page.locator('text=Automatic')).toBeVisible();
  });
});
