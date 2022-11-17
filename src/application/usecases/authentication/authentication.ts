import {
	AuthenticationModel,
	IAuthentication,
} from "../../../domain/usecases/authentication";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";

export class Authentication implements IAuthentication {
	private readonly findByUsernameRepository: IFindByUsernameRepository;

	constructor(findByUsernameRepository: IFindByUsernameRepository) {
		this.findByUsernameRepository = findByUsernameRepository;
	}

	async auth(authentication: AuthenticationModel): Promise<string | null> {
		const { username, password } = authentication;
		await this.findByUsernameRepository.find(username);

		return new Promise((resolve) => resolve(null));
	}
}
