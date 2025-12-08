# Quality Assurance & Testing Plan
**Platform:** Kognisia UTBK 2026  
**Date:** December 8, 2025  
**Status:** Ready for Testing

---

## Test Accounts

### Student Account
- **Email:** test@kognisia.com
- **Password:** test123456
- **Purpose:** Test all student features

### Teacher Account
- **Email:** guru@kognisia.com
- **Password:** guru123456
- **Purpose:** Test teacher portal features

---

## 1. Authentication & Authorization Tests

### 1.1 Login Flow
- [ ] Login dengan email & password yang benar
- [ ] Login dengan email salah (error message muncul)
- [ ] Login dengan password salah (error message muncul)
- [ ] Login dengan email kosong
- [ ] Login dengan password kosong
- [ ] Remember me functionality
- [ ] Logout functionality

### 1.2 Registration Flow
- [ ] Register dengan data valid
- [ ] Register dengan email yang sudah ada
- [ ] Register dengan email format salah
- [ ] Register dengan password < 6 karakter
- [ ] Email verification (jika ada)

### 1.3 Password Reset
- [ ] Request password reset
- [ ] Receive reset email
- [ ] Reset password dengan link valid
- [ ] Reset password dengan link expired

### 1.4 Role-Based Access
- [ ] Student tidak bisa akses teacher portal
- [ ] Teacher redirect ke teacher portal
- [ ] Unauthorized access handling

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 2. Dashboard Tests (Student)

### 2.1 Dashboard Load
- [ ] Dashboard loads without errors
- [ ] All stats cards display correctly
- [ ] Current streak displays correctly
- [ ] Longest streak displays correctly
- [ ] Total questions displays correctly
- [ ] Overall accuracy displays correctly

