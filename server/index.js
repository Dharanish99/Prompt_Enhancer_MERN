import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import helmet from "helmet";
import connectDB from "./config/db.js";
import { initPassport } from "./config/passport.js";

import authRoutes from "./routes/authRoutes.js";
import promptRoutes from "./routes/promptRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import textRoutes from "./routes/textRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// --- SECURITY HEADERS ---
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // Disable if causing issues with images
}));

// --- TRUST PROXY (Crucial for Render/Heroku) ---
// Required for secure cookies to work behind a reverse proxy/load balancer
if (isProduction) {
  app.set("trust proxy", 1);
}

// --- DYNAMIC CORS SETUP ---
// Allows Localhost (Dev) + Production Domain simultaneously
const allowedOrigins = [
  "http://localhost:5173", // Vite Dev Server
  "http://localhost:3000", // Fallback Dev
  process.env.CLIENT_URL   // Production URL (e.g., https://prompt-studio-frontend.onrender.com)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Optional: You can log the blocked origin for debugging
      console.log('Blocked Origin:', origin);
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// --- SESSION MANAGEMENT ---
app.use(
  session({
    name: "promptstudio.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Don't create session until something is stored
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600, // Update only once every 24 hours (Reduces DB writes)
    }),
    cookie: {
      httpOnly: true, // Prevents client-side JS from reading the cookie
      sameSite: isProduction ? "none" : "lax", // 'none' is required for cross-site cookies (Backend -> Frontend)
      secure: isProduction, // TRUE in production (requires HTTPS)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    },
  })
);

// --- PASSPORT INIT ---
initPassport();
app.use(passport.initialize());
app.use(passport.session());

// --- ROUTES ---

// 1. Health Check (Required for Render to know app is alive)
app.get("/", (req, res) => {
  res.status(200).send("Prompt Studio API is healthy and running...");
});

// 2. API Routes
app.use("/auth", authRoutes);
app.use("/api/image-enhance", promptRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/text", textRoutes);
app.use("/api/history", historyRoutes);

console.log('✅ All routes mounted successfully');

// --- SERVER STARTUP ---
const startServer = async () => {
  try {
    await connectDB();
    
    // Start listening ONLY after DB connection is successful
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();