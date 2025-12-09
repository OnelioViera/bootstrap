# Deploying Custom CMS to Vercel

## 🚨 Important: OAuth Only Works When Deployed

The "Cannot GET /api/auth" error occurs because GitHub OAuth **requires a deployed URL**. It will not work on localhost or local file systems.

## ✅ Quick Deploy Guide

### Step 1: Commit Your Code

```bash
cd /Users/onelioviera/Documents/GitHub/bootstrap-V1
git add .
git commit -m "Add custom CMS"
git push origin main
```

### Step 2: Deploy to Vercel

If you already have this deployed to Vercel, it will automatically redeploy when you push to GitHub.

**To check deployment status:**
1. Go to [vercel.com](https://vercel.com)
2. Find your project (OnelioViera/bootstrap)
3. Check the latest deployment

### Step 3: Set Environment Variable

The OAuth callback requires `GITHUB_CLIENT_SECRET`:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `GITHUB_CLIENT_SECRET`
   - **Value**: [Your GitHub OAuth App Secret]
5. Click **Save**
6. **Redeploy** the project (Deployments → ⋯ → Redeploy)

### Step 4: Update GitHub OAuth App

Make sure your GitHub OAuth App is configured correctly:

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on **OAuth Apps**
3. Find your app (or create new one)
4. Update settings:
   - **Application name**: Lindsay Precast CMS
   - **Homepage URL**: `https://your-site.vercel.app`
   - **Authorization callback URL**: `https://your-site.vercel.app/api/callback`
5. Click **Update application**

### Step 5: Access Your CMS

Go to: `https://your-site.vercel.app/admin/`

Click "Sign in with GitHub" - it should work now! 🎉

---

## 🧪 Testing Locally (Alternative)

If you need to test locally, you can use a **Personal Access Token** instead of OAuth:

### Generate Token

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name: "Local CMS Testing"
4. Select scopes: ✅ **repo** (full control)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

### Use Token Locally

1. Open your local CMS: `http://localhost:5500/admin/custom-cms.html`
2. Open browser console (F12)
3. Run this command:

```javascript
localStorage.setItem('lindsay-cms-auth', JSON.stringify({token: 'ghp_YOUR_TOKEN_HERE'}))
location.reload()
```

4. The CMS should load with your content!

**⚠️ Warning**: 
- Never commit your personal token to GitHub
- Only use for local testing
- Use OAuth in production

---

## 📋 Deployment Checklist

Before using the CMS, verify:

- [ ] Code pushed to GitHub
- [ ] Deployed to Vercel
- [ ] `GITHUB_CLIENT_SECRET` environment variable set
- [ ] Project redeployed after setting variable
- [ ] GitHub OAuth App callback URL matches deployment URL
- [ ] Accessing CMS via deployed URL (not localhost)

---

## 🐛 Common Issues

### "Cannot GET /api/auth"
**Cause**: Trying to use OAuth on localhost  
**Solution**: Deploy to Vercel or use Personal Access Token for local testing

### "Authentication failed: 401"
**Cause**: `GITHUB_CLIENT_SECRET` not set  
**Solution**: Add environment variable in Vercel and redeploy

### "redirect_uri_mismatch"
**Cause**: GitHub OAuth App callback URL doesn't match  
**Solution**: Update OAuth App callback URL to match your deployed URL

### Changes not saving
**Cause**: No write permissions to repository  
**Solution**: Make sure your GitHub account has write access to OnelioViera/bootstrap

---

## 🔒 Security Notes

### OAuth (Production - Recommended)
✅ Secure authentication via GitHub  
✅ No tokens in code  
✅ Automatic token refresh  
✅ Proper permission scopes  

### Personal Access Token (Testing Only)
⚠️ Full access to your repositories  
⚠️ Doesn't expire automatically  
⚠️ Easy to accidentally commit  
⚠️ Should only be used for local development  

---

## 📞 Need Help?

If you're still having issues:

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Deployments
   - Click latest deployment → View Function Logs
   - Look for errors in `/api/auth` and `/api/callback`

2. **Verify API Files**:
   ```bash
   ls -la api/
   # Should show: auth.js, callback.js, check-deployment.js
   ```

3. **Test API Endpoint**:
   - Visit: `https://your-site.vercel.app/api/auth`
   - Should redirect to GitHub (not show an error)

4. **Check Browser Console**:
   - Open DevTools (F12)
   - Try to login
   - Check for any JavaScript errors

---

## 🚀 Your Deployed URLs

Based on your setup:

- **Live Site**: `https://bootstrap-gules-eta.vercel.app`
- **CMS**: `https://bootstrap-gules-eta.vercel.app/admin/`
- **OAuth Endpoint**: `https://bootstrap-gules-eta.vercel.app/api/auth`
- **Callback**: `https://bootstrap-gules-eta.vercel.app/api/callback`

Make sure these URLs are accessible and your GitHub OAuth App uses the callback URL.

---

**Once deployed, your custom CMS will work perfectly!** 🎉
