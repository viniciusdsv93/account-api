import { ServerError } from "../errors/server-error";
import { UnauthorizedError } from "../errors/unauthorized-error";
import { HttpResponse } from "../protocols/http";

export const badRequest = (error: Error): HttpResponse => {
	return {
		statusCode: 400,
		body: error,
	};
};

export const unauthorized = (): HttpResponse => {
	return {
		statusCode: 401,
		body: new UnauthorizedError(),
	};
};

export const serverError = (error: Error): HttpResponse => {
	return {
		statusCode: 500,
		body: new ServerError(error.stack as string),
	};
};

export const ok = (data: any): HttpResponse => {
	return {
		statusCode: 200,
		body: data,
	};
};

export const created = (data: any): HttpResponse => {
	return {
		statusCode: 201,
		body: data,
	};
};
