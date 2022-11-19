import { TransactionModel } from "../../../domain/models/transaction";
import {
	GetTransactionsModel,
	IGetTransactions,
} from "../../../domain/usecases/get-transactions";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/account/find-account-by-user-id-repository";
import { IGetTransactionsRepository } from "../../protocols/repositories/transaction/get-transactions-repository";

export class GetTransactions implements IGetTransactions {
	private readonly decrypter: IDecrypter;
	private readonly findAccountByUserIdRepository: IFindAccountByUserIdRepository;
	private readonly getTransactionsRepository: IGetTransactionsRepository;

	constructor(
		decrypter: IDecrypter,
		findAccountByUserIdRepository: IFindAccountByUserIdRepository,
		getTransactionsRepository: IGetTransactionsRepository
	) {
		this.decrypter = decrypter;
		this.findAccountByUserIdRepository = findAccountByUserIdRepository;
		this.getTransactionsRepository = getTransactionsRepository;
	}

	async execute(
		token: string,
		filters: GetTransactionsModel
	): Promise<TransactionModel[] | null> {
		const payload = await this.decrypter.decrypt(token);

		if (payload) {
			const { id } = payload;
			const account = await this.findAccountByUserIdRepository.findByUserId(id);

			if (account) {
				const transactions = await this.getTransactionsRepository.get(
					account.id,
					filters
				);
				if (transactions) {
					return transactions;
				}
			}
		}
		return null;
	}
}
