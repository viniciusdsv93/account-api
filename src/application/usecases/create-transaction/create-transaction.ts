import { TransactionModel } from "../../../domain/models/transaction";
import {
	CreateTransactionModel,
	ICreateTransaction,
} from "../../../domain/usecases/create-transaction";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/find-account-by-user-id-repository";

export class CreateTransaction implements ICreateTransaction {
	private readonly decrypter: IDecrypter;
	private readonly findAccountByUserIdRepository: IFindAccountByUserIdRepository;

	constructor(
		decrypter: IDecrypter,
		findAccountByUserIdRepository: IFindAccountByUserIdRepository
	) {
		this.decrypter = decrypter;
		this.findAccountByUserIdRepository = findAccountByUserIdRepository;
	}

	async execute(
		transactionData: CreateTransactionModel
	): Promise<TransactionModel | null> {
		const { token, creditedUsername, value } = transactionData;

		const payload = await this.decrypter.decrypt(token);

		if (payload) {
			const { id } = payload;
			await this.findAccountByUserIdRepository.findByUserId(id);
		}

		return null;
	}
}
