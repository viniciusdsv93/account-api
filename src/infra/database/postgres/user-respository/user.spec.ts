import { prismaClient } from "../prisma/prisma-client";
import { UserPrismaRepository } from "./user";

describe("User Prisma Repository", () => {
	beforeEach(async () => {
		await prismaClient.user.deleteMany();
	});

	test("Should return an user on success", async () => {
		const sut = new UserPrismaRepository();
		const createdUser = await sut.add({
			username: "valid_username",
			password: "Valid_password1",
		});
		expect(createdUser).toHaveProperty("id");
		expect(createdUser).toHaveProperty("username");
		expect(createdUser).toHaveProperty("password");
	});

	test("Should return true if username is available", async () => {
		const sut = new UserPrismaRepository();
		const isAvailable = await sut.isAvailable("test_username");
		expect(isAvailable).toBe(true);
	});

	test("Should return false if username is unnavailable", async () => {
		const sut = new UserPrismaRepository();
		const createdUser = await sut.add({
			username: "valid_username",
			password: "Valid_password1",
		});
		const isAvailable = await sut.isAvailable("valid_username");
		expect(isAvailable).toBe(false);
	});
});
