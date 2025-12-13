# Git Workflow Guide - Development Best Practices

Panduan untuk Git workflow yang aman dan terstruktur.

---

## 🌳 BRANCH STRATEGY

### Branch Types

```
main (production)
  ├── hotfix/bug-fix
  └── release/v1.0.0

development (staging)
  ├── feature/new-feature
  ├── feature/another-feature
  └── bugfix/fix-issue
```

### Branch Naming Convention

```
feature/[feature-name]      # Fitur baru
bugfix/[bug-name]           # Bug fix
hotfix/[issue-name]         # Urgent fix untuk production
release/[version]           # Release branch
docs/[doc-name]             # Documentation
refactor/[component-name]   # Code refactoring
```

---

## 📝 WORKFLOW STEPS

### Step 1: Update Main Branch

```bash
# Pastikan Anda di main branch
git checkout main

# Pull latest changes
git pull origin main

# Verify
git log --oneline -5
```

### Step 2: Create Feature Branch

```bash
# Create dan checkout branch baru
git checkout -b feature/navigation-improvements

# Atau create dari development
git checkout -b feature/navigation-improvements origin/development
```

### Step 3: Make Changes

```bash
# Edit files
# ... make your changes ...

# Check status
git status

# Stage changes
git add .

# Atau stage specific files
git add src/components/Navigation.tsx
git add src/app/layout.tsx
```

### Step 4: Commit Changes

```bash
# Commit dengan message yang deskriptif
git commit -m "feat: improve navigation with dropdown menus"

# Atau dengan detail
git commit -m "feat: improve navigation with dropdown menus

- Add dropdown for Features menu
- Add dropdown for Analytics menu
- Improve mobile drawer menu
- Add smooth transitions"
```

### Step 5: Push to GitHub

```bash
# Push branch ke GitHub
git push origin feature/navigation-improvements

# Atau set upstream
git push -u origin feature/navigation-improvements
```

### Step 6: Create Pull Request

1. Buka GitHub repository
2. Klik "Pull requests"
3. Klik "New pull request"
4. Select:
   - Base: `main`
   - Compare: `feature/navigation-improvements`
5. Klik "Create pull request"
6. Isi title dan description
7. Klik "Create pull request"

### Step 7: Review & Merge

```bash
# Setelah review OK, merge di GitHub
# Atau merge via CLI:

git checkout main
git pull origin main
git merge feature/navigation-improvements
git push origin main

# Delete branch
git branch -d feature/navigation-improvements
git push origin --delete feature/navigation-improvements
```

---

## 💡 COMMIT MESSAGE BEST PRACTICES

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

```
feat:       New feature
fix:        Bug fix
docs:       Documentation
style:      Code style (formatting, missing semicolons, etc)
refactor:   Code refactoring
perf:       Performance improvement
test:       Adding tests
chore:      Build process, dependencies, etc
ci:         CI/CD configuration
```

### Examples

```bash
# Good
git commit -m "feat(navigation): add dropdown menus for features"
git commit -m "fix(auth): resolve session timeout issue"
git commit -m "docs: update setup guide"
git commit -m "refactor(components): simplify Navigation component"

# Bad
git commit -m "update"
git commit -m "fix stuff"
git commit -m "changes"
```

---

## 🔄 COMMON WORKFLOWS

### Workflow 1: Simple Feature

```bash
# 1. Create branch
git checkout -b feature/new-page

# 2. Make changes
# ... edit files ...

# 3. Commit
git add .
git commit -m "feat: add new page"

# 4. Push
git push origin feature/new-page

# 5. Create PR & merge
# ... via GitHub UI ...
```

### Workflow 2: Bug Fix

```bash
# 1. Create branch dari main
git checkout main
git pull origin main
git checkout -b bugfix/navigation-bug

# 2. Fix bug
# ... edit files ...

# 3. Test locally
npm run dev

# 4. Commit
git add .
git commit -m "fix(navigation): resolve dropdown menu issue"

# 5. Push & merge
git push origin bugfix/navigation-bug
# ... create PR & merge ...
```

### Workflow 3: Hotfix (Urgent Production Fix)

```bash
# 1. Create branch dari main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix bug
# ... edit files ...

# 3. Test thoroughly
npm run build
npm run dev

# 4. Commit
git add .
git commit -m "hotfix: resolve critical authentication issue"

# 5. Push & merge immediately
git push origin hotfix/critical-bug
# ... create PR & merge to main ...

# 6. Also merge to development
git checkout development
git pull origin development
git merge hotfix/critical-bug
git push origin development
```

### Workflow 4: Sync with Main

```bash
# Jika main sudah update dan Anda ingin sync branch
git fetch origin
git rebase origin/main

# Atau merge
git merge origin/main

# Push
git push origin feature/your-feature
```

---

## 🚨 CONFLICT RESOLUTION

### Jika Ada Merge Conflict

```bash
# 1. Pull latest
git pull origin main

# 2. Lihat conflicts
git status

# 3. Edit file yang conflict
# ... resolve conflicts manually ...

# 4. Stage resolved files
git add .

# 5. Commit
git commit -m "resolve: merge conflicts"

# 6. Push
git push origin feature/your-feature
```

### Conflict Markers

```
<<<<<<< HEAD
// Your changes
=======
// Main branch changes
>>>>>>> main
```

Pilih salah satu atau combine keduanya, lalu hapus markers.

---

## 📊 USEFUL COMMANDS

```bash
# View branches
git branch                          # Local branches
git branch -a                       # All branches
git branch -r                       # Remote branches

# View commits
git log --oneline                   # Short log
git log --oneline -10               # Last 10 commits
git log --graph --all --oneline     # Visual graph

# View changes
git diff                            # Unstaged changes
git diff --staged                   # Staged changes
git diff main..feature/your-feature # Changes vs main

# Undo changes
git restore [file]                  # Discard changes
git restore --staged [file]         # Unstage file
git reset HEAD~1                    # Undo last commit
git revert [commit]                 # Revert specific commit

# Stash changes
git stash                           # Save changes temporarily
git stash list                      # List stashes
git stash pop                       # Apply latest stash
git stash drop                      # Delete stash
```

---

## ✅ CHECKLIST SEBELUM PUSH

- [ ] Code sudah tested locally
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code follows project style
- [ ] Commit message deskriptif
- [ ] Branch name sesuai convention
- [ ] No sensitive data di-commit
- [ ] .env.local tidak di-commit

---

## 🔐 SECURITY BEST PRACTICES

### Never Commit

```
.env.local              # Environment variables
.env.production.local   # Production env
node_modules/           # Dependencies
.DS_Store               # macOS files
*.log                   # Log files
secrets/                # Secret files
```

### .gitignore

```
# Environment
.env.local
.env.*.local

# Dependencies
node_modules/
package-lock.json

# Build
.next/
out/
dist/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

---

## 📚 REFERENCES

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)

---

## 🆘 TROUBLESHOOTING

### Problem: "Your branch is ahead of origin/main"

```bash
# Push changes
git push origin feature/your-feature
```

### Problem: "Your branch is behind origin/main"

```bash
# Pull latest
git pull origin main
```

### Problem: "Detached HEAD state"

```bash
# Go back to branch
git checkout main
# atau
git checkout feature/your-feature
```

### Problem: "Cannot delete branch"

```bash
# Force delete
git branch -D feature/your-feature
```

---

**Last Updated**: December 13, 2025
**Status**: ✅ Ready for Use
