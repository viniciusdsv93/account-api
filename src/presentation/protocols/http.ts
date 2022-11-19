export type HttpRequest = {
	query?: any;
	headers?: any;
	body?: any;
};

export type HttpResponse = {
	statusCode: number;
	body: any;
};
