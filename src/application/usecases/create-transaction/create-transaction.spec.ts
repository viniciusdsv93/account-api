//TODO

import { AccountModel } from "../../../domain/models/account";
import { TransactionModel } from "../../../domain/models/transaction";
import { UserModel } from "../../../domain/models/user";
import { ICreateTransaction } from "../../../domain/usecases/create-transaction";
import { InvalidParamError } from "../../../presentation/errors/invalid-param-error";
import {
	badRequest,
	ok,
	serverError,
	unauthorized,
} from "../../../presentation/helpers/http";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/account/find-account-by-user-id-repository";
import {
	ICreateTransactionRepository,
	TransactionData,
} from "../../protocols/repositories/transaction/create-transaction-repository";
import { IFindUserByUsernameRepository } from "../../protocols/repositories/user/find-user-by-username-repository";
import { CreateTransaction } from "./create-transaction";

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

	const makeFindUserByUsernameRepositoryStub = (): IFindUserByUsernameRepository => {
		class FindUserByUsernameRepositoryStub implements IFindUserByUsernameRepository {
			async findByUsername(username: string): Promise<UserModel | null> {
				return new Promise((resolve) =>
					resolve({
						id: "user_id",
						username: "username",
						password: "hashed_password",
						accountId: "accountId",
					})
				);
			}
		}
		return new FindUserByUsernameRepositoryStub();
	};

	const makeCreateTransactionRepositoryStub = (): ICreateTransactionRepository => {
		class CreateTransactionRepositoryStub implements ICreateTransactionRepository {
			async create(transactionData: TransactionData): Promise<TransactionModel> {
				return new Promise((resolve) =>
					resolve({
						id: "transaction_id",
						debitedAccountId: "debited_account_id",
						creditedAccountId: "credited_account_id",
						value: 55.4,
					})
				);
			}
		}
		return new CreateTransactionRepositoryStub();
	};

	const makeFakeTransaction = () => {
		return {
			token: "valid_token",
			creditedUsername: "valid_username",
			value: 15.25,
		};
	};

	type SutTypes = {
		sut: ICreateTransaction;
		decrypterStub: IDecrypter;
		findAccountByUserIdRepositoryStub: IFindAccountByUserIdRepository;
		findUserByUsernameRepositoryStub: IFindUserByUsernameRepository;
		createTransactionRepositoryStub: ICreateTransactionRepository;
	};

	const makeSut = (): SutTypes => {
		const decrypterStub = makeDecrypterStub();
		const findAccountByUserIdRepositoryStub = makeFindAccountByUserIdRepositoryStub();
		const findUserByUsernameRepositoryStub = makeFindUserByUsernameRepositoryStub();
		const createTransactionRepositoryStub = makeCreateTransactionRepositoryStub();
		const sut = new CreateTransaction(
			decrypterStub,
			findAccountByUserIdRepositoryStub,
			findUserByUsernameRepositoryStub,
			createTransactionRepositoryStub
		);
		return {
			sut,
			decrypterStub,
			findAccountByUserIdRepositoryStub,
			findUserByUsernameRepositoryStub,
			createTransactionRepositoryStub,
		};
	};

	test("Should call Decrypter with the correct token", async () => {
		const { sut, decrypterStub } = makeSut();
		const decrypterSpy = jest.spyOn(decrypterStub, "decrypt");
		await sut.execute(makeFakeTransaction());
		expect(decrypterSpy).toHaveBeenCalledWith("valid_token");
	});

	test("Should throw if Decrypter throws", async () => {
		const { sut, decrypterStub } = makeSut();
		jest.spyOn(decrypterStub, "decrypt").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.execute(makeFakeTransaction());
		await expect(promise).rejects.toThrow();
	});

	test("Should return unauthorized if Decrypter returns null", async () => {
		const { sut, decrypterStub } = makeSut();
		jest.spyOn(decrypterStub, "decrypt").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(unauthorized());
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
		await sut.execute(makeFakeTransaction());
		expect(findAccountSpy).toHaveBeenCalledWith("valid_id");
	});

	test("Should throw if FindAccountByUserIdRepository throws", async () => {
		const { sut, findAccountByUserIdRepositoryStub } = makeSut();
		jest.spyOn(findAccountByUserIdRepositoryStub, "findByUserId").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.execute(makeFakeTransaction());
		await expect(promise).rejects.toThrow();
	});

	test("Should return unauthorized if FindAccountByUserIdRepository returns null", async () => {
		const { sut, findAccountByUserIdRepositoryStub } = makeSut();
		jest.spyOn(findAccountByUserIdRepositoryStub, "findByUserId").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(unauthorized());
	});

	test("Should return an account on FindAccountByUserIdRepository success", async () => {
		const { findAccountByUserIdRepositoryStub } = makeSut();
		const findAccountRepositoryResponse =
			await findAccountByUserIdRepositoryStub.findByUserId("valid_id");
		expect(findAccountRepositoryResponse).toHaveProperty("id");
		expect(findAccountRepositoryResponse).toHaveProperty("balance");
	});

	test("Should call FindUserByUsernameRepository with the correct username", async () => {
		const { sut, findUserByUsernameRepositoryStub } = makeSut();
		const findUserSpy = jest.spyOn(
			findUserByUsernameRepositoryStub,
			"findByUsername"
		);
		await sut.execute(makeFakeTransaction());
		expect(findUserSpy).toHaveBeenCalledWith("valid_username");
	});

	test("Should throw if FindUserByUsernameRepository throws", async () => {
		const { sut, findUserByUsernameRepositoryStub } = makeSut();
		jest.spyOn(
			findUserByUsernameRepositoryStub,
			"findByUsername"
		).mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
		const promise = sut.execute(makeFakeTransaction());
		await expect(promise).rejects.toThrow();
	});

	test("Should return badRequest if FindUserByUsernameRepository returns null", async () => {
		const { sut, findUserByUsernameRepositoryStub } = makeSut();
		jest.spyOn(
			findUserByUsernameRepositoryStub,
			"findByUsername"
		).mockReturnValueOnce(new Promise((resolve) => resolve(null)));
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(
			badRequest(
				new InvalidParamError(
					"creditedUsername",
					"invalid username for receiver account"
				)
			)
		);
	});

	test("Should return an user on FindUserByUsernameRepository success", async () => {
		const { findUserByUsernameRepositoryStub } = makeSut();
		const findUserRepositoryResponse =
			await findUserByUsernameRepositoryStub.findByUsername("valid_username");
		expect(findUserRepositoryResponse).toHaveProperty("id");
		expect(findUserRepositoryResponse).toHaveProperty("username");
		expect(findUserRepositoryResponse).toHaveProperty("password");
		expect(findUserRepositoryResponse).toHaveProperty("accountId");
	});

	test("Should return badRequest if debited account id is equal to credited account id", async () => {
		const { sut } = makeSut();
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(
			badRequest(
				new InvalidParamError(
					"creditedUsername",
					"receiver and sender account must be different"
				)
			)
		);
	});

	test("Should return badRequest if value is higher than debited account's balance", async () => {
		const { sut, findAccountByUserIdRepositoryStub } = makeSut();
		jest.spyOn(findAccountByUserIdRepositoryStub, "findByUserId").mockReturnValueOnce(
			new Promise((resolve) =>
				resolve({
					id: "valid_id",
					balance: 5,
				})
			)
		);
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(
			badRequest(
				new InvalidParamError("value", "insufficient balance for this operation")
			)
		);
	});

	test("Should call CreateTransactionRepository with the correct values", async () => {
		const {
			sut,
			createTransactionRepositoryStub,
			findAccountByUserIdRepositoryStub,
		} = makeSut();
		const randomNumber = Math.random();
		jest.spyOn(findAccountByUserIdRepositoryStub, "findByUserId").mockReturnValueOnce(
			new Promise((resolve) =>
				resolve({
					id: `valid_account_id_${randomNumber}`,
					balance: 87.3,
				})
			)
		);
		const createTransactionSpy = jest.spyOn(
			createTransactionRepositoryStub,
			"create"
		);
		await sut.execute(makeFakeTransaction());
		expect(createTransactionSpy).toHaveBeenCalledWith({
			debitedAccountId: `valid_account_id_${randomNumber}`,
			creditedAccountId: "valid_account_id",
			value: 15.25,
		});
	});

	test("Should return serverError if CreateTransactionRepository returns null", async () => {
		const {
			sut,
			findAccountByUserIdRepositoryStub,
			createTransactionRepositoryStub,
		} = makeSut();
		const randomNumber = Math.random();
		jest.spyOn(findAccountByUserIdRepositoryStub, "findByUserId").mockReturnValueOnce(
			new Promise((resolve) =>
				resolve({
					id: `valid_account_id_${randomNumber}`,
					balance: 87.3,
				})
			)
		);
		jest.spyOn(createTransactionRepositoryStub, "create").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(
			serverError(
				new Error(
					"Error when trying to process the transaction. Please, try again later"
				)
			)
		);
	});

	test("Should return ok with a transaction on CreateTransactionRepository success", async () => {
		const { sut, findAccountByUserIdRepositoryStub } = makeSut();
		const randomNumber = Math.random();
		jest.spyOn(findAccountByUserIdRepositoryStub, "findByUserId").mockReturnValueOnce(
			new Promise((resolve) =>
				resolve({
					id: `valid_account_id_${randomNumber}`,
					balance: 87.3,
				})
			)
		);
		const response = await sut.execute(makeFakeTransaction());
		expect(response).toEqual(
			ok({
				id: "transaction_id",
				debitedAccountId: "debited_account_id",
				creditedAccountId: "credited_account_id",
				value: 55.4,
			})
		);
	});
});
