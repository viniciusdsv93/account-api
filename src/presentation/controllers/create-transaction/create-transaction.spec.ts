import { TransactionModel } from "../../../domain/models/transaction";
import {
	CreateTransactionModel,
	ICreateTransaction,
} from "../../../domain/usecases/create-transaction";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, serverError, unauthorized } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { CreateTransactionController } from "./create-transaction";

describe("Create Transaction Controller", () => {
	const makeCreateTransactionStub = (): ICreateTransaction => {
		class CreateTransactionStub implements ICreateTransaction {
			async execute(
				transactionData: CreateTransactionModel
			): Promise<TransactionModel> {
				return new Promise((resolve) =>
					resolve({
						id: "valid_transaction_id",
						debitedAccountId: "valid_debited_account_id",
						creditedAccountId: "valid_credited_account_id",
						value: 99,
					})
				);
			}
		}
		return new CreateTransactionStub();
	};

	const makeFakeRequest = (): HttpRequest => {
		return {
			body: {
				creditedUsername: "any_credited_username",
				value: 99,
			},
			headers: {
				authorization: "Bearer any_token",
			},
		};
	};

	type SutTypes = {
		sut: CreateTransactionController;
		createTransactionStub: ICreateTransaction;
	};

	const makeSut = (): SutTypes => {
		const createTransactionStub = makeCreateTransactionStub();
		const sut = new CreateTransactionController(createTransactionStub);
		return {
			sut,
			createTransactionStub,
		};
	};

	test("Should return 400 if no creditedUsername is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			body: {
				value: 99,
			},
			headers: {
				authorization: "Bearer any_token",
			},
		});
		expect(httpResponse).toEqual(
			badRequest(new MissingParamError("creditedUsername"))
		);
	});

	test("Should return 400 if no value is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			body: {
				creditedUsername: "any_credited_username",
			},
			headers: {
				authorization: "Bearer any_token",
			},
		});
		expect(httpResponse).toEqual(badRequest(new MissingParamError("value")));
	});

	test("Should return 401 if no token is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			body: {
				creditedUsername: "any_credited_username",
				value: 99,
			},
			headers: {},
		});
		expect(httpResponse).toEqual(unauthorized());
	});

	test("Should call CreateTransaction with correct values", async () => {
		const { sut, createTransactionStub } = makeSut();
		const createTransactionSpy = jest.spyOn(createTransactionStub, "execute");
		await sut.handle(makeFakeRequest());
		expect(createTransactionSpy).toHaveBeenCalledWith({
			token: "any_token",
			creditedUsername: "any_credited_username",
			value: 99,
		});
	});

	test("Should return 500 if CreateTransaction throws", async () => {
		const { sut, createTransactionStub } = makeSut();
		jest.spyOn(createTransactionStub, "execute").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(serverError(new Error()));
	});

	test("Should return 401 if CreateTransaction fails", async () => {
		const { sut, createTransactionStub } = makeSut();
		jest.spyOn(createTransactionStub, "execute").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(unauthorized());
	});
});
