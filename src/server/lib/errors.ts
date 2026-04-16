export class AppError extends Error {
	constructor(
		public statusCode: number,
		public code: string,
		message: string,
	) {
		super(message);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(404, "NOT_FOUND", message);
	}
}

export class ConflictError extends AppError {
	constructor(message = "Resource already exists") {
		super(409, "CONFLICT", message);
	}
}

export class ValidationError extends AppError {
	constructor(message = "Validation failed") {
		super(422, "VALIDATION_ERROR", message);
	}
}
