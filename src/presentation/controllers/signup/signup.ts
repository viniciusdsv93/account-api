import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class SignUpController implements Controller {
	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		const requiredFields = ["username", "password", "passwordConfirmation"];
		for (const field of requiredFields) {
			if (!httpRequest.body[field]) {
				return {
					statusCode: 400,
					body: `Missing Param Error: ${field}`,
				};
			}
		}

		if (httpRequest.body.password !== httpRequest.body.passwordConfirmation) {
			return {
				statusCode: 400,
				body: `Invalid Param Error: passwordConfirmation`,
			};
		}

		return {
			statusCode: 0,
			body: "",
		};
	}
}
