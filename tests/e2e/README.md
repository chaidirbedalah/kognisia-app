# E2E Testing with Playwright

Automated end-to-end tests untuk Kognisia platform menggunakan Playwright.

## Setup

### Install Dependencies
```bash
npm install
```

### Install Playwright Browsers
```bash
npx playwright install
```

## Running Tests

### Run All Tests (Headless)
```bash
npm run test:e2e
```

### Run Tests with UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Tests
```bash
npm run test:e2e:debug
```

### View Test Report
```bash
npm run test:e2e:report
```

### Run Specific Test File
```bash
npx playwright test auth.spec.ts
```

### Run Tests in Specific Browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

```
tests/e2e/
├── auth.spec.ts              # Authentication tests
├── dashboard.spec.ts         # Dashboard tests
├── daily-challenge.spec.ts   # Daily Challenge tests
├── helpers/
│   └── auth.ts              # Authentication helpers
└── README.md                # This file
```

## Test Coverage

### ✅ Authentication (auth.spec.ts)
- Login with valid credentials
- Login with invalid credentials
- Logout functionality
- Role-based redirects (student/teacher)
- Form validation

### ✅ Dashboard (dashboard.spec.ts)
- Dashboard loads without errors
- All stat cards display
- Tabs are accessible
- Progress by subtest
- History displays
- Performance benchmarks

### ✅ Daily Challenge (daily-challenge.spec.ts)
- Mode selection (Balanced/Focus)
- Balanced mode: 21 questions
- Focus mode: 10 questions from selected subtest
- Question navigation
- Answer selection
- Timer display
- Submission flow

### 🟡 Mini Try Out (TODO)
- Start mini try out
- 70 questions (10 per subtest)
- 90-minute timer
- Results display

### 🟡 Try Out UTBK (TODO)
- Start try out
- 160 questions (correct distribution)
- 195-minute timer
- Results display

## Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test'
import { loginAsStudent } from './helpers/auth'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page)
  })

  test('should do something', async ({ page }) => {
    // Your test code
    await page.click('button')
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### Using Helpers
```typescript
import { loginAsStudent, logout } from './helpers/auth'

test('my test', async ({ page }) => {
  await loginAsStudent(page)
  // ... test code ...
  await logout(page)
})
```

## Best Practices

### 1. Use Data Test IDs
```typescript
// Good
await page.click('[data-testid="submit-button"]')

// Okay
await page.click('button:has-text("Submit")')
```

### 2. Wait for Elements
```typescript
// Wait for element to be visible
await expect(page.locator('text=Success')).toBeVisible()

// Wait for navigation
await page.waitForURL(/.*dashboard/)

// Wait for network idle
await page.waitForLoadState('networkidle')
```

### 3. Handle Timeouts
```typescript
// Increase timeout for slow operations
await expect(page.locator('text=Loading')).toBeVisible({ timeout: 10000 })
```

### 4. Clean Up After Tests
```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data if needed
  await page.close()
})
```

### 5. Use Fixtures for Common Setup
```typescript
test.beforeEach(async ({ page }) => {
  // Common setup for all tests
  await loginAsStudent(page)
})
```

## Debugging Tests

### 1. Use UI Mode
```bash
npm run test:e2e:ui
```
- See tests running in real-time
- Time travel through test steps
- Inspect DOM at any point

### 2. Use Debug Mode
```bash
npm run test:e2e:debug
```
- Opens Playwright Inspector
- Step through tests line by line
- Inspect page state

### 3. Add Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' })
```

### 4. Add Console Logs
```typescript
console.log('Current URL:', page.url())
console.log('Element text:', await element.textContent())
```

### 5. Use Trace Viewer
```bash
npx playwright show-trace trace.zip
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Failing Locally
1. Make sure dev server is running: `npm run dev`
2. Check if test accounts exist in database
3. Clear browser cache: `npx playwright clean`
4. Update browsers: `npx playwright install`

### Timeout Errors
- Increase timeout in `playwright.config.ts`
- Check if elements are actually visible
- Wait for network requests to complete

### Flaky Tests
- Add explicit waits
- Use `waitForLoadState('networkidle')`
- Avoid hard-coded timeouts
- Use retry logic in CI

## Test Accounts

### Student Account
- Email: test@kognisia.com
- Password: test123456

### Teacher Account
- Email: guru@kognisia.com
- Password: guru123456

**Note:** Make sure these accounts exist in your database!

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Debugging Guide](https://playwright.dev/docs/debug)

## Contributing

When adding new tests:
1. Follow existing test structure
2. Use descriptive test names
3. Add comments for complex logic
4. Update this README if needed
5. Ensure tests pass before committing

---

**Happy Testing! 🎭**
