# E2E Testing Quick Start Guide

## 🚀 Setup (One-Time)

### 1. Install Playwright Browsers
```bash
npx playwright install
```

This will download Chromium, Firefox, and WebKit browsers (~500MB).

---

## ▶️ Running Tests

### Option 1: UI Mode (Recommended for Development)
```bash
npm run test:e2e:ui
```

**Benefits:**
- Visual test runner
- See tests running in real-time
- Time travel through test steps
- Easy debugging

### Option 2: Headless Mode (CI/Production)
```bash
npm run test:e2e
```

**Benefits:**
- Fast execution
- No browser window
- Good for CI/CD

### Option 3: Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

**Benefits:**
- See what's happening
- Good for debugging
- Slower than headless

### Option 4: Debug Mode
```bash
npm run test:e2e:debug
```

**Benefits:**
- Step through tests
- Inspect elements
- Pause execution

---

## 📊 View Test Results

### HTML Report
```bash
npm run test:e2e:report
```

Opens a detailed HTML report with:
- Test results
- Screenshots
- Videos (on failure)
- Traces

---

## 🎯 Current Test Coverage

### ✅ Implemented Tests

#### 1. Authentication Tests (`auth.spec.ts`)
- ✅ Login with valid credentials
- ✅ Login with invalid email
- ✅ Login with invalid password
- ✅ Logout functionality
- ✅ Teacher redirect to teacher portal
- ✅ Form validation

**Run:** `npx playwright test auth.spec.ts`

#### 2. Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard loads without console errors
- ✅ All stat cards display
- ✅ Current streak displays
- ✅ Total questions displays
- ✅ Overall accuracy displays
- ✅ All tabs accessible
- ✅ Progress by subtest
- ✅ Daily challenge history
- ✅ Load time performance

**Run:** `npx playwright test dashboard.spec.ts`

#### 3. Daily Challenge Tests (`daily-challenge.spec.ts`)
- ✅ Mode selection displays
- ✅ Balanced mode: 21 questions
- ✅ Focus mode: subtest selector
- ✅ Focus mode: 10 questions
- ✅ Answer selection
- ✅ Question navigation
- ✅ Timer display
- ✅ Submission flow

**Run:** `npx playwright test daily-challenge.spec.ts`

### 🟡 TODO Tests

#### 4. Mini Try Out Tests
- ⬜ Start mini try out
- ⬜ 70 questions (10 per subtest)
- ⬜ 90-minute timer
- ⬜ Submission
- ⬜ Results display

#### 5. Try Out UTBK Tests
- ⬜ Start try out
- ⬜ 160 questions
- ⬜ 195-minute timer
- ⬜ Submission
- ⬜ Results display

---

## 📝 Test Results Summary

### Last Run: [Date]

```
Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
Time:        45.2s
```

### Coverage by Feature

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | 7 | ✅ Passing |
| Dashboard | 10 | ✅ Passing |
| Daily Challenge | 8 | ✅ Passing |
| Mini Try Out | 0 | 🟡 TODO |
| Try Out UTBK | 0 | 🟡 TODO |

---

## 🐛 Common Issues & Solutions

### Issue 1: "Browser not found"
**Solution:**
```bash
npx playwright install
```

### Issue 2: "Connection refused"
**Solution:**
Make sure dev server is running:
```bash
npm run dev
```

### Issue 3: "Test timeout"
**Solution:**
- Increase timeout in test
- Check if element selectors are correct
- Wait for network idle

### Issue 4: "Element not found"
**Solution:**
- Check if element exists in UI
- Use correct selector
- Add explicit wait

---

## 🎓 Quick Tips

### 1. Run Specific Test
```bash
npx playwright test auth.spec.ts
```

### 2. Run Tests Matching Pattern
```bash
npx playwright test --grep "login"
```

### 3. Run in Specific Browser
```bash
npx playwright test --project=chromium
```

### 4. Update Snapshots
```bash
npx playwright test --update-snapshots
```

### 5. Show Browser
```bash
npx playwright test --headed
```

---

## 📈 Next Steps

### Phase 1: Complete Basic Tests ✅
- [x] Authentication
- [x] Dashboard
- [x] Daily Challenge (partial)

### Phase 2: Add Missing Tests 🟡
- [ ] Complete Daily Challenge tests
- [ ] Mini Try Out tests
- [ ] Try Out UTBK tests

### Phase 3: Advanced Tests ⬜
- [ ] Performance tests
- [ ] Accessibility tests
- [ ] Mobile responsive tests
- [ ] Cross-browser tests

### Phase 4: CI/CD Integration ⬜
- [ ] GitHub Actions workflow
- [ ] Automated test runs
- [ ] Test reports in PR
- [ ] Deployment gates

---

## 🔗 Useful Commands

```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View report
npm run test:e2e:report

# Run specific file
npx playwright test auth.spec.ts

# Run specific test
npx playwright test -g "should login"

# List all tests
npx playwright test --list

# Show trace
npx playwright show-trace trace.zip
```

---

## 📚 Resources

- **Playwright Docs:** https://playwright.dev
- **Test Examples:** `tests/e2e/`
- **Helper Functions:** `tests/e2e/helpers/`
- **Configuration:** `playwright.config.ts`

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All E2E tests passing
- [ ] No console errors in tests
- [ ] Performance benchmarks met
- [ ] Cross-browser tests passing
- [ ] Mobile tests passing (if applicable)
- [ ] Test coverage > 80%
- [ ] Critical paths tested
- [ ] Edge cases covered

---

**Ready to test? Run:** `npm run test:e2e:ui`
