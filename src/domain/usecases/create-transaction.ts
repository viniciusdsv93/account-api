import { TransactionModel } from "../models/transaction";

export type CreateTransactionModel = {
	token: string;
	creditedUsername: string;
	value: number;
};

export interface ICreateTransaction {
	execute(transactionData: CreateTransactionModel): Promise<TransactionModel>;
}
