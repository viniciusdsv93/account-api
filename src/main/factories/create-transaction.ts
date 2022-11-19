import { CreateTransaction } from "../../application/usecases/create-transaction/create-transaction";
import { JwtAdapter } from "../../infra/cryptography/jwt-adapter/jwt-adapter";
import { AccountPrismaRepository } from "../../infra/database/postgres/account-repository/account";
import { TransactionPrismaRepository } from "../../infra/database/postgres/transaction-repository/transaction";
import { UserPrismaRepository } from "../../infra/database/postgres/user-respository/user";
import { CreateTransactionController } from "../../presentation/controllers/create-transaction/create-transaction";
import { Controller } from "../../presentation/protocols/controller";

export const makeCreateTransactionController = (): Controller => {
	const secret = process.env.JWT_SECRET || "secret";
	const decrypter = new JwtAdapter(secret);
	const accountPrismaRepository = new AccountPrismaRepository();
	const userPrismaRepository = new UserPrismaRepository();
	const transactionPrismaRepository = new TransactionPrismaRepository();
	const createTransaction = new CreateTransaction(
		decrypter,
		accountPrismaRepository,
		userPrismaRepository,
		transactionPrismaRepository
	);
	return new CreateTransactionController(createTransaction);
};
