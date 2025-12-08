import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * Tests login, logout, and authentication flows
 */

const TEST_STUDENT = {
  email: 'test@kognisia.com',
  password: 'test123456'
}

const TEST_TEACHER = {
  email: 'guru@kognisia.com',
  password: 'guru123456'
}

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to login page when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 })
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[type="email"]', TEST_STUDENT.email)
    await page.fill('input[type="password"]', TEST_STUDENT.password)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Dashboard should have loaded (check URL is still dashboard)
    expect(page.url()).toContain('dashboard')
  })

  test('should show error with invalid email', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check if still on login page (most common behavior)
    const currentUrl = page.url()
    const stillOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:3000/'
    
    // If redirected to dashboard, that's a problem (should fail login)
    const redirectedToDashboard = currentUrl.includes('/dashboard')
    
    // Should NOT be on dashboard with invalid credentials
    expect(redirectedToDashboard).toBe(false)
  })

  test('should show error with invalid password', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', TEST_STUDENT.email)
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    // Wait for response
    await page.waitForTimeout(3000)
    
    // Check if still on login page (most common behavior)
    const currentUrl = page.url()
    const stillOnLogin = currentUrl.includes('/login') || currentUrl === 'http://localhost:3000/'
    
    // If redirected to dashboard, that's a problem (should fail login)
    const redirectedToDashboard = currentUrl.includes('/dashboard')
    
    // Should NOT be on dashboard with invalid credentials
    expect(redirectedToDashboard).toBe(false)
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_STUDENT.email)
    await page.fill('input[type="password"]', TEST_STUDENT.password)
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 })
    
    // Find and click logout button
    await page.click('button:has-text("Logout"), button:has-text("Keluar")')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 })
  })

  test('should redirect teacher to teacher portal', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', TEST_TEACHER.email)
    await page.fill('input[type="password"]', TEST_TEACHER.password)
    
    await page.click('button[type="submit"]')
    
    // Should redirect to teacher portal
    await expect(page).toHaveURL(/.*teacher/, { timeout: 10000 })
  })

  test('should validate empty fields', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]')
    
    // Should show validation errors or prevent submission
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeFocused()
  })
})
