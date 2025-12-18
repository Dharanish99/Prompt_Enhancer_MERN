import session from "express-session";
import MongoStore from "connect-mongo";

export const sessionMiddleware = session({
  name: "promptstudio.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
});
