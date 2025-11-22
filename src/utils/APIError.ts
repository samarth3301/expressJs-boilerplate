export class APIError extends Error {
	statusCode: number;
	isOperational: boolean;
	stack?: string;

	constructor(statusCode: number, message: string, stack?: string) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		this.stack = stack;

		Error.captureStackTrace(this, this.constructor);
	}
}