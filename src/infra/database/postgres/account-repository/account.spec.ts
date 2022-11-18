import { prismaClient } from "../prisma/prisma-client";
import { UserPrismaRepository } from "../user-respository/user";
import { AccountPrismaRepository } from "./account";

describe("Account Prisma Repository", () => {
	beforeEach(async () => {
		await prismaClient.account.deleteMany();
		await prismaClient.user.deleteMany();
	});

	test("Should return an account on add success", async () => {
		const sut = new AccountPrismaRepository();
		const userSut = new UserPrismaRepository();
		const user = await userSut.add({
			username: "valid_username2",
			password: "Valid_password1",
		});
		const createdAccount = await sut.add(user.id);
		expect(createdAccount).toHaveProperty("id");
		expect(createdAccount).toHaveProperty("balance");
	});

	test("Should return an account on findAccountByUserId success", async () => {
		const sut = new AccountPrismaRepository();
		const userSut = new UserPrismaRepository();
		const user = await userSut.add({
			username: "valid_username2",
			password: "Valid_password1",
		});
		await sut.add(user.id);
		const accountByUserId = await sut.findByUserId(user.id);
		expect(accountByUserId).toHaveProperty("id");
		expect(accountByUserId).toHaveProperty("balance");
	});
});
