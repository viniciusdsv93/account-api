import { UserModel } from "../../domain/models/user";
import { IRegisterUser, RegisterUserModel } from "../../domain/usecases/registerUser";
import { IEncrypter } from "../protocols/encrypter";

export class RegisterUser implements IRegisterUser {
	private readonly encrypter: IEncrypter;

	constructor(encrypter: IEncrypter) {
		this.encrypter = encrypter;
	}

	async execute(user: RegisterUserModel): Promise<UserModel> {
		const hashedPassword = await this.encrypter.encrypt(user.password);

		return await new Promise((resolve) =>
			resolve({
				id: "valid_id",
				username: user.username,
				password: user.password,
				accountId: "valid_account_id",
			})
		);
	}
}
