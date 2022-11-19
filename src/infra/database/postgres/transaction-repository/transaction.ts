import {
	ICreateTransactionRepository,
	TransactionData,
} from "../../../../application/protocols/repositories/transaction/create-transaction-repository";
import { TransactionModel } from "../../../../domain/models/transaction";
import { prismaClient } from "../prisma/prisma-client";

export class TransactionPrismaRepository implements ICreateTransactionRepository {
	async create(transactionData: TransactionData): Promise<TransactionModel> {
		const { debitedAccountId, creditedAccountId, value } = transactionData;
		return await prismaClient.transaction.create({
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
	}
}
