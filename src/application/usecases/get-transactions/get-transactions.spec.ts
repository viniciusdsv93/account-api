import { TransactionModel } from "../../../domain/models/transaction";
import {
	GetTransactionsModel,
	IGetTransactions,
} from "../../../domain/usecases/get-transactions";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IGetTransactionsRepository } from "../../protocols/repositories/transaction/get-transactions-repository";
import { GetTransactions } from "./get-transactions";

describe("Get Account Balance UseCase", () => {
	const makeDecrypterStub = (): IDecrypter => {
		class DecrypterStub implements IDecrypter {
			async decrypt(value: string): Promise<any> {
				return new Promise((resolve) => resolve({ id: "valid_id" }));
			}
		}
		return new DecrypterStub();
	};

	const makeGetTransactionsRepositoryStub = (): IGetTransactionsRepository => {
		class GetTransactionsRepositoryStub implements IGetTransactionsRepository {
			async get(
				token: string,
				filters: GetTransactionsModel
			): Promise<TransactionModel[] | null> {
				return new Promise((resolve) =>
					resolve([
						{
							id: "transction_id",
							debitedAccountId: "debited_account_id",
							creditedAccountId: "credited_account_id",
							value: 77.5,
						},
					])
				);
			}
		}
		return new GetTransactionsRepositoryStub();
	};

	type SutTypes = {
		sut: IGetTransactions;
		decrypterStub: IDecrypter;
		getTransactionsRepository: IGetTransactionsRepository;
	};

	const makeSut = (): SutTypes => {
		const decrypterStub = makeDecrypterStub();
		const getTransactionsRepository = makeGetTransactionsRepositoryStub();
		const sut = new GetTransactions(decrypterStub, getTransactionsRepository);
		return {
			sut,
			decrypterStub,
			getTransactionsRepository,
		};
	};

	const makeFakeFilters = (): GetTransactionsModel => {
		return {
			date: "2022-10-30",
			type: "cash-out",
		};
	};

	test("Should call Decrypter with the correct token", async () => {
		const { sut, decrypterStub } = makeSut();
		const decrypterSpy = jest.spyOn(decrypterStub, "decrypt");
		await sut.execute("valid_token", makeFakeFilters());
		expect(decrypterSpy).toHaveBeenCalledWith("valid_token");
	});

	test("Should throw if Decrypter throws", async () => {
		const { sut, decrypterStub } = makeSut();
		jest.spyOn(decrypterStub, "decrypt").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.execute("valid_token", makeFakeFilters());
		await expect(promise).rejects.toThrow();
	});

	test("Should return null if Decrypter returns null", async () => {
		const { sut, decrypterStub } = makeSut();
		jest.spyOn(decrypterStub, "decrypt").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const payload = await sut.execute("valid_token", makeFakeFilters());
		expect(payload).toBeNull();
	});

	test("Should return an user id on Decrypter success", async () => {
		const { decrypterStub } = makeSut();
		const decrypterResponse = await decrypterStub.decrypt("valid_token");
		expect(decrypterResponse).toHaveProperty("id", "valid_id");
	});

	test("Should call GetTransactionsRepository with the correct values", async () => {
		const { sut, getTransactionsRepository } = makeSut();
		const getTransactionsSpy = jest.spyOn(getTransactionsRepository, "get");
		await sut.execute("valid_token", makeFakeFilters());
		expect(getTransactionsSpy).toHaveBeenCalledWith("valid_id", makeFakeFilters());
	});

	test("Should throw if GetTransactionsRepository throws", async () => {
		const { sut, getTransactionsRepository } = makeSut();
		jest.spyOn(getTransactionsRepository, "get").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.execute("valid_token", makeFakeFilters());
		await expect(promise).rejects.toThrow();
	});

	test("Should return null if GetTransactionsRepository returns null", async () => {
		const { sut, getTransactionsRepository } = makeSut();
		jest.spyOn(getTransactionsRepository, "get").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const response = await sut.execute("valid_token", makeFakeFilters());
		expect(response).toBeNull();
	});

	// test("Should return an account on FindAccountByUserIdRepository success", async () => {
	// 	const { findAccountByUserIdRepositoryStub } = makeSut();
	// 	const findAccountRepositoryResponse =
	// 		await findAccountByUserIdRepositoryStub.findByUserId("valid_id");
	// 	expect(findAccountRepositoryResponse).toHaveProperty("id");
	// 	expect(findAccountRepositoryResponse).toHaveProperty("balance");
	// });

	// test("Should return an account's balance on success", async () => {
	// 	const { sut } = makeSut();
	// 	const response = await sut.execute("valid_token");
	// 	expect(response).toEqual(99.5);
	// });
});
