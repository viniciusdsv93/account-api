import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class SignUpController implements Controller {
	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		const requiredFields = ["username", "password", "passwordConfirmation"];
		for (const field of requiredFields) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field));
			}
		}

		if (httpRequest.body.password !== httpRequest.body.passwordConfirmation) {
			return badRequest(new InvalidParamError("passwordConfirmation"));
		}

		return {
			statusCode: 0,
			body: "",
		};
	}
}
