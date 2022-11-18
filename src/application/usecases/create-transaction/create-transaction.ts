import { TransactionModel } from "../../../domain/models/transaction";
import {
	CreateTransactionModel,
	ICreateTransaction,
} from "../../../domain/usecases/create-transaction";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/account/find-account-by-user-id-repository";
import { IFindUserByUsernameRepository } from "../../protocols/repositories/user/find-user-by-username-repository";

export class CreateTransaction implements ICreateTransaction {
	private readonly decrypter: IDecrypter;
	private readonly findAccountByUserIdRepository: IFindAccountByUserIdRepository;
	private readonly findUserByUsernameRepository: IFindUserByUsernameRepository;

	constructor(
		decrypter: IDecrypter,
		findAccountByUserIdRepository: IFindAccountByUserIdRepository,
		findUserByUsernameRepository: IFindUserByUsernameRepository
	) {
		this.decrypter = decrypter;
		this.findAccountByUserIdRepository = findAccountByUserIdRepository;
		this.findUserByUsernameRepository = findUserByUsernameRepository;
	}

	async execute(
		transactionData: CreateTransactionModel
	): Promise<TransactionModel | null> {
		let debitedAccount = null;
		let creditedAccount = null;

		const { token, creditedUsername, value } = transactionData;

		const payload = await this.decrypter.decrypt(token);

		if (payload) {
			const { id } = payload;
			debitedAccount = await this.findAccountByUserIdRepository.findByUserId(id);
		}

		if (debitedAccount) {
			const creditedUser = await this.findUserByUsernameRepository.findByUsername(
				creditedUsername
			);

			if (creditedUser) {
				creditedAccount = await this.findAccountByUserIdRepository.findByUserId(
					creditedUser.id
				);
			}
		}

		// if (debitedAccount && creditedAccount) {
		//   if (value <= debitedAccount.balance) {

		//   }
		// }

		return null;
	}
}
