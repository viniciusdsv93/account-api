import { TransactionModel } from "../../../domain/models/transaction";
import {
	GetTransactionsModel,
	IGetTransactions,
} from "../../../domain/usecases/get-transactions";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IGetTransactionsRepository } from "../../protocols/repositories/transaction/get-transactions-repository";

export class GetTransactions implements IGetTransactions {
	private readonly decrypter: IDecrypter;
	private readonly getTransactionsRepository: IGetTransactionsRepository;

	constructor(
		decrypter: IDecrypter,
		getTransactionsRepository: IGetTransactionsRepository
	) {
		this.decrypter = decrypter;
		this.getTransactionsRepository = getTransactionsRepository;
	}

	async execute(
		token: string,
		filters: GetTransactionsModel
	): Promise<TransactionModel[] | null> {
		await this.decrypter.decrypt(token);
		return null;
	}
}
