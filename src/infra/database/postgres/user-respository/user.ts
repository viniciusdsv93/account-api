import { IAddAccountToUserRepository } from "../../../../application/protocols/add-account-to-user-repository";
import { IAddUserRepository } from "../../../../application/protocols/add-user-repository";
import { IFindByUsernameRepository } from "../../../../application/protocols/find-by-username-repository";
import { IUsernameAvailableRepository } from "../../../../application/protocols/username-available-repository";
import { UserModel } from "../../../../domain/models/user";
import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../../../domain/usecases/register-user";
import { prismaClient } from "../prisma/prisma-client";

export class UserPrismaRepository
	implements
		IAddUserRepository,
		IUsernameAvailableRepository,
		IAddAccountToUserRepository,
		IFindByUsernameRepository
{
	async find(username: string): Promise<UserModel | null> {
		const findUserByUsername = await prismaClient.user.findFirst({
			where: {
				username: username,
			},
		});

		if (findUserByUsername) {
			return findUserByUsername as UserModel;
		}

		return null;
	}

	async change(userId: string, accountId: string): Promise<UserModel> {
		const modifiedUser = await prismaClient.user.update({
			where: {
				id: userId,
			},
			data: {
				accountId: accountId,
			},
		});

		return modifiedUser as UserModel;
	}

	async isAvailable(username: string): Promise<boolean> {
		const existsUser = await prismaClient.user.findFirst({
			where: {
				username: username,
			},
		});

		return existsUser ? false : true;
	}

	async add(userData: RegisterUserModel): Promise<UserModelWithoutAccountId> {
		const { username, password } = userData;
		return await prismaClient.user.create({
			data: {
				username: username,
				password: password,
			},
		});
	}
}
