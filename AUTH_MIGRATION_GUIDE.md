# 🔐 Authentication Migration Guide
## From Clerk → Passport Sessions

---

## 🎯 Quick Reference

### Before (Clerk) ❌
```javascript
// Frontend
import { useAuth } from "@clerk/clerk-react";
const { getToken } = useAuth();
const token = await getToken();

axios.post('/api/endpoint', data, {
  headers: { Authorization: `Bearer ${token}` }
});

// Backend
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
app.use(ClerkExpressWithAuth());
const userId = req.auth.userId;
```

### After (Passport) ✅
```javascript
// Frontend
import { useAuth } from "../context/AuthContext";
const { user } = useAuth();

axios.post('/api/endpoint', data, {
  withCredentials: true
});

// Backend
import { requireAuth } from './middleware/requireAuth.js';
router.post('/endpoint', requireAuth, controller);
const userId = req.user._id;
```

---

## 📋 Migration Checklist

### Frontend Components
- [ ] Replace `@clerk/clerk-react` with `../context/AuthContext`
- [ ] Change `getToken()` to `user` check
- [ ] Remove `Authorization` headers
- [ ] Add `withCredentials: true` to all API calls
- [ ] Update user validation: `if (!user) return`

### Backend Routes
- [ ] Remove Clerk middleware
- [ ] Add `requireAuth` middleware
- [ ] Replace `req.auth.userId` with `req.user._id`
- [ ] Add `req.isAuthenticated()` checks
- [ ] Ensure CORS allows credentials

---

## 🔧 Common Patterns

### Pattern 1: Protected Component
```javascript
import { useAuth } from '../context/AuthContext';

const ProtectedComponent = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome {user.email}</div>;
};
```

### Pattern 2: API Call with Auth
```javascript
const handleAction = async () => {
  try {
    const res = await axios.post('/api/action', {
      data: 'value'
    }, {
      withCredentials: true  // ← CRITICAL
    });
    console.log(res.data);
  } catch (err) {
    if (err.response?.status === 401) {
      // Handle unauthorized
    }
  }
};
```

### Pattern 3: Protected Route
```javascript
// routes/myRoutes.js
import { requireAuth } from '../middleware/requireAuth.js';

router.post('/protected', requireAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const userId = req.user._id;
  // Your logic here
});
```

---

## 🚨 Common Mistakes

### ❌ Mistake 1: Forgetting withCredentials
```javascript
// WRONG
axios.post('/api/endpoint', data);

// CORRECT
axios.post('/api/endpoint', data, { withCredentials: true });
```

### ❌ Mistake 2: Using old auth pattern
```javascript
// WRONG
const token = await getToken();
headers: { Authorization: `Bearer ${token}` }

// CORRECT
const { user } = useAuth();
if (!user) return;
withCredentials: true
```

### ❌ Mistake 3: Not checking req.user
```javascript
// WRONG
export const controller = async (req, res) => {
  const userId = req.auth.userId; // Clerk pattern
};

// CORRECT
export const controller = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = req.user._id;
};
```

---

## 🔍 Debugging Tips

### Check Session Cookie
```javascript
// Browser DevTools → Application → Cookies
// Look for: promptstudio.sid
```

### Verify CORS
```javascript
// server/index.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,  // ← Must be true
}));
```

### Test Authentication
```javascript
// In browser console
fetch('http://localhost:5000/auth/me', {
  credentials: 'include'
})
.then(r => r.json())
.then(console.log);
```

---

## 📚 Key Files Reference

### Frontend
- `client/src/context/AuthContext.js` - Auth provider
- `client/src/components/LoginPage.js` - OAuth buttons
- `client/src/App.js` - Auth wrapper

### Backend
- `server/config/passport.js` - Passport strategies
- `server/middleware/requireAuth.js` - Auth guard
- `server/routes/authRoutes.js` - OAuth routes
- `server/index.js` - Session config

---

## 🎓 Learning Resources

### Passport.js
- [Passport Documentation](http://www.passportjs.org/docs/)
- [Google OAuth Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
- [GitHub OAuth Strategy](http://www.passportjs.org/packages/passport-github2/)

### Express Sessions
- [express-session](https://github.com/expressjs/session)
- [connect-mongo](https://github.com/jdesboeufs/connect-mongo)

---

## ✅ Verification Steps

1. **Login Test**
   ```bash
   # Start backend
   cd server && npm start
   
   # Start frontend
   cd client && npm start
   
   # Test OAuth flow
   # Click "Login with Google" or "Login with GitHub"
   ```

2. **Session Test**
   ```javascript
   // After login, check in browser console:
   document.cookie // Should show promptstudio.sid
   ```

3. **API Test**
   ```javascript
   // Test protected endpoint
   axios.get('/api/history', { withCredentials: true })
     .then(console.log)
     .catch(console.error);
   ```

---

## 🆘 Need Help?

### Issue: 401 Unauthorized
- Check `withCredentials: true` in axios
- Verify session cookie exists
- Check CORS configuration

### Issue: Session not persisting
- Verify MongoDB connection
- Check session store configuration
- Ensure cookie settings are correct

### Issue: OAuth redirect fails
- Check `CLIENT_URL` in `.env`
- Verify OAuth credentials
- Check callback URLs in OAuth provider

---

**Last Updated:** 2024
**Status:** Production Ready ✅
