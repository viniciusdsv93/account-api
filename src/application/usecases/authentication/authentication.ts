import {
	AuthenticationModel,
	IAuthentication,
} from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { IEncrypter } from "../../protocols/cryptography/encrypter";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";
import { IUpdateAccessTokenRepository } from "../../protocols/repositories/update-access-token-repository";

export class Authentication implements IAuthentication {
	private readonly findByUsernameRepository: IFindByUsernameRepository;
	private readonly hashComparer: IHashComparer;
	private readonly encrypter: IEncrypter;
	private readonly updateAccessTokenRepository: IUpdateAccessTokenRepository;

	constructor(
		findByUsernameRepository: IFindByUsernameRepository,
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
		const user = await this.findByUsernameRepository.find(username);

		if (user) {
			const isValid = await this.hashComparer.compare(password, user.password);
			if (isValid) {
				const accessToken = await this.encrypter.encrypt(user.id);
				await this.updateAccessTokenRepository.update(user.id, accessToken);
				return accessToken;
			}
		}
		return null;
	}
}
