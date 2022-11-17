import {
	AuthenticationModel,
	IAuthentication,
} from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";

export class Authentication implements IAuthentication {
	private readonly findByUsernameRepository: IFindByUsernameRepository;
	private readonly hashComparer: IHashComparer;

	constructor(
		findByUsernameRepository: IFindByUsernameRepository,
		hashComparer: IHashComparer
	) {
		this.findByUsernameRepository = findByUsernameRepository;
		this.hashComparer = hashComparer;
	}

	async auth(authentication: AuthenticationModel): Promise<string | null> {
		const { username, password } = authentication;
		const user = await this.findByUsernameRepository.find(username);

		if (user) {
			await this.hashComparer.compare(password, user.password);
		}

		return null;
	}
}
