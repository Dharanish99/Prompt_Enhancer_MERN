import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import GitHubStrategy from "passport-github2";
import User from "../models/User.js";

export const initPassport = () => {
  passport.serializeUser((user, done) => {
    console.log('✅ Serializing user:', user._id);
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      console.log('✅ Deserializing user:', user ? user._id : 'not found');
      done(null, user);
    } catch (err) {
      console.error('❌ Deserialization error:', err);
      done(err);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (_, __, profile, done) => {
        try {
          console.log('✅ Google OAuth profile:', profile.id, profile.emails?.[0]?.value);
          const email = profile.emails?.[0]?.value;

          let user = await User.findOne({
            $or: [
              { "providers.googleId": profile.id },
              ...(email ? [{ email }] : [])
            ],
          });

          if (!user) {
            console.log('✅ Creating new Google user');
            user = await User.create({
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              providers: { googleId: profile.id },
            });
          } else if (!user.providers.googleId) {
            console.log('✅ Linking Google to existing user');
            user.providers.googleId = profile.id;
            await user.save();
          }

          console.log('✅ Google OAuth user ready:', user._id);
          return done(null, user);
        } catch (err) {
          console.error('❌ Google OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback",
      },
      async (_, __, profile, done) => {
        try {
          console.log('✅ GitHub OAuth profile:', profile.id, profile.emails?.[0]?.value);
          const email = profile.emails?.[0]?.value;
          
          let user = await User.findOne({
            $or: [
              { "providers.githubId": profile.id },
              ...(email ? [{ email }] : [])
            ],
          });

          if (!user) {
            console.log('✅ Creating new GitHub user');
            user = await User.create({
              email,
              name: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value,
              providers: { githubId: profile.id },
            });
          } else if (!user.providers.githubId) {
            console.log('✅ Linking GitHub to existing user');
            user.providers.githubId = profile.id;
            await user.save();
          }

          console.log('✅ GitHub OAuth user ready:', user._id);
          return done(null, user);
        } catch (err) {
          console.error('❌ GitHub OAuth error:', err);
          return done(err, null);
        }
      }
    )
  );
};
