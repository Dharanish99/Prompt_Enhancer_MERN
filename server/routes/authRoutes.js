import express from "express";
import passport from "passport";

const router = express.Router();

const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:3000";

/* ---------- GOOGLE OAUTH ---------- */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${FRONTEND_URL}/login`);
      }
      res.redirect(FRONTEND_URL);
    });
  }
);

/* ---------- GITHUB OAUTH ---------- */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: `${FRONTEND_URL}/login` }),
  (req, res) => {
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.redirect(`${FRONTEND_URL}/login`);
      }
      res.redirect(FRONTEND_URL);
    });
  }
);

/* ---------- SESSION CHECK ---------- */
router.get("/me", (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.json(req.user);
});

/* ---------- LOGOUT ---------- */
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Session destroy failed" });
      }
      res.clearCookie("promptstudio.sid");
      res.json({ success: true });
    });
  });
});

export default router;
