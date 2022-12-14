import { TransactionModel } from "../models/transaction";

export type GetTransactionsModel = {
	date?: string;
	type?: "cash-in" | "cash-out";
};

export interface IGetTransactions {
	execute(
		token: string,
		filters: GetTransactionsModel
	): Promise<TransactionModel[] | null>;
}
