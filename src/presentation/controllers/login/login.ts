import { IEncrypter } from "../../../application/protocols/cryptography/encrypter";
import { IFindByUsernameRepository } from "../../../application/protocols/repositories/find-by-username-repository";
import { IAuthentication } from "../../../domain/usecases/authentication";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, unauthorized } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class LoginController implements Controller {
	private readonly findByUsernameRepository: IFindByUsernameRepository;
	private readonly authentication: IAuthentication;

	constructor(
		findByUsernameRepository: IFindByUsernameRepository,
		authentication: IAuthentication
	) {
		this.findByUsernameRepository = findByUsernameRepository;
		this.authentication = authentication;
	}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		const requiredFields = ["username", "password"];
		for (const field of requiredFields) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field));
			}
		}

		const { username, password } = httpRequest.body;

		const findUser = await this.findByUsernameRepository.find(username);

		if (!findUser) {
			return badRequest(
				new InvalidParamError("username", "invalid username or password")
			);
		}

		await this.authentication.auth(username, password);

		return ok("");
	}
}
