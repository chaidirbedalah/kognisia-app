# Test Commands Quick Reference

## 🧪 Unit Tests (Vitest)

```bash
# Run all tests once
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# UI mode (visual test runner)
npm run test:ui

# Run specific test file
npx vitest run tests/properties/balanced-mode-distribution.test.ts

# Run tests matching pattern
npx vitest run -t "balanced mode"

# Coverage report
npx vitest run --coverage
```

---

## 🎭 E2E Tests (Playwright)

```bash
# Run all E2E tests (headless)
npm run test:e2e

# UI mode - RECOMMENDED for development
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View HTML report
npm run test:e2e:report

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test by name
npx playwright test -g "should login"

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# List all tests
npx playwright test --list

# Update snapshots
npx playwright test --update-snapshots
```

---

## 🔧 Setup Commands

```bash
# Install dependencies
npm install

# Install Playwright browsers (one-time)
npx playwright install

# Install specific browser
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Install with system dependencies
npx playwright install --with-deps
```

---

## 📊 Reporting

```bash
# Unit test UI
npm run test:ui

# E2E test report
npm run test:e2e:report

# Show trace file
npx playwright show-trace trace.zip

# Generate coverage
npx vitest run --coverage
```

---

## 🐛 Debugging

```bash
# Debug unit tests
npx vitest --inspect-brk

# Debug E2E tests
npm run test:e2e:debug

# Run with console output
npx playwright test --headed --debug

# Slow motion (see what's happening)
PWDEBUG=console npx playwright test
```

---

## 🚀 Quick Workflows

### Development Workflow
```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Watch unit tests
npm run test:watch

# Terminal 3: E2E tests when needed
npm run test:e2e:ui
```

### Pre-Commit Workflow
```bash
# Run all unit tests
npm test

# Run E2E smoke tests
npx playwright test auth.spec.ts dashboard.spec.ts

# Check for errors
echo "All tests passed! ✅"
```

### Pre-Deployment Workflow
```bash
# 1. Run all unit tests
npm test

# 2. Run all E2E tests
npm run test:e2e

# 3. View reports
npm run test:e2e:report

# 4. Check coverage
npx vitest run --coverage
```

---

## 📝 Common Patterns

### Run Tests for Specific Feature
```bash
# Daily Challenge tests
npx vitest run -t "daily challenge"
npx playwright test daily-challenge.spec.ts

# Dashboard tests
npx vitest run -t "dashboard"
npx playwright test dashboard.spec.ts

# Authentication tests
npx vitest run -t "auth"
npx playwright test auth.spec.ts
```

### Run Failed Tests Only
```bash
# Vitest
npx vitest run --reporter=verbose --bail

# Playwright
npx playwright test --last-failed
```

### Run Tests in Parallel
```bash
# Vitest (default)
npm test

# Playwright (specify workers)
npx playwright test --workers=4
```

---

## 🎯 Useful Flags

### Vitest Flags
```bash
--run              # Run once (no watch)
--watch            # Watch mode
--ui               # UI mode
--coverage         # Generate coverage
--reporter=verbose # Detailed output
--bail             # Stop on first failure
-t "pattern"       # Run tests matching pattern
```

### Playwright Flags
```bash
--headed           # Show browser
--debug            # Debug mode
--ui               # UI mode
--project=chrome   # Specific browser
--grep "pattern"   # Run tests matching pattern
--list             # List all tests
--update-snapshots # Update snapshots
--trace on         # Enable tracing
```

---

## 💡 Pro Tips

### 1. Fast Feedback Loop
```bash
# Watch specific test file
npx vitest watch tests/properties/balanced-mode-distribution.test.ts
```

### 2. Debug Failing Test
```bash
# Add console.log in test
# Then run with verbose output
npx vitest run --reporter=verbose
```

### 3. Test Specific Scenario
```bash
# Use .only() in test file
test.only('specific test', () => { ... })

# Then run
npm test
```

### 4. Skip Slow Tests
```bash
# Use .skip() in test file
test.skip('slow test', () => { ... })
```

### 5. Parallel Execution
```bash
# Vitest (automatic)
npm test

# Playwright (control workers)
npx playwright test --workers=2
```

---

## 🔍 Troubleshooting Commands

### Clear Cache
```bash
# Vitest
rm -rf node_modules/.vite

# Playwright
npx playwright clean
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Update Browsers
```bash
npx playwright install --force
```

### Check Test Status
```bash
# List all tests
npx playwright test --list

# Show test tree
npx vitest --reporter=verbose --run
```

---

## 📦 Package Scripts Reference

```json
{
  "test": "vitest --run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report"
}
```

---

## 🎬 Example Workflows

### Morning Routine
```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Start development
npm run dev
npm run test:watch  # in another terminal
```

### Before Push
```bash
# 1. Run all tests
npm test

# 2. Run E2E smoke tests
npx playwright test auth.spec.ts

# 3. Check for errors
git status

# 4. Commit and push
git add .
git commit -m "feat: add feature"
git push
```

### Before Deployment
```bash
# 1. Run full test suite
npm test
npm run test:e2e

# 2. Check reports
npm run test:e2e:report

# 3. Verify no errors
echo "Ready to deploy! 🚀"
```

---

**Quick Access:**
- Unit Tests: `npm test`
- E2E Tests: `npm run test:e2e:ui`
- Watch Mode: `npm run test:watch`
- Reports: `npm run test:e2e:report`
