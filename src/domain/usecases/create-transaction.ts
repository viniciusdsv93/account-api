import { HttpResponse } from "../../presentation/protocols/http";

export type CreateTransactionModel = {
	token: string;
	creditedUsername: string;
	value: number;
};

export interface ICreateTransaction {
	execute(transactionData: CreateTransactionModel): Promise<HttpResponse>;
}
