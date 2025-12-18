# 🚀 Deployment Checklist - Post Clerk Cleanup

## Pre-Deployment Verification

### ✅ Code Quality
- [x] All Clerk imports removed
- [x] All components use AuthContext
- [x] All API calls use withCredentials
- [x] All controllers check req.user
- [x] All routes use requireAuth middleware
- [x] No console errors in development
- [x] No TypeScript/ESLint errors

### ✅ Authentication Flow
- [x] Google OAuth working locally
- [x] GitHub OAuth working locally
- [x] Session persistence working
- [x] Logout functionality working
- [x] Protected routes return 401 when not authenticated
- [x] Protected routes work when authenticated

### ✅ Feature Testing
- [x] Image prompt enhancement works
- [x] Text prompt architect works
- [x] Template gallery loads
- [x] Template remix works
- [x] History sidebar works
- [x] All protected features require login

---

## Environment Variables

### Backend (.env)
```bash
# Required
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
SESSION_SECRET=your-super-secret-key-here

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# URLs
CLIENT_URL=https://your-frontend-domain.com
SERVER_URL=https://your-backend-domain.com

# API Keys
GROQ_API_KEY_VISUALS=your-groq-key
GROQ_API_KEY_REMIX=your-groq-key
GROQ_API_KEY_TEXT_AUDIT=your-groq-key
GROQ_API_KEY_TEXT_ENHANCE=your-groq-key
GROQ_API_KEY_TEXT_SIMULATE=your-groq-key
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-domain.com
```

---

## OAuth Provider Configuration

### Google Cloud Console
1. Go to: https://console.cloud.google.com/
2. Navigate to: APIs & Services → Credentials
3. Update OAuth 2.0 Client:
   - **Authorized JavaScript origins:**
     - `https://your-frontend-domain.com`
   - **Authorized redirect URIs:**
     - `https://your-backend-domain.com/auth/google/callback`

### GitHub OAuth Apps
1. Go to: https://github.com/settings/developers
2. Update OAuth App:
   - **Homepage URL:** `https://your-frontend-domain.com`
   - **Authorization callback URL:** `https://your-backend-domain.com/auth/github/callback`

---

## Backend Deployment

### Platform: Render / Railway / Heroku

#### 1. Build Command
```bash
npm install
```

#### 2. Start Command
```bash
npm start
```

#### 3. Environment Variables
- Set all variables from Backend .env section above
- Ensure `NODE_ENV=production`
- Ensure `SESSION_SECRET` is strong and unique

#### 4. Health Check
```bash
curl https://your-backend-domain.com/auth/me
# Should return 401 (expected when not logged in)
```

---

## Frontend Deployment

### Platform: Netlify / Vercel

#### 1. Build Command
```bash
npm run build
```

#### 2. Publish Directory
```bash
build
```

#### 3. Environment Variables
- Set `REACT_APP_API_URL` to your backend URL

#### 4. Redirects (Netlify)
Create `public/_redirects`:
```
/*    /index.html   200
```

#### 5. Headers (Netlify)
Create `public/_headers`:
```
/*
  Access-Control-Allow-Origin: https://your-backend-domain.com
  Access-Control-Allow-Credentials: true
```

---

## Database Setup

### MongoDB Atlas

#### 1. Network Access
- Add IP addresses of your backend server
- Or allow access from anywhere (0.0.0.0/0) if using dynamic IPs

#### 2. Database User
- Ensure user has read/write permissions
- Use strong password

#### 3. Connection String
- Use in `MONGO_URI` environment variable
- Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

#### 4. Indexes
```javascript
// Sessions collection (auto-created by connect-mongo)
db.sessions.createIndex({ "expires": 1 }, { expireAfterSeconds: 0 })

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "googleId": 1 }, { sparse: true })
db.users.createIndex({ "githubId": 1 }, { sparse: true })
```

---

## Security Checklist

### Backend
- [x] `NODE_ENV=production`
- [x] `SESSION_SECRET` is strong (32+ characters)
- [x] CORS configured with specific origin (not *)
- [x] `credentials: true` in CORS
- [x] Cookie settings: `httpOnly: true, secure: true, sameSite: "none"`
- [x] Helmet middleware enabled
- [x] Rate limiting on auth endpoints (optional but recommended)

### Frontend
- [x] No sensitive data in localStorage
- [x] No API keys in frontend code
- [x] All API calls use `withCredentials: true`
- [x] HTTPS enabled

### Database
- [x] Strong database password
- [x] Network access restricted
- [x] Backup enabled
- [x] Monitoring enabled

---

## Post-Deployment Testing

