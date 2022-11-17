import { UserPrismaRepository } from "../../infra/database/postgres/user-respository/user";
import { Controller } from "../../presentation/protocols/controller";
import { Authentication } from "../../application/usecases/authentication/authentication";
import { BcryptAdapter } from "../../infra/cryptography/bcrypt-adapter/bcrypt-adapter";
import { JwtAdapter } from "../../infra/cryptography/jwt-adapter/jwt-adapter";
import { LoginController } from "../../presentation/controllers/login/login";

export const makeLoginController = (): Controller => {
	const userPrismaRepository = new UserPrismaRepository();
	const salt = 12;
	const bcryptAdapter = new BcryptAdapter(salt);
	const jwtAdapter = new JwtAdapter("secret");
	const authentication = new Authentication(
		userPrismaRepository,
		bcryptAdapter,
		jwtAdapter,
		userPrismaRepository
	);
	return new LoginController(userPrismaRepository, authentication);
};
