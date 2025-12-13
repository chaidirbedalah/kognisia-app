# Troubleshooting Guide - Common Issues & Solutions

Panduan untuk mengatasi masalah umum saat setup dan development.

---

## 🔴 SETUP ISSUES

### Issue 1: "npm install" Fails

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

```bash
# Option 1: Use legacy peer deps
npm install --legacy-peer-deps

# Option 2: Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Option 3: Use npm 8+
npm install -g npm@latest
npm install
```

---

### Issue 2: "Cannot find module" Error

**Error Message:**
```
Error: Cannot find module '@/components/Navigation'
```

**Solutions:**

```bash
# 1. Check if file exists
ls -la src/components/navigation/Navigation.tsx

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Clear Next.js cache
rm -rf .next
npm run dev

# 4. Check import path (case-sensitive on Linux/Mac)
# Wrong: import { Navigation } from '@/components/Navigation'
# Right: import { Navigation } from '@/components/navigation/Navigation'
```

---

### Issue 3: Port 3000 Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**

```bash
# Option 1: Use different port
npm run dev -- -p 3001

# Option 2: Kill process using port 3000
# macOS/Linux:
lsof -i :3000
kill -9 [PID]

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 🔴 DATABASE ISSUES

### Issue 4: Database Connection Error

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**

```bash
# 1. Check .env.local
cat .env.local

# Verify:
# - NEXT_PUBLIC_SUPABASE_URL is correct
# - NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
# - SUPABASE_SERVICE_ROLE_KEY is correct

# 2. Test connection
curl https://[your-project-id].supabase.co/rest/v1/

# 3. Restart dev server
npm run dev

# 4. Check Supabase status
# Visit: https://status.supabase.com
```

---

### Issue 5: Migrations Failed

**Error Message:**
```
Error: relation "achievements" already exists
```

**Solutions:**

```bash
# Option 1: Check if table exists
# In Supabase SQL Editor:
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';

# Option 2: Drop table and re-run migration
DROP TABLE IF EXISTS achievements CASCADE;

# Then run migration again

# Option 3: Use Supabase CLI
supabase migration list
supabase migration up
```

---

### Issue 6: Foreign Key Constraint Error

**Error Message:**
```
Error: insert or update on table "user_achievements" violates foreign key constraint
```

**Solutions:**

```bash
# 1. Check if referenced table exists
SELECT * FROM achievements;

# 2. Check foreign key constraints
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'user_achievements';

# 3. Disable constraints temporarily (if needed)
ALTER TABLE user_achievements DISABLE TRIGGER ALL;

# 4. Re-enable constraints
ALTER TABLE user_achievements ENABLE TRIGGER ALL;
```

---

## 🔴 VERCEL ISSUES

### Issue 7: Vercel Deployment Failed

**Error Message:**
```
Build failed with 1 error
```

**Solutions:**

```bash
# 1. Check build logs in Vercel dashboard
# - Go to Vercel project
# - Click "Deployments"
# - Click failed deployment
# - Check "Build Logs"

# 2. Common causes:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
# - Port already in use

# 3. Test build locally
npm run build

# 4. Check for TypeScript errors
npm run type-check

# 5. Check for linting errors
npm run lint
```

---

### Issue 8: Environment Variables Not Working

**Error Message:**
```
Error: NEXT_PUBLIC_SUPABASE_URL is undefined
```

**Solutions:**

```bash
# 1. Check .env.local (local development)
cat .env.local

# 2. Check Vercel environment variables
# - Go to Vercel project
# - Settings → Environment Variables
# - Verify all variables are set

# 3. Redeploy after adding variables
# - Go to Vercel project
# - Deployments → Click latest
# - Click "Redeploy"

# 4. For local development, restart dev server
npm run dev
```

---

### Issue 9: 404 Page Not Found

**Error Message:**
```
404 - This page could not be found
```

**Solutions:**

```bash
# 1. Check if page exists
ls -la src/app/events/page.tsx

# 2. Check page export
# Page must export default component:
export default function EventsPage() {
  return <div>Events</div>
}

# 3. Check routing
# /events → src/app/events/page.tsx
# /events/[id] → src/app/events/[id]/page.tsx

# 4. Rebuild and redeploy
npm run build
npx vercel deploy --prod
```

---

## 🔴 DEVELOPMENT ISSUES

### Issue 10: TypeScript Errors

**Error Message:**
```
Type 'string' is not assignable to type 'number'
```

**Solutions:**

```bash
# 1. Check TypeScript errors
npm run type-check

# 2. Fix type issues in code
// Wrong:
const count: number = "5"

// Right:
const count: number = 5

