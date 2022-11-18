import jwt, { verify } from "jsonwebtoken";
import { JwtAdapter } from "./jwt-adapter";

jest.mock("jsonwebtoken", () => {
	return {
		async sign(): Promise<string> {
			return new Promise((resolve) => resolve("any_token"));
		},
		async verify(): Promise<string> {
			return new Promise((resolve) => resolve("valid_payload"));
		},
	};
});

const makeSut = (): JwtAdapter => {
	return new JwtAdapter("secret");
};

describe("JWT Adapter", () => {
	test("Should call sign with correct values", async () => {
		const sut = makeSut();
		const signSpy = jest.spyOn(jwt, "sign");
		await sut.encrypt("any_id");
		expect(signSpy).toHaveBeenCalledWith({ id: "any_id" }, "secret", {
			expiresIn: "24h",
		});
	});

	test("Should throw if sign throws", async () => {
		const sut = makeSut();
		jest.spyOn(jwt, "sign").mockImplementationOnce(() => {
			throw new Error();
		});
		const promise = sut.encrypt("any_id");
		await expect(promise).rejects.toThrow();
	});

	test("Should return a token on sign success", async () => {
		const sut = makeSut();
		const accessToken = await sut.encrypt("any_id");
		expect(accessToken).toBe("any_token");
	});

	test("Should call verify with correct token", async () => {
		const sut = makeSut();
		const verifySpy = jest.spyOn(jwt, "verify");
		await sut.decrypt("any_token");
		expect(verifySpy).toHaveBeenCalledWith("any_token", "secret");
	});

	test("Should throw if verify throws", async () => {
		const sut = makeSut();
		jest.spyOn(jwt, "verify").mockImplementationOnce(() => {
			throw new Error();
		});
		const promise = sut.decrypt("any_token");
		await expect(promise).rejects.toThrow();
	});
});
