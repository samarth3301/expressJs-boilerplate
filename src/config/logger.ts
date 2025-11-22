import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import config from "./index";

const isProduction = config.nodeEnv === "production";

const loggerFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} ${level}: ${message}${metaStr}`;
});

const transports: winston.transport[] = [
  new winston.transports.Console({
    level: isProduction ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      loggerFormat
    ),
  }),
];

if (isProduction) {
  // JSON format for production logs
  transports.push(
    new DailyRotateFile({
      filename: path.join("logs", "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new DailyRotateFile({
      filename: path.join("logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "20m",
      maxFiles: "14d",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
} else {
  // Simple file logs for development
  transports.push(
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        loggerFormat
      ),
    }),
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        loggerFormat
      ),
    })
  );
}

export const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    loggerFormat
  ),
  transports,
  exitOnError: false,
});

// Add request ID support
export const addRequestId = winston.format((info, opts: any) => {
  if (opts.requestId) {
    info.requestId = opts.requestId;
  }
  return info;
});