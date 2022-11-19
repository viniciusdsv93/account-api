import { AccountPrismaRepository } from "../account-repository/account";
import { prismaClient } from "../prisma/prisma-client";
import { UserPrismaRepository } from "../user-respository/user";
import { TransactionPrismaRepository } from "./transaction";

describe("Transaction Prisma Repository", () => {
	beforeEach(async () => {
		await prismaClient.transaction.deleteMany();
		await prismaClient.account.deleteMany();
		await prismaClient.user.deleteMany();
	});

	afterAll(async () => {
		await prismaClient.transaction.deleteMany();
		await prismaClient.account.deleteMany();
		await prismaClient.user.deleteMany();
	});

	type SutTypes = {
		sut: TransactionPrismaRepository;
		accountSut: AccountPrismaRepository;
		userSut: UserPrismaRepository;
	};

	const makeSut = (): SutTypes => {
		const sut = new TransactionPrismaRepository();
		const accountSut = new AccountPrismaRepository();
		const userSut = new UserPrismaRepository();
		return {
			sut,
			accountSut,
			userSut,
		};
	};

	test("Should return a transaction on create success", async () => {
		const { sut, accountSut, userSut } = makeSut();
		const user1 = await userSut.add({
			username: "Orlando",
			password: "Password1",
		});
		const debitedAccount = await accountSut.add(user1.id);
		const user2 = await userSut.add({
			username: "Mariana",
			password: "Password2",
		});
		const creditedAccount = await accountSut.add(user2.id);
		const createdTransaction = await sut.create({
			debitedAccountId: debitedAccount.id,
			creditedAccountId: creditedAccount.id,
			value: 45.3,
		});
		expect(createdTransaction).toHaveProperty("id");
		expect(createdTransaction).toHaveProperty("debitedAccountId");
		expect(createdTransaction).toHaveProperty("creditedAccountId");
		expect(createdTransaction).toHaveProperty("value");
		expect(createdTransaction).toHaveProperty("createdAt");
	});

	test("Should subtract on debited account and sum on credited account on create success", async () => {
		const { sut, accountSut, userSut } = makeSut();
		const user1 = await userSut.add({
			username: "Orlando",
			password: "Password1",
		});
		const debitedAccount = await accountSut.add(user1.id);
		const user2 = await userSut.add({
			username: "Mariana",
			password: "Password2",
		});
		const creditedAccount = await accountSut.add(user2.id);
		await sut.create({
			debitedAccountId: debitedAccount.id,
			creditedAccountId: creditedAccount.id,
			value: 45.3,
		});
		const updatedDebitedAccount = await accountSut.findByUserId(user1.id);
		const updatedCreditedAccount = await accountSut.findByUserId(user2.id);
		expect(updatedCreditedAccount?.balance).toBe(145.3);
		expect(updatedDebitedAccount?.balance).toBe(54.7);
	});
});
