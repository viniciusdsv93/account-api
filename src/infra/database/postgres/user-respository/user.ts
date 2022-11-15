import { IAddUserRepository } from "../../../../application/protocols/add-user-repository";
import { IUsernameAvailableRepository } from "../../../../application/protocols/username-available-repository";
import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../../../domain/usecases/register-user";
import { prismaClient } from "../prisma/prisma-client";

export class UserPrismaRepository
	implements IAddUserRepository, IUsernameAvailableRepository
{
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
