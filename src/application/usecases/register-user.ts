import { UserModel } from "../../domain/models/user";
import { IRegisterUser, RegisterUserModel } from "../../domain/usecases/registerUser";
import { IAddUserRepository } from "../protocols/add-user-repository";
import { IEncrypter } from "../protocols/encrypter";

export class RegisterUser implements IRegisterUser {
	private readonly encrypter: IEncrypter;
	private readonly addUserRepository: IAddUserRepository;

	constructor(encrypter: IEncrypter, addUserRepository: IAddUserRepository) {
		this.encrypter = encrypter;
		this.addUserRepository = addUserRepository;
	}

	async execute(user: RegisterUserModel): Promise<UserModel> {
		const { username, password } = user;
		const hashedPassword = await this.encrypter.encrypt(password);

		await this.addUserRepository.add({
			username: username,
			password: hashedPassword,
		});

		return await new Promise((resolve) =>
			resolve({
				id: "valid_id",
				username: username,
				password: password,
				accountId: "valid_account_id",
			})
		);
	}
}
