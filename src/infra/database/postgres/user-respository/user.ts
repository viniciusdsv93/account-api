import { IAddAccountToUserRepository } from "../../../../application/protocols/repositories/add-account-to-user-repository";
import { IAddUserRepository } from "../../../../application/protocols/repositories/add-user-repository";
import { IFindUserByUsernameRepository } from "../../../../application/protocols/repositories/find-user-by-username-repository";
import { IUpdateAccessTokenRepository } from "../../../../application/protocols/repositories/update-access-token-repository";
import { IUsernameAvailableRepository } from "../../../../application/protocols/repositories/username-available-repository";
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
		IFindUserByUsernameRepository,
		IUpdateAccessTokenRepository
{
	async updateAccessToken(id: string, token: string): Promise<void> {
		await prismaClient.user.update({
			where: {
				id: id,
			},
			data: {
				accessToken: token,
			},
		});
	}

	async findByUsername(username: string): Promise<UserModel | null> {
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
