import {
	ICreateTransactionRepository,
	TransactionData,
} from "../../../../application/protocols/repositories/transaction/create-transaction-repository";
import { TransactionModel } from "../../../../domain/models/transaction";
import { prismaClient } from "../prisma/prisma-client";

export class TransactionPrismaRepository implements ICreateTransactionRepository {
	async create(transactionData: TransactionData): Promise<TransactionModel> {
		const { debitedAccountId, creditedAccountId, value } = transactionData;

		const createTransaction = prismaClient.transaction.create({
			data: {
				creditedAccount: {
					connect: {
						id: creditedAccountId,
					},
				},
				debitedAccount: {
					connect: {
						id: debitedAccountId,
					},
				},
				value,
			},
		});

		const updateDebitedAccountBalance = prismaClient.account.update({
			where: {
				id: debitedAccountId,
			},
			data: {
				balance: {
					decrement: value,
				},
			},
		});

		const updateCreditedAccountBalance = prismaClient.account.update({
			where: {
				id: creditedAccountId,
			},
			data: {
				balance: {
					increment: value,
				},
			},
		});

		const [transaction] = await prismaClient.$transaction([
			createTransaction,
			updateDebitedAccountBalance,
			updateCreditedAccountBalance,
		]);

		return transaction;
	}
}
