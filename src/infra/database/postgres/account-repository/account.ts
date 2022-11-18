import { IAddAccountRepository } from "../../../../application/protocols/repositories/account/add-account-repository";
import { IFindAccountByUserIdRepository } from "../../../../application/protocols/repositories/account/find-account-by-user-id-repository";
import { AccountModel } from "../../../../domain/models/account";
import { prismaClient } from "../prisma/prisma-client";

export class AccountPrismaRepository
	implements IAddAccountRepository, IFindAccountByUserIdRepository
{
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

	async findByUserId(userId: string): Promise<AccountModel | null> {
		return await prismaClient.account.findFirst({
			where: {
				userId: userId,
			},
		});
	}
}