### 1. OAuth Flow
```bash
# Test Google Login
1. Visit https://your-frontend-domain.com
2. Click "Login with Google"
3. Authorize application
4. Verify redirect to homepage
5. Check cookie in DevTools: promptstudio.sid

# Test GitHub Login
1. Visit https://your-frontend-domain.com
2. Click "Login with GitHub"
3. Authorize application
4. Verify redirect to homepage
5. Check cookie in DevTools: promptstudio.sid
```

### 2. Session Persistence
```bash
1. Login successfully
2. Refresh page
3. Verify still logged in
4. Close browser
5. Reopen browser
6. Visit site
7. Verify still logged in (within 7 days)
```

### 3. Protected Endpoints
```bash
# Test without login
curl https://your-backend-domain.com/api/history
# Expected: 401 Unauthorized

# Test with login (in browser console after login)
fetch('https://your-backend-domain.com/api/history', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
# Expected: 200 OK with data
```

### 4. Template Remix
```bash
1. Login
2. Navigate to Templates
3. Select a template
4. Click "Remix"
5. Enter custom instruction
6. Click "Execute Remix"
7. Verify remix completes successfully
8. Check Network tab: withCredentials should be true
```

### 5. Logout
```bash
1. Click logout button
2. Verify redirect to login page
3. Check cookie is cleared
4. Try accessing protected route
5. Verify 401 error
```

---

## Monitoring

### Backend Logs
Monitor for:
- Session creation/destruction
- OAuth callback errors
- 401 errors (potential auth issues)
- Database connection errors

### Frontend Errors
Monitor for:
- Network errors
- 401 responses
- Cookie issues
- CORS errors

### Database
Monitor:
- Session collection size
- User collection growth
- Query performance
- Connection pool usage

---

## Rollback Plan

### If Issues Occur

#### 1. Backend Issues
```bash
# Revert to previous deployment
# Check logs for errors
# Verify environment variables
# Test OAuth callbacks
```

#### 2. Frontend Issues
```bash
# Revert to previous deployment
# Check REACT_APP_API_URL
# Verify CORS settings
# Test in incognito mode
```

#### 3. Database Issues
```bash
# Check connection string
# Verify network access
# Check user permissions
# Restore from backup if needed
```

---

## Performance Optimization

### Backend
- [ ] Enable compression middleware
- [ ] Add Redis for session store (optional, for scale)
- [ ] Implement rate limiting
- [ ] Add caching for templates
- [ ] Monitor response times

### Frontend
- [ ] Enable code splitting
- [ ] Optimize images
- [ ] Add service worker (PWA)
- [ ] Implement lazy loading
- [ ] Monitor bundle size

### Database
- [ ] Add indexes for frequent queries
- [ ] Monitor slow queries
- [ ] Set up read replicas (if needed)
- [ ] Implement connection pooling

---

## Success Criteria

### ✅ Deployment Successful When:
- [ ] Users can login with Google
- [ ] Users can login with GitHub
- [ ] Sessions persist across page refreshes
- [ ] Protected routes require authentication
- [ ] Template remix works end-to-end
- [ ] All features work as in development
- [ ] No console errors
- [ ] No 500 errors in logs
- [ ] Response times < 2 seconds
- [ ] Zero Clerk references in code

---

## Support Contacts

### Issues to Watch For
1. **CORS Errors**
   - Check `CLIENT_URL` matches frontend domain
   - Verify `credentials: true` in CORS config

2. **Session Not Persisting**
   - Check cookie settings
   - Verify MongoDB connection
   - Check `SESSION_SECRET` is set

3. **OAuth Redirect Fails**
   - Verify callback URLs in OAuth providers
   - Check `SERVER_URL` environment variable
   - Ensure HTTPS is enabled

4. **401 Errors**
   - Verify `withCredentials: true` in axios
   - Check session cookie exists
   - Verify `requireAuth` middleware

---

## Final Checklist

- [ ] All environment variables set
- [ ] OAuth providers configured
- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] Database accessible from backend
- [ ] Google login tested
- [ ] GitHub login tested
- [ ] Session persistence tested
- [ ] Protected routes tested
- [ ] Template remix tested
- [ ] Logout tested
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] Monitoring enabled
- [ ] Team notified

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Status:** ⬜ Ready | ⬜ In Progress | ⬜ Complete
**Issues:** _____________

---

## 🎉 Post-Deployment

Once all checks pass:
1. ✅ Mark deployment as complete
2. ✅ Update team
3. ✅ Monitor for 24 hours
4. ✅ Celebrate! 🎊

**Status:** READY FOR DEPLOYMENT ✅
