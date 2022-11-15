import { UserPrismaRepository } from "./user";

describe("User Prisma Repository", () => {
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
});
