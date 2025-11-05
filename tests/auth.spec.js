// @ts-check
const { test, expect } = require('@playwright/test');

// Test suite for authentication flow
test.describe('Authentication Flow with API Mocking', () => {

  test.beforeEach(async ({ page }) => {
    // Set localStorage to use the Node.js backend before navigating
    await page.addInitScript(() => {
      window.localStorage.setItem('USE_NODE_BACKEND', 'true');
    });

    // Go to the local index.html file
    await page.goto('/index.html#/login');
    await page.waitForSelector('form');
  });

  test('should allow a teacher to log in successfully', async ({ page }) => {
    // Mock the API response for a successful login
    await page.route('**/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          message: 'Login successful!',
          data: {
            token: 'fake-jwt-token',
            user: {
              id: 1,
              name: 'Professor Teste',
              email: 'professor.teste@conectedu.com',
              role: 'teacher'
            }
          }
        }),
      });
    });

    await page.locator('input[type="email"]').fill('professor.teste@conectedu.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // After successful login, the URL should change to the dashboard
    await expect(page).toHaveURL('/');

    // Verify that the dashboard is displayed
    await expect(page.locator('h1:has-text("Visão rápida dos seus alunos")')).toBeVisible();
  });

  test('should show an error for invalid credentials', async ({ page }) => {
    // Mock the API response for a failed login
    await page.route('**/login', route => {
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, message: 'Invalid credentials.' }),
      });
    });

    await page.locator('input[type="email"]').fill('professor.teste@conectedu.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Check for the error message from the mocked response
    const errorMessage = page.locator('div:has-text("Invalid credentials.")');
    await expect(errorMessage).toBeVisible();

    // Ensure the URL is still on the login page
    expect(page.url()).toContain('/#/login');
  });
});
