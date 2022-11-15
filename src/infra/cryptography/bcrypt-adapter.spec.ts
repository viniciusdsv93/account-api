import { BcryptAdapter } from "./bcrypt-adapter";
import bcrypt from "bcrypt";

jest.mock("bcrypt", () => {
	return {
		async hash(): Promise<string> {
			return await new Promise((resolve) => resolve("hash"));
		},
	};
});

const salt = 12;
const makeSut = () => {
	return new BcryptAdapter(salt);
};

describe("Bcrypt Adapter", () => {
	test("Should call bcrypt with the correct values", async () => {
		const sut = makeSut();
		const hashSpy = jest.spyOn(bcrypt, "hash");
		await sut.encrypt("any_value");
		expect(hashSpy).toHaveBeenCalledWith("any_value", salt);
	});

	test("Should return a hash on success", async () => {
		const sut = makeSut();
		const hash = await sut.encrypt("any_value");
		expect(hash).toBe("hash");
	});
});