import { RegisterUserModel } from "../../../../domain/usecases/register-user";
import { AccountPrismaRepository } from "../account-repository/account";
import { prismaClient } from "../prisma/prisma-client";
import { UserPrismaRepository } from "./user";

describe("User Prisma Repository", () => {
	beforeEach(async () => {
		await prismaClient.account.deleteMany();
		await prismaClient.user.deleteMany();
	});

	const makeUserData = (): RegisterUserModel => {
		return {
			username: "valid_username",
			password: "Valid_password1",
		};
	};

	type SutTypes = {
		sut: UserPrismaRepository;
	};

	const makeSut = (): SutTypes => {
		const sut = new UserPrismaRepository();
		return {
			sut,
		};
	};

	test("Should return an user on add success", async () => {
		const { sut } = makeSut();
		const createdUser = await sut.add(makeUserData());
		expect(createdUser).toHaveProperty("id");
		expect(createdUser).toHaveProperty("username");
		expect(createdUser).toHaveProperty("password");
	});

	test("Should return true if username is available", async () => {
		const { sut } = makeSut();
		const isAvailable = await sut.isAvailable("valid_username");
		expect(isAvailable).toBe(true);
	});

	test("Should return false if username is unnavailable", async () => {
		const { sut } = makeSut();
		await sut.add(makeUserData());
		const isAvailable = await sut.isAvailable("valid_username");
		expect(isAvailable).toBe(false);
	});

	test("Should add an accountId on User", async () => {
		const { sut } = makeSut();
		const accountSut = new AccountPrismaRepository();
		const createdUser = await sut.add(makeUserData());
		const createdAccount = await accountSut.add(createdUser.id);
		const modifiedUser = await sut.change(createdUser.id, createdAccount.id);
		expect(modifiedUser.accountId).toEqual(createdAccount.id);
	});

	test("Should return an user on findByUsername success", async () => {
		const { sut } = makeSut();
		const createdUser = await sut.add(makeUserData());
		const findUserByUsername = await sut.findByUsername(createdUser.username);
		expect(findUserByUsername?.id).toBeTruthy();
		expect(findUserByUsername?.username).toEqual("valid_username");
		expect(findUserByUsername?.password).toEqual("Valid_password1");
	});

	test("Should return null if the username provided is not registered", async () => {
		const { sut } = makeSut();
		await sut.add(makeUserData());
		const findUserByUsername = await sut.findByUsername("another_username");
		expect(findUserByUsername).toBeNull();
	});
});
