import { IAddUserRepository } from "../../../../application/protocols/add-user-repository";
import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../../../domain/usecases/register-user";
import { prismaClient } from "../prisma/prisma-client";

export class UserPrismaRepository implements IAddUserRepository {
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
