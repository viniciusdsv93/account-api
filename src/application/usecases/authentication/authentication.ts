import {
	AuthenticationModel,
	IAuthentication,
} from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { IEncrypter } from "../../protocols/cryptography/encrypter";
import { IFindUserByUsernameRepository } from "../../protocols/repositories/user/find-user-by-username-repository";
import { IUpdateAccessTokenRepository } from "../../protocols/repositories/user/update-access-token-repository";

export class Authentication implements IAuthentication {
	private readonly findByUsernameRepository: IFindUserByUsernameRepository;
	private readonly hashComparer: IHashComparer;
	private readonly encrypter: IEncrypter;
	private readonly updateAccessTokenRepository: IUpdateAccessTokenRepository;

	constructor(
		findByUsernameRepository: IFindUserByUsernameRepository,
		hashComparer: IHashComparer,
		encrypter: IEncrypter,
		updateAccessTokenRepository: IUpdateAccessTokenRepository
	) {
		this.findByUsernameRepository = findByUsernameRepository;
		this.hashComparer = hashComparer;
		this.encrypter = encrypter;
		this.updateAccessTokenRepository = updateAccessTokenRepository;
	}

	async auth(authentication: AuthenticationModel): Promise<string | null> {
		const { username, password } = authentication;
		const user = await this.findByUsernameRepository.findByUsername(username);

		if (user) {
			const isValid = await this.hashComparer.compare(password, user.password);
			if (isValid) {
				const accessToken = await this.encrypter.encrypt(user.id);
				await this.updateAccessTokenRepository.updateAccessToken(
					user.id,
					accessToken
				);
				return accessToken;
			}
		}
		return null;
	}
}
