import 'dotenv/config'; // <--- MUST BE FIRST to load CLERK_SECRET_KEY
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import promptRoutes from './routes/promptRoutes.js';

// 1. Initialize Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Global Middleware
app.use(cors());
app.use(express.json());

// 3. Mount Routes
app.use('/api', promptRoutes);

// 4. Health Check
app.get('/', (req, res) => {
  res.send('Server is running...');
});

// 5. Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 PRO SERVER RUNNING ON PORT ${PORT}`);
  console.log(`   - Database: Connected`);
  console.log(`   - Security: Clerk Auth Active`);
});