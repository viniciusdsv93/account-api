//TODO

import { AccountModel } from "../../../domain/models/account";
import { ICreateTransaction } from "../../../domain/usecases/create-transaction";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/find-account-by-user-id-repository";
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

	const makeFindAccountByUserIdRepositoryStub = (): IFindAccountByUserIdRepository => {
		class FindAccountByUserIdRepositoryStub
			implements IFindAccountByUserIdRepository
		{
			async findByUserId(userId: string): Promise<AccountModel | null> {
				return new Promise((resolve) =>
					resolve({
						id: "valid_account_id",
						balance: 87.3,
					})
				);
			}
		}
		return new FindAccountByUserIdRepositoryStub();
	};

	type SutTypes = {
		sut: ICreateTransaction;
		decrypterStub: IDecrypter;
		findAccountByUserIdRepositoryStub: IFindAccountByUserIdRepository;
	};

	const makeSut = (): SutTypes => {
		const decrypterStub = makeDecrypterStub();
		const findAccountByUserIdRepositoryStub = makeFindAccountByUserIdRepositoryStub();
		const sut = new CreateTransaction(
			decrypterStub,
			findAccountByUserIdRepositoryStub
		);
		return {
			sut,
			decrypterStub,
			findAccountByUserIdRepositoryStub,
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

	test("Should throw if Decrypter throws", async () => {
		const { sut, decrypterStub } = makeSut();
		jest.spyOn(decrypterStub, "decrypt").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.execute({
			token: "valid_token",
			creditedUsername: "valid_username",
			value: 99,
		});
		await expect(promise).rejects.toThrow();
	});

	test("Should return null if Decrypter returns null", async () => {
		const { sut, decrypterStub } = makeSut();
		jest.spyOn(decrypterStub, "decrypt").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const payload = await sut.execute({
			token: "valid_token",
			creditedUsername: "valid_username",
			value: 99,
		});
		expect(payload).toBeNull();
	});

	test("Should return an user id on Decrypter success", async () => {
		const { decrypterStub } = makeSut();
		const decrypterResponse = await decrypterStub.decrypt("valid_token");
		expect(decrypterResponse).toHaveProperty("id", "valid_id");
	});

	test("Should call FindAccountByUserIdRepository with the correct user id", async () => {
		const { sut, findAccountByUserIdRepositoryStub } = makeSut();
		const findAccountSpy = jest.spyOn(
			findAccountByUserIdRepositoryStub,
			"findByUserId"
		);
		await sut.execute({
			token: "valid_token",
			creditedUsername: "valid_username",
			value: 99,
		});
		expect(findAccountSpy).toHaveBeenCalledWith("valid_id");
	});
});
