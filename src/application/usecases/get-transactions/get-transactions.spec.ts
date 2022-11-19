import { AccountModel } from "../../../domain/models/account";
import { TransactionModel } from "../../../domain/models/transaction";
import {
	GetTransactionsModel,
	IGetTransactions,
} from "../../../domain/usecases/get-transactions";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/account/find-account-by-user-id-repository";
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

	const makeFindAccountByUserIdRepositoryStub = (): IFindAccountByUserIdRepository => {
		class FindAccountByUserIdRepositoryStub
			implements IFindAccountByUserIdRepository
		{
			async findByUserId(userId: string): Promise<AccountModel | null> {
				return new Promise((resolve) => resolve(makeFakeAccount()));
			}
		}
		return new FindAccountByUserIdRepositoryStub();
	};

	const makeGetTransactionsRepositoryStub = (): IGetTransactionsRepository => {
		class GetTransactionsRepositoryStub implements IGetTransactionsRepository {
			async get(
				accountId: string,
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

	const makeFakeAccount = (): AccountModel => {
		return {
			id: "valid_account_id",
			balance: 99.5,
		};
	};

	const makeFakeFilters = (): GetTransactionsModel => {
		return {
			date: "2022-10-30",
			type: "cash-out",
		};
	};

	type SutTypes = {
		sut: IGetTransactions;
		decrypterStub: IDecrypter;
		findAccountByUserIdRepositoryStub: IFindAccountByUserIdRepository;
		getTransactionsRepository: IGetTransactionsRepository;
	};

	const makeSut = (): SutTypes => {
		const decrypterStub = makeDecrypterStub();
		const findAccountByUserIdRepositoryStub = makeFindAccountByUserIdRepositoryStub();
		const getTransactionsRepository = makeGetTransactionsRepositoryStub();
		const sut = new GetTransactions(
			decrypterStub,
			findAccountByUserIdRepositoryStub,
			getTransactionsRepository
		);
		return {
			sut,
			decrypterStub,
			findAccountByUserIdRepositoryStub,
			getTransactionsRepository,
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

	test("Should call FindAccountByUserIdRepository with the correct user id", async () => {
		const { sut, findAccountByUserIdRepositoryStub } = makeSut();
		const findAccountSpy = jest.spyOn(
			findAccountByUserIdRepositoryStub,
			"findByUserId"
		);
		await sut.execute("valid_token", makeFakeFilters());
		expect(findAccountSpy).toHaveBeenCalledWith("valid_id");
	});

	test("Should call GetTransactionsRepository with the correct values", async () => {
		const { sut, getTransactionsRepository } = makeSut();
		const getTransactionsSpy = jest.spyOn(getTransactionsRepository, "get");
		await sut.execute("valid_token", makeFakeFilters());
		expect(getTransactionsSpy).toHaveBeenCalledWith(
			"valid_account_id",
			makeFakeFilters()
		);
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

	test("Should return an array of transactions on GetTransactionsRepository success", async () => {
		const { getTransactionsRepository } = makeSut();
		const getTransactionsRepositoryResponse = await getTransactionsRepository.get(
			"valid_id",
			makeFakeFilters()
		);
		const expected = [
			{
				creditedAccountId: "credited_account_id",
				debitedAccountId: "debited_account_id",
				id: "transction_id",
				value: 77.5,
			},
		];
		expect(getTransactionsRepositoryResponse).toEqual(
			expect.arrayContaining(expected)
		);
	});

	test("Should return an array of transactions on success", async () => {
		const { sut } = makeSut();
		const response = await sut.execute("valid_token", makeFakeFilters());
		const expected = [
			{
				creditedAccountId: "credited_account_id",
				debitedAccountId: "debited_account_id",
				id: "transction_id",
				value: 77.5,
			},
		];
		expect(response).toEqual(expect.arrayContaining(expected));
	});
});
