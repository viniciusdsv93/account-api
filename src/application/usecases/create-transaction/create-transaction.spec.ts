//TODO

import { ICreateTransaction } from "../../../domain/usecases/create-transaction";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { CreateTransaction } from "./create-transaction";

//verify token
//get debited account's userId by token

// check if credited and debited accounts are from different people

//get credited acount's userId by username

// check if value is lower than balance

// call repositories

describe("Create Transaction UseCase", () => {
	const makeDecrypterStub = (): IDecrypter => {
		class DecrypterStub implements IDecrypter {
			async decrypt(value: string): Promise<any> {
				return new Promise((resolve) => resolve({ id: "valid_id" }));
			}
		}
		return new DecrypterStub();
	};

	type SutTypes = {
		sut: ICreateTransaction;
		decrypterStub: IDecrypter;
	};

	const makeSut = (): SutTypes => {
		const decrypterStub = makeDecrypterStub();
		const sut = new CreateTransaction(decrypterStub);
		return {
			sut,
			decrypterStub,
		};
	};

	test("Should call Decrypter with the correct token", async () => {
		const { sut, decrypterStub } = makeSut();
		const decrypterSpy = jest.spyOn(decrypterStub, "decrypt");
		await sut.execute({
			token: "valid_token",
			creditedUsername: "valid_username",
			value: 99,
		});
		expect(decrypterSpy).toHaveBeenCalledWith("valid_token");
	});
});
