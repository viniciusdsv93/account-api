import { RegisterUser } from "../../application/usecases/register-user";
import { BcryptAdapter } from "../../infra/cryptography/bcrypt-adapter";
import { AccountPrismaRepository } from "../../infra/database/postgres/account-repository/account";
import { UserPrismaRepository } from "../../infra/database/postgres/user-respository/user";
import { SignUpController } from "../../presentation/controllers/signup/signup";
import { Controller } from "../../presentation/protocols/controller";

export const makeSignUpController = (): Controller => {
	const salt = 12;
	const bcryptAdapter = new BcryptAdapter(salt);
	const userPrismaRepository = new UserPrismaRepository();
	const accountPrismaRepository = new AccountPrismaRepository();
	const registerUser = new RegisterUser(
		bcryptAdapter,
		userPrismaRepository,
		accountPrismaRepository,
		userPrismaRepository
	);
	return new SignUpController(registerUser, userPrismaRepository);
};
