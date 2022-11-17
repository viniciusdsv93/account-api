import { BcryptAdapter } from "./bcrypt-adapter";
import bcrypt from "bcrypt";

jest.mock("bcrypt", () => {
	return {
		async hash(): Promise<string> {
			return await new Promise((resolve) => resolve("hash"));
		},
		async compare(): Promise<boolean> {
			return await new Promise((resolve) => resolve(true));
		},
	};
});

const salt = 12;
const makeSut = () => {
	return new BcryptAdapter(salt);
};

describe("Bcrypt Adapter", () => {
	test("Should call hash with the correct values", async () => {
		const sut = makeSut();
		const hashSpy = jest.spyOn(bcrypt, "hash");
		await sut.hash("any_value");
		expect(hashSpy).toHaveBeenCalledWith("any_value", salt);
	});

	test("Should return a valid hash on success", async () => {
		const sut = makeSut();
		const hash = await sut.hash("any_value");
		expect(hash).toBe("hash");
	});

	test("Should call compare with the correct values", async () => {
		const sut = makeSut();
		const compareSpy = jest.spyOn(bcrypt, "compare");
		await sut.compare("any_value", "any_hash");
		expect(compareSpy).toHaveBeenCalledWith("any_value", "any_hash");
	});

	test("Should return true when compare succeeds", async () => {
		const sut = makeSut();
		const isValid = await sut.compare("any_value", "any_hash");
		expect(isValid).toBe(true);
	});

	test("Should return false when compare fails", async () => {
		const sut = makeSut();
		jest.spyOn(bcrypt, "compare").mockImplementationOnce(
			() => new Promise((resolve) => resolve(false))
		);
		const isValid = await sut.compare("any_value", "any_hash");
		expect(isValid).toBe(false);
	});

	test("Should throw if compare throws", async () => {
		const sut = makeSut();
		jest.spyOn(bcrypt, "compare").mockImplementationOnce(
			() => new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.compare("any_value", "any_hash");
		await expect(promise).rejects.toThrow();
	});
});
