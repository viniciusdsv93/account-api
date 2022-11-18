import { TransactionModel } from "../../../domain/models/transaction";
import {
	CreateTransactionModel,
	ICreateTransaction,
} from "../../../domain/usecases/create-transaction";
import { IDecrypter } from "../../protocols/cryptography/decrypter";

export class CreateTransaction implements ICreateTransaction {
	private readonly decrypter: IDecrypter;

	constructor(decrypter: IDecrypter) {
		this.decrypter = decrypter;
	}

	async execute(transactionData: CreateTransactionModel): Promise<TransactionModel> {
		const { token, creditedUsername, value } = transactionData;

		await this.decrypter.decrypt(token);

		return {
			id: "id",
			creditedAccountId: "account",
			debitedAccountId: "account",
			value: 99,
		};
	}
}
