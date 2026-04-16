export function success<T>(data: T) {
	return { data };
}

export function paginated<T>(
	data: T[],
	page: number,
	limit: number,
	total: number,
) {
	return {
		data,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
}

export function apiError(code: string, message: string) {
	return { data: null, error: { code, message } };
}
