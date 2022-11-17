import {
	AuthenticationModel,
	IAuthentication,
} from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { ITokenGenerator } from "../../protocols/cryptography/token-generator";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";

export class Authentication implements IAuthentication {
	private readonly findByUsernameRepository: IFindByUsernameRepository;
	private readonly hashComparer: IHashComparer;
	private readonly tokenGenerator: ITokenGenerator;

	constructor(
		findByUsernameRepository: IFindByUsernameRepository,
		hashComparer: IHashComparer,
		tokenGenerator: ITokenGenerator
	) {
		this.findByUsernameRepository = findByUsernameRepository;
		this.hashComparer = hashComparer;
		this.tokenGenerator = tokenGenerator;
	}

	async auth(authentication: AuthenticationModel): Promise<string | null> {
		const { username, password } = authentication;
		const user = await this.findByUsernameRepository.find(username);

		if (user) {
			const isValid = await this.hashComparer.compare(password, user.password);
			if (isValid) {
				const accessToken = await this.tokenGenerator.generate(user.id);
				return accessToken;
			}
		}
		return null;
	}
}
