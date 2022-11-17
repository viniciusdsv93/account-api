import { IEncrypter } from "../../../application/protocols/cryptography/encrypter";
import { IFindByUsernameRepository } from "../../../application/protocols/repositories/find-by-username-repository";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, unauthorized } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class LoginController implements Controller {
	private readonly findByUsernameRepository: IFindByUsernameRepository;
	private readonly encrypter: IEncrypter;

	constructor(
		findByUsernameRepository: IFindByUsernameRepository,
		encrypter: IEncrypter
	) {
		this.findByUsernameRepository = findByUsernameRepository;
		this.encrypter = encrypter;
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

		const isValidPassword = await this.encrypter.verify(password);

		if (!isValidPassword) {
			return unauthorized();
		}

		return ok("");
	}
}
