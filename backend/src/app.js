import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import env from './config/env.js';

const app = express();

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Trust proxy for correct IP in audit logs (behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting
app.use('/api', apiRateLimiter);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