# 3. Use type assertions if needed
const count: number = parseInt("5")

# 4. Check tsconfig.json
cat tsconfig.json
```

---

### Issue 11: Component Not Rendering

**Error Message:**
```
Warning: Failed prop type: Invalid prop `children` of type `object` supplied to `Button`
```

**Solutions:**

```bash
# 1. Check component props
// Check Button component definition
cat src/components/ui/button.tsx

# 2. Verify prop types
// Wrong:
<Button>{children}</Button>

// Right:
<Button>{children}</Button>

# 3. Check console for errors
# Open browser DevTools → Console

# 4. Add error boundary
import { ErrorBoundary } from 'react-error-boundary'

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### Issue 12: Styling Not Applied

**Error Message:**
```
Classes not applied to elements
```

**Solutions:**

```bash
# 1. Check Tailwind CSS config
cat tailwind.config.ts

# 2. Verify content paths
// Should include:
content: [
  './src/**/*.{js,ts,jsx,tsx}',
]

# 3. Rebuild Tailwind
npm run dev

# 4. Clear cache
rm -rf .next
npm run dev

# 5. Check class names
// Wrong:
className="text-lg"

// Right:
className="text-lg"

# 6. Check if class is in Tailwind
// Some classes need to be in safelist:
safelist: [
  'text-red-500',
  'text-blue-500',
]
```

---

## 🔴 GIT ISSUES

### Issue 13: Merge Conflicts

**Error Message:**
```
CONFLICT (content): Merge conflict in src/app/layout.tsx
```

**Solutions:**

```bash
# 1. View conflicts
git status

# 2. Edit conflicted files
# Look for:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> branch-name

# 3. Resolve conflicts manually
# Keep what you want, delete markers

# 4. Stage resolved files
git add .

# 5. Commit
git commit -m "resolve: merge conflicts"

# 6. Push
git push origin your-branch
```

---

### Issue 14: Accidentally Committed Sensitive Data

**Error Message:**
```
Committed .env.local with secrets
```

**Solutions:**

```bash
# 1. Remove file from git history
git rm --cached .env.local

# 2. Add to .gitignore
echo ".env.local" >> .gitignore

# 3. Commit
git add .gitignore
git commit -m "remove: .env.local from git"

# 4. Force push (if already pushed)
git push origin your-branch --force

# 5. Rotate secrets immediately!
# - Change all API keys
# - Change database passwords
# - Update environment variables
```

---

### Issue 15: Detached HEAD State

**Error Message:**
```
HEAD detached at [commit-hash]
```

**Solutions:**

```bash
# 1. Go back to branch
git checkout main

# 2. Or create new branch from current state
git checkout -b new-branch

# 3. Or discard changes
git checkout main
```

---

## 🟡 PERFORMANCE ISSUES

### Issue 16: Slow Build Time

**Solutions:**

```bash
# 1. Check build time
npm run build

# 2. Analyze bundle
npm install -g webpack-bundle-analyzer

# 3. Optimize images
# Use next/image component

# 4. Code splitting
# Use dynamic imports
import dynamic from 'next/dynamic'
const Component = dynamic(() => import('./Component'))

# 5. Remove unused dependencies
npm prune
```

---

### Issue 17: Slow Page Load

**Solutions:**

```bash
# 1. Check performance
# Open DevTools → Performance tab

# 2. Optimize database queries
# - Add indexes
# - Use pagination
# - Cache results

# 3. Optimize images
# - Use WebP format
# - Compress images
# - Use next/image

# 4. Enable caching
# - Browser caching
# - Server caching
# - CDN caching
```

---

## 📋 DIAGNOSTIC CHECKLIST

Before asking for help, check:

- [ ] Node.js version: `node --version` (should be 18+)
- [ ] npm version: `npm --version` (should be 8+)
- [ ] Git status: `git status`
- [ ] Environment variables: `cat .env.local`
- [ ] Build errors: `npm run build`
- [ ] TypeScript errors: `npm run type-check`
- [ ] Linting errors: `npm run lint`
- [ ] Console errors: Check browser DevTools
- [ ] Network errors: Check browser Network tab
- [ ] Database connection: Test in Supabase dashboard

---

## 🆘 GETTING HELP

If issue persists:

1. **Check documentation**
   - Next.js: https://nextjs.org/docs
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs

2. **Search GitHub Issues**
   - https://github.com/coachchaidir/kognisia-app/issues

3. **Check Stack Overflow**
   - Tag: next.js, supabase, vercel

4. **Ask in community**
   - Next.js Discord
   - Supabase Discord
   - Stack Overflow

---

**Last Updated**: December 13, 2025
**Status**: ✅ Ready for Use
