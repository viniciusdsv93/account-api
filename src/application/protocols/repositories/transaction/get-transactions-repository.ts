import { TransactionModel } from "../../../../domain/models/transaction";
import { GetTransactionsModel } from "../../../../domain/usecases/get-transactions";

export interface IGetTransactionsRepository {
	get(
		accountId: string,
		filters: GetTransactionsModel
	): Promise<TransactionModel[] | null>;
}
