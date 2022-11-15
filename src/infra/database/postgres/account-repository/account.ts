import { IAddAccountRepository } from "../../../../application/protocols/add-account-repository";
import { AccountModel } from "../../../../domain/models/account";
import { prismaClient } from "../prisma/prisma-client";

export class AccountPrismaRepository implements IAddAccountRepository {
	async add(userId: string): Promise<AccountModel> {
		return await prismaClient.account.create({
			data: {
				balance: 100,
				User: {
					connect: {
						id: userId,
					},
				},
			},
		});
	}
}
