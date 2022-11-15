import { UsernameAvailableRepository } from "../../../application/protocols/username-available-repository";
import { RegisterUser } from "../../../domain/usecases/registerUser";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, serverError } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class SignUpController implements Controller {
	private readonly registerUser: RegisterUser;
	private readonly usernameRepository: UsernameAvailableRepository;

	constructor(
		registerUser: RegisterUser,
		usernameRepository: UsernameAvailableRepository
	) {
		this.registerUser = registerUser;
		this.usernameRepository = usernameRepository;
	}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
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

			const isUsernameAvailable = await this.usernameRepository.isAvailable(
				username
			);

			if (!isUsernameAvailable) {
				return badRequest(
					new InvalidParamError("username", "username already in use")
				);
			}

			if (password.length < 8) {
				return badRequest(
					new InvalidParamError(
						"password",
						"password must have at least 8 characters"
					)
				);
			}

			const numericRegex = /\d/;

			if (!numericRegex.test(password)) {
				return badRequest(
					new InvalidParamError(
						"password",
						"password must have at least 1 numeric character"
					)
				);
			}

			const uppercaseRegex = /[A-Z]/;

			if (!uppercaseRegex.test(password)) {
				return badRequest(
					new InvalidParamError(
						"password",
						"password must have at least 1 uppercase letter"
					)
				);
			}

			if (password !== passwordConfirmation) {
				return badRequest(
					new InvalidParamError(
						"passwordConfirmation",
						"passwords do not match"
					)
				);
			}

			const createdUser = await this.registerUser.execute({ username, password });

			return ok(createdUser);
		} catch (error) {
			return serverError(error as Error);
		}
	}
}
