import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; // Imports MongoDB connection
import promptRoutes from './routes/promptRoutes.js'; // Imports the new secure routes

dotenv.config();

// 1. Initialize Database
// This connects to MongoDB before the server starts accepting requests
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Global Middleware
app.use(cors());
app.use(express.json());

// 3. Mount the API Routes
// Instead of defining app.post(...) here, we tell the server:
// "If a request starts with /api, go look in promptRoutes.js"
app.use('/api', promptRoutes);

// 4. Base Route (Health Check for testing)
app.get('/', (req, res) => {
  res.send('Pro Backend is Running (Auth + DB Enabled)');
});

// 5. Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 PRO SERVER RUNNING ON PORT ${PORT}`);
  console.log(`   - Architecture: Modular (Routes/Controllers)`);
  console.log(`   - Database: MongoDB Connected`);
  console.log(`   - Security: Clerk Authentication Active\n`);
});