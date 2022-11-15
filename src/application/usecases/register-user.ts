import { AccountModel } from "../../domain/models/account";
import { UserModel } from "../../domain/models/user";
import { IRegisterUser, RegisterUserModel } from "../../domain/usecases/register-user";
import { IAddAccountRepository } from "../protocols/add-account-repository";
import { IAddAccountToUserRepository } from "../protocols/add-account-to-user-repository";
import { IAddUserRepository } from "../protocols/add-user-repository";
import { IEncrypter } from "../protocols/encrypter";

export class RegisterUser implements IRegisterUser {
	private readonly encrypter: IEncrypter;
	private readonly addUserRepository: IAddUserRepository;
	private readonly addAccountRepository: IAddAccountRepository;
	private readonly addAccountToUserRepository: IAddAccountToUserRepository;

	constructor(
		encrypter: IEncrypter,
		addUserRepository: IAddUserRepository,
		addAccountRepository: IAddAccountRepository,
		addAccountToUserRepository: IAddAccountToUserRepository
	) {
		this.encrypter = encrypter;
		this.addUserRepository = addUserRepository;
		this.addAccountRepository = addAccountRepository;
		this.addAccountToUserRepository = addAccountToUserRepository;
	}

	async execute(user: RegisterUserModel): Promise<UserModel> {
		const { username, password } = user;
		const hashedPassword = await this.encrypter.encrypt(password);

		const createdUser = await this.addUserRepository.add({
			username: username,
			password: hashedPassword,
		});

		let createdAccount: AccountModel;
		let createdUserWithAccountId: UserModel;

		if (createdUser?.id) {
			createdAccount = await this.addAccountRepository.add(createdUser.id);
			createdUserWithAccountId = await this.addAccountToUserRepository.change(
				createdUser.id,
				createdAccount.id
			);
		} else {
			throw new Error("Error when trying to create a new user");
		}

		return createdUserWithAccountId;
	}
}
