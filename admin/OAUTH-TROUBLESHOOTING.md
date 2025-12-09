# Custom CMS - OAuth Troubleshooting

## Error: "Cannot GET /api/auth"

This error occurs when the OAuth flow is being accessed incorrectly. Here's how to fix it:

### ✅ How the OAuth Flow Works

1. **User clicks "Sign in with GitHub"** in the CMS
2. CMS opens a **popup window** to `/api/auth`
3. `/api/auth` (Vercel serverless function) **redirects** to GitHub
4. User authorizes on GitHub
5. GitHub redirects back to `/api/callback`
6. `/api/callback` exchanges the code for a token
7. Token is sent back to the CMS popup via postMessage
8. CMS stores the token and logs in the user

### 🔧 Common Issues & Solutions

#### Issue 1: Popup Blocked
**Symptom**: Login button does nothing or shows popup warning

**Solution**: 
- Allow popups for your domain
- The CMS will show a warning and fallback to redirect after 2 seconds

#### Issue 2: GITHUB_CLIENT_SECRET Not Set
**Symptom**: Error in `/api/callback` saying secret not configured

**Solution**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `GITHUB_CLIENT_SECRET` = `[your GitHub OAuth app secret]`
3. Redeploy the project

#### Issue 3: Wrong OAuth App Configuration
**Symptom**: GitHub shows "redirect_uri_mismatch" error

**Solution**:
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Find your app: "Lindsay Precast CMS"
3. Update Authorization callback URL to: `https://your-domain.vercel.app/api/callback`
4. Click Update application

#### Issue 4: Missing Repository Permissions
**Symptom**: Can log in but can't save changes

**Solution**:
1. Make sure you have **write access** to the repository
2. Check that the OAuth app has `repo` scope
3. Re-authorize the app if needed

### 🧪 Testing the OAuth Flow

#### Test 1: Check API Endpoint
Try accessing: `https://your-domain.com/api/auth`

**Expected**: Should redirect to GitHub authorization page  
**If not**: Check Vercel deployment logs

#### Test 2: Check Callback Endpoint
After authorizing on GitHub, it should redirect to: `/api/callback?code=...`

**Expected**: Should show "Authorization successful!" and close window  
**If not**: Check `GITHUB_CLIENT_SECRET` is set

#### Test 3: Check Token in Console
After successful login, open browser console and run:
```javascript
localStorage.getItem('lindsay-cms-auth')
```

**Expected**: Should show JSON with token  
**If not**: Check browser console for errors

### 📋 Complete OAuth Setup Checklist

- [ ] GitHub OAuth App created
- [ ] Callback URL set to `https://your-domain.com/api/callback`
- [ ] `GITHUB_CLIENT_ID` matches in both `/api/auth.js` and GitHub app
- [ ] `GITHUB_CLIENT_SECRET` set in Vercel environment variables
- [ ] Project redeployed after setting environment variable
- [ ] User has write access to repository
- [ ] Popups allowed for your domain

### 🔍 Debug Mode

To see detailed OAuth information, open browser console before clicking login. You'll see:
- When popup opens
- OAuth redirect URL
- Token exchange process
- Any errors that occur

### 🆘 Still Having Issues?

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Your Project → Deployments
   - Click on latest deployment → View Function Logs
   - Look for errors in `/api/auth` or `/api/callback`

2. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Try to login and see what errors appear

3. **Test with Different Browser**:
   - Sometimes browser extensions block OAuth flows
   - Try in incognito/private mode

4. **Verify Files Exist**:
   ```bash
   # Check these files exist in your repo:
   /api/auth.js
   /api/callback.js
   /admin/custom-cms.html
   /admin/custom-cms.js
   ```

### ✅ Expected Behavior

When everything is working:
1. Click "Sign in with GitHub" → popup opens
2. Popup shows GitHub authorization page
3. Click "Authorize" on GitHub
4. Popup shows "Authorization successful!"
5. Popup closes automatically
6. CMS loads with your content

### 📝 Manual Token Testing (Development Only)

For testing, you can manually set a GitHub Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. In browser console:
```javascript
localStorage.setItem('lindsay-cms-auth', JSON.stringify({token: 'your_token_here'}))
location.reload()
```

**⚠️ Warning**: Only use this for testing. Always use OAuth in production!

---

**Need more help?** Check the Vercel deployment logs and browser console for specific error messages.
