/**
 * requireAuth
 * -----------------
 * Passport session-based authentication middleware.
 *
 * ✔ Verifies Passport session automatically
 * ✔ Works with session cookies
 * ✔ Populates `req.user` with user data
 * ✔ Automatically returns 401 if unauthenticated
 */
export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};
