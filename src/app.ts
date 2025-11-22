import express from 'express'
import cors from 'cors'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import router from './routes'
import morgan from 'morgan'
import helmet from 'helmet'
import { v4 as uuidv4 } from 'uuid'
import { errorConverter, errorHandler } from './handlers/error.handler'
import config from './config'
import { logger } from './config/logger'

const app = express()

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  }
})
app.use(limiter)

// Compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))

// CORS configuration
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}))

// Request ID middleware
app.use((req: any, res: any, next) => {
  req.id = uuidv4()
  res.setHeader('X-Request-ID', req.id)
  next()
})

// Body parsing with limits
app.use(express.json({
  limit: '10mb',
  verify: (req: any, res, buf) => {
    req.rawBody = buf
  }
}))
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}))

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim(), { requestId: (global as any).currentRequestId })
      }
    }
  }))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API routes
app.use(router)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Error handling
app.use(errorConverter)
app.use(errorHandler)

export default app