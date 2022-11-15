import { AccountPrismaRepository } from "./account";

describe("Account Prisma Repository", () => {
	test("Should return an account on success", async () => {
		const sut = new AccountPrismaRepository();
		const createdAccount = await sut.add();
		expect(createdAccount).toHaveProperty("id");
		expect(createdAccount).toHaveProperty("balance");
	});
});
