import { APIError } from "@/utils/APIError";
import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { logger } from "@/config/logger";
import config from "@/config";

export const errorConverter: ErrorRequestHandler = (err, req: Request, res: Response, next) => {
	let error = err;
	if (!(error instanceof APIError)) {
		const statusCode = error.statusCode || error.status || 500;
		const message = error.message || statusCode.toString();
		error = new APIError(statusCode, message, error.stack);
	}
	next(error);
};

export const errorHandler: ErrorRequestHandler = (err: APIError, req: Request, res: Response, next: NextFunction) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || statusCode.toString();

	// Log error with request details
	const errorLog = {
		message,
		statusCode,
		method: req.method,
		url: req.url,
		ip: req.ip,
		userAgent: req.get('User-Agent'),
		requestId: (req as any).id,
		stack: config.nodeEnv === 'development' ? err.stack : undefined
	};

	logger.error('Request error:', errorLog);

	const response: any = {
		error: {
			code: statusCode,
			message: config.nodeEnv === 'development' ? message : 'Internal server error',
			requestId: (req as any).id,
			timestamp: new Date().toISOString()
		}
	};

	// Add stack trace in development
	if (config.nodeEnv === 'development' && err.stack) {
		response.error.stack = err.stack;
	}

	res.status(statusCode).json(response);
};