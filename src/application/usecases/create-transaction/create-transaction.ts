import { TransactionModel } from "../../../domain/models/transaction";
import {
	CreateTransactionModel,
	ICreateTransaction,
} from "../../../domain/usecases/create-transaction";
import { InvalidParamError } from "../../../presentation/errors/invalid-param-error";
import {
	badRequest,
	ok,
	serverError,
	unauthorized,
} from "../../../presentation/helpers/http";
import { HttpResponse } from "../../../presentation/protocols/http";
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

	async execute(transactionData: CreateTransactionModel): Promise<HttpResponse> {
		let debitedAccount = null;
		let creditedAccount = null;

		const { token, creditedUsername, value } = transactionData;

		const payload = await this.decrypter.decrypt(token);

		if (!payload) {
			return unauthorized();
		}

		const { id } = payload;
		debitedAccount = await this.findAccountByUserIdRepository.findByUserId(id);

		if (!debitedAccount) {
			return unauthorized();
		}

		const creditedUser = await this.findUserByUsernameRepository.findByUsername(
			creditedUsername
		);

		if (!creditedUser) {
			return badRequest(
				new InvalidParamError(
					"creditedUsername",
					"invalid username for receiver account"
				)
			);
		}

		creditedAccount = await this.findAccountByUserIdRepository.findByUserId(
			creditedUser.id
		);

		if (!creditedAccount) {
			return badRequest(
				new InvalidParamError(
					"creditedUsername",
					"invalid username for receiver account"
				)
			);
		}

		if (debitedAccount.id === creditedAccount.id) {
			return badRequest(
				new InvalidParamError(
					"creditedUsername",
					"receiver and sender account must be different"
				)
			);
		}

		if (value > debitedAccount.balance) {
			return badRequest(
				new InvalidParamError("value", "insufficient balance for this operation")
			);
		}

		const createdTransaction = await this.createTransactionRepository.create({
			debitedAccountId: debitedAccount.id,
			creditedAccountId: creditedAccount.id,
			value,
		});

		if (!createdTransaction) {
			return serverError(
				new Error(
					"Error when trying to process the transaction. Please, try again later"
				)
			);
		}

		return ok(createdTransaction);
	}
}
