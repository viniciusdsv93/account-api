import { GetTransactionsModel } from "../../../../domain/usecases/get-transactions";
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

	const makeFakeFilters = (): GetTransactionsModel => {
		return {
			date: undefined,
			type: undefined,
		};
	};

	const makePreTransaction = async () => {
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
		return {
			sut,
			accountSut,
			userSut,
			debitedAccount,
			creditedAccount,
			createdTransaction,
			user1,
			user2,
		};
	};

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
		const { createdTransaction } = await makePreTransaction();
		expect(createdTransaction).toHaveProperty("id");
		expect(createdTransaction).toHaveProperty("debitedAccountId");
		expect(createdTransaction).toHaveProperty("creditedAccountId");
		expect(createdTransaction).toHaveProperty("value");
		expect(createdTransaction).toHaveProperty("createdAt");
	});

	test("Should subtract on debited account and sum on credited account on create success", async () => {
		const { accountSut, user1, user2 } = await makePreTransaction();
		const updatedDebitedAccount = await accountSut.findByUserId(user1.id);
		const updatedCreditedAccount = await accountSut.findByUserId(user2.id);
		expect(updatedCreditedAccount?.balance).toBe(145.3);
		expect(updatedDebitedAccount?.balance).toBe(54.7);
	});

	test("Should return an array of transactions on get success", async () => {
		const { sut, debitedAccount } = await makePreTransaction();
		const result = await sut.get(debitedAccount.id, makeFakeFilters());
		expect(result).toContainEqual(
			expect.objectContaining({
				createdAt: expect.anything(),
				creditedAccountId: expect.anything(),
				debitedAccountId: expect.anything(),
				id: expect.anything(),
				value: expect.anything(),
			})
		);
	});

	test("Should return only transactions with the informed account as debited when type informed in filters is equal to 'cash-out'", async () => {
		const { sut, debitedAccount } = await makePreTransaction();
		const result = await sut.get(debitedAccount.id, {
			date: undefined,
			type: "cash-out",
		});
		expect(result).toContainEqual(
			expect.objectContaining({
				createdAt: expect.anything(),
				creditedAccountId: expect.anything(),
				debitedAccountId: debitedAccount.id,
				id: expect.anything(),
				value: expect.anything(),
			})
		);
	});

	test("Should return only transactions with the informed account as credited when type informed in filters is equal to 'cash-in'", async () => {
		const { sut, debitedAccount } = await makePreTransaction();
		const result = await sut.get(debitedAccount.id, {
			date: undefined,
			type: "cash-in",
		});
		expect(result).toEqual([]);
	});
});
