import { TransactionModel } from "../../../domain/models/transaction";
import {
	GetTransactionsModel,
	IGetTransactions,
} from "../../../domain/usecases/get-transactions";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { GetTransactionsController } from "./get-transactions";

const makeGetTransactionsStub = (): IGetTransactions => {
	class GetTransactionsStub implements IGetTransactions {
		async execute(
			token: string,
			filters: GetTransactionsModel
		): Promise<TransactionModel[]> {
			return new Promise((resolve) =>
				resolve([
					{
						id: "transaction_id",
						debitedAccountId: "debited_account_id",
						creditedAccountId: "credited_account_id",
						value: 55.4,
					},
				])
			);
		}
	}
	return new GetTransactionsStub();
};

type SutTypes = {
	sut: GetTransactionsController;
	getTransactionsStub: IGetTransactions;
};

const makeSut = (): SutTypes => {
	const getTransactionsStub = makeGetTransactionsStub();
	const sut = new GetTransactionsController(getTransactionsStub);
	return {
		sut,
		getTransactionsStub,
	};
};

const makeFakeRequest = (): HttpRequest => {
	return {
		headers: {
			authorization: "Bearer any_token",
		},
		query: {
			date: "2022-10-30",
			type: "cash-out",
		},
	};
};

describe("Get Transactions Controller", () => {
	test("Should return 400 if no token is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			headers: {},
		});
		expect(httpResponse).toEqual(badRequest(new MissingParamError("token")));
	});

	test("Should return 400 if invalid date filter is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			headers: {
				authorization: "Bearer any_token",
			},
			query: {
				date: "202210-30",
				type: "cash-out",
			},
		});
		expect(httpResponse).toEqual(
			badRequest(new InvalidParamError("date", "invalid date format"))
		);
	});

	test("Should return 400 if invalid type filter is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			headers: {
				authorization: "Bearer any_token",
			},
			query: {
				date: "2022-10-30",
				type: "cashout",
			},
		});
		expect(httpResponse).toEqual(
			badRequest(new InvalidParamError("type", "invalid type format"))
		);
	});

	test("Should call GetTransactionsUsecase with the correct filter values", async () => {
		const { sut, getTransactionsStub } = makeSut();
		const getTransactionsSpy = jest.spyOn(getTransactionsStub, "execute");
		await sut.handle(makeFakeRequest());
		expect(getTransactionsSpy).toHaveBeenCalledWith("any_token", {
			date: "2022-10-30",
			type: "cash-out",
		});
	});

	test("Should call GetTransactionsUsecase with undefined filters when no filters are provided", async () => {
		const { sut, getTransactionsStub } = makeSut();
		const getTransactionsSpy = jest.spyOn(getTransactionsStub, "execute");
		await sut.handle({
			headers: {
				authorization: "Bearer any_token",
			},
		});
		expect(getTransactionsSpy).toHaveBeenCalledWith("any_token", {
			date: undefined,
			type: undefined,
		});
	});

	test("Should return 401 if GetTransactionsUsecase returns null", async () => {
		const { sut, getTransactionsStub } = makeSut();
		jest.spyOn(getTransactionsStub, "execute").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(unauthorized());
	});

	test("Should return 500 if GetTransactionsUsecase throws", async () => {
		const { sut, getTransactionsStub } = makeSut();
		jest.spyOn(getTransactionsStub, "execute").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(serverError(new Error()));
	});

	test("Should return an array of transactions on success", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(
			ok([
				{
					id: "transaction_id",
					debitedAccountId: "debited_account_id",
					creditedAccountId: "credited_account_id",
					value: 55.4,
				},
			])
		);
	});

	// test returns unauthorized if get transactions usecase returns null
});
