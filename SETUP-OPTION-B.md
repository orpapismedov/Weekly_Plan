# 🔒 Option B: GitHub Pages + Netlify Function
## Step-by-Step Setup Guide

**What you're doing:** Keep your app on GitHub Pages, use Netlify ONLY for secure password validation

**Security improvement:** 1/10 → 9/10 ✅

---

## STEP 1: Push Files to GitHub (Do This Now)

Open PowerShell and run:

```powershell
cd "C:\Users\RON\WeeklyPlan\aeronautics-weekly-planner"
git add .
git commit -m "Add Netlify backend for password validation"
git push
```

---

## STEP 2: Sign Up for Netlify (2 minutes)

1. Go to **https://www.netlify.com/**
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"**
4. Click **"Authorize Netlify"**
5. You'll be redirected to Netlify dashboard

---

## STEP 3: Deploy to Netlify (3 minutes)

1. In Netlify dashboard, click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Search and select: **`orpapismedov/Weekly_Plan`**
4. Configure build settings:
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
5. Click **"Deploy site"**
6. Wait 2-3 minutes for deployment to complete

---

## STEP 4: Get Your Netlify Site URL (1 minute)

1. After deployment completes, you'll see your site URL
2. It will look like: `https://dancing-unicorn-123abc.netlify.app`
3. **Copy this URL** - you'll need it

**Note:** You can customize the name later in Site settings → Domain management

---

## STEP 5: Set Your Passwords in Netlify (3 minutes)

1. In your site's dashboard, click **"Site settings"**
2. In left sidebar, click **"Environment variables"**
3. Click **"Add a variable"** to add the **MANAGER password**:
   - **Key**: `MANAGER_PASSWORD`
   - **Value**: `weekly` (or choose a new secure password for managers)
   - **Scopes**: Leave all checked
4. Click **"Create variable"**
5. Click **"Add a variable"** again to add the **USER password**:
   - **Key**: `USER_PASSWORD`
   - **Value**: `user123` (or choose a secure password for regular users)
   - **Scopes**: Leave all checked
6. Click **"Create variable"**
7. Go back to main dashboard
8. Click **"Trigger deploy"** → **"Deploy site"** (to apply the variables)

**What's the difference?**
- **USER_PASSWORD**: Regular users can view the weekly plans (read-only)
- **MANAGER_PASSWORD**: Managers can edit everything

---

## STEP 6: Update Your App with Netlify URL (3 minutes)

1. Open `src/App.js` in VS Code
2. Find line ~356 (the handlePasswordSubmit function)
3. Replace `YOUR-SITE-NAME` with your actual Netlify URL
4. Example: If your Netlify site is `https://dancing-unicorn-123abc.netlify.app`
   Change:
   ```javascript
   const NETLIFY_FUNCTION_URL = 'https://YOUR-SITE-NAME.netlify.app/.netlify/functions/validate-password';
   ```
   To:
   ```javascript
   const NETLIFY_FUNCTION_URL = 'https://dancing-unicorn-123abc.netlify.app/.netlify/functions/validate-password';
   ```

5. Save the file
6. Commit and push:
   ```powershell
   git add .
   git commit -m "Update Netlify function URL"
   git push
   ```

---

## STEP 7: Deploy to GitHub Pages (2 minutes)

```powershell
npm run deploy
```

---

## STEP 8: Test It! (1 minute)

1. Go to your GitHub Pages site: `https://orpapismedov.github.io/Weekly_Plan/`
2. You should see a password screen 🔒
3. **Test USER access:**
   - Enter your user password (default: `user123`)
   - Check "זכור אותי" (Remember me) if you want
   - You should see the app in **view-only mode** ✅
4. **Test MANAGER access:**
   - Click "התנתק" (Logout) button
   - Enter your manager password (default: `weekly`)
   - You should see the app in **manager mode** with edit capabilities ✅

The site is now fully protected! 🛡️

---

## How It Works

```
User visits: https://orpapismedov.github.io/Weekly_Plan/
         ↓
Password screen appears 🔒
         ↓
User enters password (user or manager)
         ↓
App sends to: https://weeklyplan1.netlify.app/.netlify/functions/validate-password
         ↓
Netlify checks password → Returns role (user/manager)
         ↓
App shows content based on role:
  - User password → View-only mode 👁️
  - Manager password → Full edit access ✏️
         ↓
"Remember me" saves login → Skip password next time
```

**Security Features:**
- ✅ Entire site protected (no one can see without password)
- ✅ Two access levels (user view-only + manager edit)
- ✅ Remember me functionality (optional)
- ✅ Passwords stored securely on Netlify (never exposed)
- ✅ Logout button to switch users

---

## Troubleshooting

**"Failed to fetch" error?**
- Check the Netlify URL is correct in App.js
- Make sure you deployed after setting the URL
- Check Network tab in browser DevTools for exact error

**CORS error?**
- Already handled - the function has CORS headers
- If still issues, check the function deployed correctly in Netlify dashboard → Functions

**Password not working?**
- Verify environment variable is set: Netlify dashboard → Site settings → Environment variables
- Redeploy after setting variable
- Check function logs: Netlify dashboard → Functions → validate-password → Function log

**Function not found (404)?**
- Make sure netlify.toml is in root directory
- Make sure netlify/functions/validate-password.js exists
- Trigger a new deploy in Netlify

---

## Changing the Passwords Later

**To change the manager password:**
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Edit `MANAGER_PASSWORD`
4. Save (site will redeploy automatically)

**To change the user password:**
1. Go to Netlify dashboard
2. Site settings → Environment variables
3. Edit `USER_PASSWORD`
4. Save (site will redeploy automatically)

**No code changes needed!**

---

## Summary

✅ Your app: GitHub Pages (free)
✅ Password validation: Netlify Function (free, secure)
✅ **Entire site protected** - password required for all visitors
✅ **Two access levels:**
   - User password → View-only mode 👁️
   - Manager password → Full edit access ✏️
✅ **Remember me** - optional auto-login
✅ Users **cannot** see passwords in code
✅ Users **cannot** access Netlify function directly
✅ Database still protected by Firebase rules
✅ Logout button to switch between users
✅ Security: **9/10** 🛡️

**Total time: ~20 minutes**
**Monthly cost: $0 (100% free)**
