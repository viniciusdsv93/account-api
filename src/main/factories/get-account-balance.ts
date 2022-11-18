import { JwtAdapter } from "../../infra/cryptography/jwt-adapter/jwt-adapter";
import { AccountPrismaRepository } from "../../infra/database/postgres/account-repository/account";
import { Controller } from "../../presentation/protocols/controller";
import { GetAccountBalance } from "../../application/usecases/get-account-balance/get-account-balance";
import { GetAccountBalanceController } from "../../presentation/controllers/account-balance/get-account-balance";

export const makeGetAccountBalanceController = (): Controller => {
	const secret = process.env.JWT_SECRET || "secret";
	const jwtAdapter = new JwtAdapter(secret);
	const accountPrismaRepository = new AccountPrismaRepository();
	const getAccountBalance = new GetAccountBalance(jwtAdapter, accountPrismaRepository);
	return new GetAccountBalanceController(getAccountBalance);
};
