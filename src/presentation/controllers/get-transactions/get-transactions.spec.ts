import { TransactionModel } from "../../../domain/models/transaction";
import {
	GetTransactionsModel,
	IGetTransactions,
} from "../../../domain/usecases/get-transactions";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { GetTransactionsController } from "./get-transactions";

const makeGetTransactionsStub = (): IGetTransactions => {
	class GetTransactionsStub implements IGetTransactions {
		async execute(
			filters?: GetTransactionsModel | undefined
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
});
