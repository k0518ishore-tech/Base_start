import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import eligibilityRoutes from './routes/eligibilityRoutes.js';
import eligibilityRuleRoutes from './routes/eligibilityRuleRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import searchHistoryRoutes from './routes/searchHistoryRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();
dotenv.config({ path: './backend/.env' });

const app = express();

// Security and utility middleware
app.use(helmet());
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim().replace(/\/$/, ''))
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Government Scheme Eligibility Engine API',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/eligibility-rules', eligibilityRuleRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assistant', assistantRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
