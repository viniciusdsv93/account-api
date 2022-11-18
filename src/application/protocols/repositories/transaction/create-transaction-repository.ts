import { TransactionModel } from "../../../../domain/models/transaction";

export type TransactionData = {
	debitedAccountId: string;
	creditedAccountId: string;
	value: number;
};

export interface ICreateTransactionRepository {
	create(transactionData: TransactionData): Promise<TransactionModel>;
}
