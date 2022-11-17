import {
	AuthenticationModel,
	IAuthentication,
} from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { ITokenGenerator } from "../../protocols/cryptography/token-generator";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";
import { IUpdateAccessTokenRepository } from "../../protocols/repositories/update-access-token-repository";

export class Authentication implements IAuthentication {
	private readonly findByUsernameRepository: IFindByUsernameRepository;
	private readonly hashComparer: IHashComparer;
	private readonly tokenGenerator: ITokenGenerator;
	private readonly updateAccessTokenRepository: IUpdateAccessTokenRepository;

	constructor(
		findByUsernameRepository: IFindByUsernameRepository,
		hashComparer: IHashComparer,
		tokenGenerator: ITokenGenerator,
		updateAccessTokenRepository: IUpdateAccessTokenRepository
	) {
		this.findByUsernameRepository = findByUsernameRepository;
		this.hashComparer = hashComparer;
		this.tokenGenerator = tokenGenerator;
		this.updateAccessTokenRepository = updateAccessTokenRepository;
	}

	async auth(authentication: AuthenticationModel): Promise<string | null> {
		const { username, password } = authentication;
		const user = await this.findByUsernameRepository.find(username);

		if (user) {
			const isValid = await this.hashComparer.compare(password, user.password);
			if (isValid) {
				const accessToken = await this.tokenGenerator.generate(user.id);
				await this.updateAccessTokenRepository.update(user.id, accessToken);
				return accessToken;
			}
		}
		return null;
	}
}
