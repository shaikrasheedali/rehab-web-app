import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config/env.js';
import { serveSwaggerDocs } from './docs/swagger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

// Route imports
import serviceRoutes from './routes/serviceRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import accommodationRoutes from './routes/accommodationRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  // Basic Middlewares
  app.use(cors({
    origin: config.corsOrigin,
    credentials: true
  }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Serve static uploads
  const uploadsPath = path.resolve(__dirname, '../uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // Mount API Documentation
  serveSwaggerDocs(app);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Sri Thirumala Care Clinical API'
    });
  });

  // Mount API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/packages', packageRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/admissions', admissionRoutes);
  app.use('/api/accommodations', accommodationRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/stats', statsRoutes);

  // Static React client serving in production
  const clientDistPath = path.resolve(__dirname, '../client/dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // 404 for API endpoints
  app.use('/api/*', notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
