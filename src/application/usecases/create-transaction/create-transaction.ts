import { TransactionModel } from "../../../domain/models/transaction";
import {
	CreateTransactionModel,
	ICreateTransaction,
} from "../../../domain/usecases/create-transaction";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/account/find-account-by-user-id-repository";
import { ICreateTransactionRepository } from "../../protocols/repositories/transaction/create-transaction-repository";
import { IFindUserByUsernameRepository } from "../../protocols/repositories/user/find-user-by-username-repository";

export class CreateTransaction implements ICreateTransaction {
	private readonly decrypter: IDecrypter;
	private readonly findAccountByUserIdRepository: IFindAccountByUserIdRepository;
	private readonly findUserByUsernameRepository: IFindUserByUsernameRepository;
	private readonly createTransactionRepository: ICreateTransactionRepository;

	constructor(
		decrypter: IDecrypter,
		findAccountByUserIdRepository: IFindAccountByUserIdRepository,
		findUserByUsernameRepository: IFindUserByUsernameRepository,
		createTransactionRepository: ICreateTransactionRepository
	) {
		this.decrypter = decrypter;
		this.findAccountByUserIdRepository = findAccountByUserIdRepository;
		this.findUserByUsernameRepository = findUserByUsernameRepository;
		this.createTransactionRepository = createTransactionRepository;
	}

	async execute(
		transactionData: CreateTransactionModel
	): Promise<TransactionModel | null> {
		let debitedAccount = null;
		let creditedAccount = null;

		const { token, creditedUsername, value } = transactionData;

		const payload = await this.decrypter.decrypt(token);

		if (!payload) {
			return null;
		}

		const { id } = payload;
		debitedAccount = await this.findAccountByUserIdRepository.findByUserId(id);

		if (!debitedAccount) {
			return null;
		}

		const creditedUser = await this.findUserByUsernameRepository.findByUsername(
			creditedUsername
		);

		if (!creditedUser) {
			return null;
		}

		creditedAccount = await this.findAccountByUserIdRepository.findByUserId(
			creditedUser.id
		);

		if (!creditedAccount) {
			return null;
		}

		if (debitedAccount.id === creditedAccount.id) {
			return null;
		}

		if (value > debitedAccount.balance) {
			return null;
		}

		return await this.createTransactionRepository.create({
			debitedAccountId: debitedAccount.id,
			creditedAccountId: creditedAccount.id,
			value,
		});
	}
}
