import { TransactionModel } from "../../../../domain/models/transaction";
import { GetTransactionsModel } from "../../../../domain/usecases/get-transactions";

export interface IGetTransactionsRepository {
	get(
		userId: string,
		filters: GetTransactionsModel
	): Promise<TransactionModel[] | null>;
}
