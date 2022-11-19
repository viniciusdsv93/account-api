import {
	ICreateTransactionRepository,
	TransactionData,
} from "../../../../application/protocols/repositories/transaction/create-transaction-repository";
import { IGetTransactionsRepository } from "../../../../application/protocols/repositories/transaction/get-transactions-repository";
import { TransactionModel } from "../../../../domain/models/transaction";
import { GetTransactionsModel } from "../../../../domain/usecases/get-transactions";
import { prismaClient } from "../prisma/prisma-client";

export class TransactionPrismaRepository
	implements ICreateTransactionRepository, IGetTransactionsRepository
{
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

	get(
		accountId: string,
		filters: GetTransactionsModel
	): Promise<TransactionModel[] | null> {
		if (filters.type === "cash-out") {
			if (filters.date) {
				const date = new Date(filters.date);
				date.setDate(date.getDate() + 1);
				return prismaClient.transaction.findMany({
					where: {
						AND: [
							{
								debitedAccountId: accountId,
							},
							{
								createdAt: {
									gte: new Date(filters.date),
									lt: date,
								},
							},
						],
					},
				});
			} else {
				return prismaClient.transaction.findMany({
					where: {
						debitedAccountId: accountId,
					},
				});
			}
		}

		if (filters.type === "cash-in") {
			if (filters.date) {
				const date = new Date(filters.date);
				date.setDate(date.getDate() + 1);
				return prismaClient.transaction.findMany({
					where: {
						AND: [
							{
								creditedAccountId: accountId,
							},
							{
								createdAt: {
									gte: new Date(filters.date),
									lt: date,
								},
							},
						],
					},
				});
			} else {
				return prismaClient.transaction.findMany({
					where: {
						creditedAccountId: accountId,
					},
				});
			}
		}

		if (filters.date) {
			const date = new Date(filters.date);
			date.setDate(date.getDate() + 1);
			return prismaClient.transaction.findMany({
				where: {
					OR: [
						{
							debitedAccountId: accountId,
						},
						{
							creditedAccountId: accountId,
						},
					],
					AND: [
						{
							createdAt: {
								gte: new Date(filters.date),
								lt: date,
							},
						},
					],
				},
			});
		} else {
			return prismaClient.transaction.findMany({
				where: {
					OR: [
						{
							debitedAccountId: accountId,
						},
						{
							creditedAccountId: accountId,
						},
					],
				},
			});
		}
	}
}
