import { GetTransactions } from "../../application/usecases/get-transactions/get-transactions";
import { JwtAdapter } from "../../infra/cryptography/jwt-adapter/jwt-adapter";
import { AccountPrismaRepository } from "../../infra/database/postgres/account-repository/account";
import { TransactionPrismaRepository } from "../../infra/database/postgres/transaction-repository/transaction";
import { GetTransactionsController } from "../../presentation/controllers/get-transactions/get-transactions";
import { Controller } from "../../presentation/protocols/controller";

export const makeGetTransactionsController = (): Controller => {
	const secret = process.env.JWT_SECRET || "secret";
	const jwtAdapter = new JwtAdapter(secret);
	const accountPrismaRepository = new AccountPrismaRepository();
	const transactionPrismaRepository = new TransactionPrismaRepository();
	const getTransactions = new GetTransactions(
		jwtAdapter,
		accountPrismaRepository,
		transactionPrismaRepository
	);
	return new GetTransactionsController(getTransactions);
};
