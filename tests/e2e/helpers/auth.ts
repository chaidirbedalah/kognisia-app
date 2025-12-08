import { Page } from '@playwright/test'

/**
 * Helper functions for authentication in E2E tests
 */

export const TEST_ACCOUNTS = {
  student: {
    email: 'test@kognisia.com',
    password: 'test123456'
  },
  teacher: {
    email: 'guru@kognisia.com',
    password: 'guru123456'
  }
}

/**
 * Login as student
 */
export async function loginAsStudent(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_ACCOUNTS.student.email)
  await page.fill('input[type="password"]', TEST_ACCOUNTS.student.password)
  await page.click('button[type="submit"]')
  
  // Wait for redirect to dashboard
  await page.waitForURL(/.*dashboard/, { timeout: 10000 })
}

/**
 * Login as teacher
 */
export async function loginAsTeacher(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', TEST_ACCOUNTS.teacher.email)
  await page.fill('input[type="password"]', TEST_ACCOUNTS.teacher.password)
  await page.click('button[type="submit"]')
  
  // Wait for redirect to teacher portal
  await page.waitForURL(/.*teacher/, { timeout: 10000 })
}

/**
 * Logout
 */
export async function logout(page: Page) {
  await page.click('button:has-text("Logout"), button:has-text("Keluar")')
  await page.waitForURL(/.*login/, { timeout: 5000 })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url()
  return !url.includes('/login') && !url.includes('/register')
}
