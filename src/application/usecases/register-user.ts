import { AccountModel } from "../../domain/models/account";
import { UserModel } from "../../domain/models/user";
import { IRegisterUser, RegisterUserModel } from "../../domain/usecases/register-user";
import { IAddAccountRepository } from "../protocols/add-account-repository";
import { IAddUserRepository } from "../protocols/add-user-repository";
import { IEncrypter } from "../protocols/encrypter";

export class RegisterUser implements IRegisterUser {
	private readonly encrypter: IEncrypter;
	private readonly addUserRepository: IAddUserRepository;
	private readonly addAccountRepository: IAddAccountRepository;

	constructor(
		encrypter: IEncrypter,
		addUserRepository: IAddUserRepository,
		addAccountRepository: IAddAccountRepository
	) {
		this.encrypter = encrypter;
		this.addUserRepository = addUserRepository;
		this.addAccountRepository = addAccountRepository;
	}

	async execute(user: RegisterUserModel): Promise<UserModel> {
		const { username, password } = user;
		const hashedPassword = await this.encrypter.encrypt(password);

		const createdUser = await this.addUserRepository.add({
			username: username,
			password: hashedPassword,
		});

		let createdAccount: AccountModel;

		if (createdUser?.id) {
			createdAccount = await this.addAccountRepository.add(createdUser.id);
		} else {
			throw new Error("Error when trying to create a new user");
		}

		return {
			id: createdUser.id,
			username: username,
			password: password,
			accountId: createdAccount.id,
		};
	}
}
