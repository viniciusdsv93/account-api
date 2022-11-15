import { RegisterUser } from "../../../domain/usecases/registerUser";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class SignUpController implements Controller {
	private readonly registerUser: RegisterUser;

	constructor(registerUser: RegisterUser) {
		this.registerUser = registerUser;
	}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		const requiredFields = ["username", "password", "passwordConfirmation"];
		for (const field of requiredFields) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field));
			}
		}

		const { username, password, passwordConfirmation } = httpRequest.body;

		if (username.length < 3) {
			return badRequest(
				new InvalidParamError(
					"username",
					"username must have at least 3 characters"
				)
			);
		}

		// TODO = ENSURE USERNAME IS UNIQUE

		if (password.length < 8) {
			return badRequest(
				new InvalidParamError(
					"password",
					"password must have at least 8 characters"
				)
			);
		}

		const regex = /\d/;

		if (!regex.test(password)) {
			return badRequest(
				new InvalidParamError(
					"password",
					"password must have at least 1 numeric character"
				)
			);
		}

		if (password !== passwordConfirmation) {
			return badRequest(
				new InvalidParamError("passwordConfirmation", "passwords do not match")
			);
		}

		await this.registerUser.execute({ username, password });

		return {
			statusCode: 0,
			body: "",
		};
	}
}
