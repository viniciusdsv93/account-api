import { TransactionModel } from "../../../../domain/models/transaction";
import { GetTransactionsModel } from "../../../../domain/usecases/get-transactions";

export interface IGetTransactionsRepository {
	get(filters: GetTransactionsModel): Promise<TransactionModel[] | null>;
}