### 2.2 Progress Tab
- [ ] Shows all 7 subtests (PU, PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
- [ ] Each subtest shows correct accuracy
- [ ] Each subtest shows correct question count
- [ ] Topic breakdown displays correctly
- [ ] Strongest/weakest identification works
- [ ] Progress bars render correctly

### 2.3 Daily Challenge Tab
- [ ] Shows history of completed challenges
- [ ] Displays mode (Balanced/Focus) correctly
- [ ] Shows date, questions, accuracy
- [ ] Shows direct answers, hint used, solution viewed
- [ ] Sorting works correctly
- [ ] Empty state displays when no data

### 2.4 Mini Try Out Tab
- [ ] Shows history of completed mini try outs
- [ ] Displays date, score, accuracy
- [ ] Shows per-subtest breakdown
- [ ] Shows strongest/weakest subtests
- [ ] Timing information displays correctly
- [ ] Empty state displays when no data

### 2.5 Try Out UTBK Tab
- [ ] Shows history of completed try outs
- [ ] Displays date, score, accuracy (160 questions)
- [ ] Shows per-subtest breakdown (7 subtests)
- [ ] Shows timing per subtest
- [ ] Compares actual vs recommended time
- [ ] Empty state displays when no data

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 3. Daily Challenge Tests

### 3.1 Mode Selection
- [ ] Mode selector displays correctly
- [ ] Balanced mode card shows "21 soal"
- [ ] Focus mode card shows "10 soal"
- [ ] Can select Balanced mode
- [ ] Can select Focus mode
- [ ] Mode selection is required

### 3.2 Balanced Mode (21 Questions)
- [ ] Fetches exactly 21 questions
- [ ] 3 questions from each of 7 subtests
- [ ] Questions are randomized
- [ ] Subtest labels display correctly
- [ ] Can navigate between questions
- [ ] Can answer questions
- [ ] Timer works correctly
- [ ] Can use hints
- [ ] Can view solutions
- [ ] Submit works correctly

### 3.3 Focus Mode (10 Questions)
- [ ] Subtest selector displays all 7 subtests
- [ ] Can select any subtest
- [ ] Fetches exactly 10 questions from selected subtest
- [ ] Questions are randomized
- [ ] Selected subtest name displays prominently
- [ ] Can navigate between questions
- [ ] Can answer questions
- [ ] Timer works correctly
- [ ] Can use hints
- [ ] Can view solutions
- [ ] Submit works correctly

### 3.4 Results Display
- [ ] Overall accuracy displays correctly
- [ ] Correct/incorrect count is accurate
- [ ] Balanced mode shows per-subtest breakdown
- [ ] Focus mode shows single subtest performance
- [ ] Mode indicator displays in results
- [ ] Time taken displays correctly
- [ ] Can review all questions
- [ ] Streak updates correctly

### 3.5 Streak Calculation
- [ ] Streak increments after completion
- [ ] Both modes count toward streak
- [ ] Streak resets after missing a day
- [ ] Grace period works (if implemented)
- [ ] Longest streak updates correctly

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 4. Mini Try Out Tests

### 4.1 Start Mini Try Out
- [ ] Can start mini try out from dashboard
- [ ] Fetches exactly 70 questions
- [ ] 10 questions from each of 7 subtests
- [ ] Questions are randomized
- [ ] Subtest sections are clearly marked
- [ ] Timer starts at 90 minutes

### 4.2 During Mini Try Out
- [ ] Can navigate between questions
- [ ] Can answer questions
- [ ] Timer counts down correctly
- [ ] Warning at 10 minutes remaining
- [ ] Can mark questions for review
- [ ] Progress indicator shows current position
- [ ] Subtest indicators work correctly

### 4.3 Submission
- [ ] Can submit before timer expires
- [ ] Auto-submits when timer reaches 0
- [ ] Confirmation dialog before submit
- [ ] All answers are saved

### 4.4 Results Display
- [ ] Overall score displays correctly (out of 70)
- [ ] Overall accuracy percentage is correct
- [ ] Per-subtest breakdown shows all 7 subtests
- [ ] Each subtest shows score and accuracy
- [ ] Strongest subtest highlighted
- [ ] Weakest subtest highlighted
- [ ] Time taken vs 90 minutes comparison
- [ ] Can review all questions
- [ ] Can see correct answers
- [ ] Explanations display correctly

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 5. Try Out UTBK Tests

### 5.1 Start Try Out UTBK
- [ ] Can start try out from dashboard
- [ ] Fetches exactly 160 questions
- [ ] Correct distribution: PU(30), PPU(20), PBM(20), PK(20), LIT_INDO(30), LIT_ING(20), PM(20)
- [ ] Questions ordered by subtest
- [ ] Timer starts at 195 minutes (3h 15m)

### 5.2 During Try Out UTBK
- [ ] Can navigate between questions
- [ ] Can answer questions
- [ ] Timer counts down correctly
- [ ] Current subtest displays correctly
- [ ] Recommended time per subtest shows as guidance
- [ ] Progress bar shows overall completion
- [ ] Question number shows (e.g., "Question 45 of 160")
- [ ] Can mark questions for review

### 5.3 Submission
- [ ] Can submit before timer expires
- [ ] Auto-submits when timer reaches 0
- [ ] Confirmation dialog before submit
- [ ] All 160 answers are saved

### 5.4 Results Display
- [ ] Overall score displays correctly (out of 160)
- [ ] Overall accuracy percentage is correct
- [ ] Per-subtest breakdown shows all 7 subtests
- [ ] Each subtest shows score and accuracy
- [ ] Time spent per subtest displays
- [ ] Compares actual vs recommended time
- [ ] Highlights faster/slower than recommended
- [ ] Strongest subtest highlighted
- [ ] Weakest subtest highlighted
- [ ] Can review all 160 questions
- [ ] Can see correct answers
- [ ] Explanations display correctly

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 6. Question Display & Interaction Tests

### 6.1 Question Rendering
- [ ] Question text displays correctly
- [ ] Images load correctly (if any)
- [ ] Math formulas render correctly (if any)
- [ ] Multiple choice options display clearly
- [ ] Selected answer is highlighted

### 6.2 Answer Selection
- [ ] Can select an answer
- [ ] Can change answer
- [ ] Selected answer persists when navigating
- [ ] Answer is saved immediately

### 6.3 Hint System
- [ ] Hint button displays when available
- [ ] Clicking hint shows hint text
- [ ] Hint usage is tracked
- [ ] Hint affects scoring (if applicable)

### 6.4 Solution System
- [ ] Solution button displays when available
- [ ] Clicking solution shows full solution
- [ ] Solution usage is tracked
- [ ] Solution affects scoring (if applicable)

### 6.5 Navigation
- [ ] Next button works
- [ ] Previous button works
- [ ] Question number buttons work
- [ ] Can jump to any question
- [ ] Current question is highlighted
- [ ] Answered questions are marked
- [ ] Unanswered questions are marked

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 7. Performance Tests

### 7.1 Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Question fetching < 500ms
- [ ] Answer submission < 200ms
- [ ] Results calculation < 1 second
- [ ] Navigation between questions < 100ms

### 7.2 Database Queries
- [ ] No N+1 query problems
- [ ] Indexes are used effectively
- [ ] Query times are acceptable
- [ ] Connection pooling works

### 7.3 Large Data Sets
- [ ] Dashboard with 100+ completed assessments
- [ ] History tabs with many entries
- [ ] Progress tracking with 1000+ questions answered

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 8. Data Integrity Tests

### 8.1 Progress Tracking
- [ ] All answers are saved correctly
- [ ] Progress records have correct assessment_type
- [ ] Progress records have correct subtest_code
- [ ] Timestamps are accurate
- [ ] No duplicate records

### 8.2 Scoring Accuracy
- [ ] Correct answers marked as correct
- [ ] Incorrect answers marked as incorrect
- [ ] Accuracy calculations are correct
- [ ] Score totals are accurate
- [ ] Per-subtest scores are accurate

### 8.3 Streak Tracking
- [ ] Streak increments correctly
- [ ] Streak resets correctly
- [ ] Longest streak updates correctly
- [ ] Multiple completions in one day handled correctly

### 8.4 Historical Data
- [ ] Old data displays correctly
- [ ] Backward compatibility works
- [ ] No data loss after updates
- [ ] Mixed format data aggregates correctly

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 9. Error Handling Tests

### 9.1 Network Errors
- [ ] Graceful handling of network failures
- [ ] Retry logic works
- [ ] Error messages are user-friendly
- [ ] Can recover from errors

### 9.2 Invalid Data
- [ ] Handles missing questions gracefully
- [ ] Handles invalid question IDs
- [ ] Handles corrupted data
- [ ] Validation errors display correctly

### 9.3 Edge Cases
- [ ] Empty question bank
- [ ] No progress data
- [ ] Incomplete assessments
- [ ] Timer edge cases (0, negative)

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 10. UI/UX Tests

### 10.1 Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

### 10.2 Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### 10.3 Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast is sufficient
- [ ] Focus indicators are visible
- [ ] Alt text for images

### 10.4 User Experience
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Success feedback is provided
- [ ] Navigation is intuitive
- [ ] Text is readable (Indonesian)

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 11. Security Tests

### 11.1 Authentication
- [ ] Passwords are hashed
- [ ] Session management is secure
- [ ] Token expiration works
- [ ] CSRF protection (if applicable)

### 11.2 Authorization
- [ ] Users can only access their own data
- [ ] Role-based access control works
- [ ] API endpoints are protected
- [ ] SQL injection prevention

### 11.3 Data Privacy
- [ ] Sensitive data is not exposed
- [ ] User data is isolated
- [ ] Logs don't contain sensitive info

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## 12. Integration Tests

### 12.1 End-to-End Flows
- [ ] Complete Daily Challenge (Balanced) flow
- [ ] Complete Daily Challenge (Focus) flow
- [ ] Complete Mini Try Out flow
- [ ] Complete Try Out UTBK flow
- [ ] View results and review questions
- [ ] Check dashboard updates

### 12.2 Multi-User Scenarios
- [ ] Multiple students using simultaneously
- [ ] Concurrent assessments
- [ ] Data isolation between users

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

---

## Bug Tracking Template

### Bug Report Format
```
**Bug ID:** BUG-001
**Severity:** Critical | High | Medium | Low
**Status:** Open | In Progress | Fixed | Closed
**Found By:** [Name]
**Date Found:** [Date]

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots/Videos:**
[Attach if applicable]

**Environment:**
- Browser: [Browser name and version]
- OS: [Operating system]
- Account: [Test account used]

**Fix:**
[Description of fix, if resolved]
```

---

## Test Execution Log

### Session 1: [Date]
**Tester:** [Name]  
**Duration:** [Time]  
**Tests Completed:** [X/Y]  
**Bugs Found:** [Count]  
**Notes:**
- [Note 1]
- [Note 2]

---

## Sign-Off

### QA Team
- [ ] All critical tests passed
- [ ] All high priority bugs fixed
- [ ] Documentation updated
- [ ] Ready for production

**QA Lead:** ________________  
**Date:** ________________

### Development Team
- [ ] All bugs addressed
- [ ] Code reviewed
- [ ] Tests passing
- [ ] Ready for deployment

**Dev Lead:** ________________  
**Date:** ________________

---

## Next Steps After QA

1. **Fix Critical Bugs** - Priority 1
2. **Fix High Priority Bugs** - Priority 2
3. **Address Medium/Low Bugs** - As time permits
4. **Performance Optimization** - Based on test results
5. **User Acceptance Testing** - With real users
6. **Production Deployment** - After sign-off
7. **Post-Deployment Monitoring** - First 48 hours critical

---

**Document Version:** 1.0  
**Last Updated:** December 8, 2025  
**Next Review:** After QA completion
