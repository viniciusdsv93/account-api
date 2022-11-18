import { IGetAccountBalance } from "../../../domain/usecases/get-account-balance";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, serverError } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { GetAccountBalanceController } from "./get-account-balance";

const makeGetAccountBalanceStub = (): IGetAccountBalance => {
	class GetAccountBalanceStub implements IGetAccountBalance {
		async execute(userId: string): Promise<number> {
			return new Promise((resolve) => resolve(99.5));
		}
	}
	return new GetAccountBalanceStub();
};

type SutTypes = {
	sut: GetAccountBalanceController;
	getAccountBalanceStub: IGetAccountBalance;
};

const makeSut = (): SutTypes => {
	const getAccountBalanceStub = makeGetAccountBalanceStub();
	const sut = new GetAccountBalanceController(getAccountBalanceStub);
	return {
		sut,
		getAccountBalanceStub,
	};
};

const makeFakeRequest = (): HttpRequest => {
	return {
		headers: {
			authorization: "Bearer any_token",
		},
	};
};

describe("Get Account Balance Controller", () => {
	test("Should return 400 if no token is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			headers: {},
		});
		expect(httpResponse).toEqual(badRequest(new MissingParamError("token")));
	});

	test("Should call GetAccountBalanceUsecase with the correct token", async () => {
		const { sut, getAccountBalanceStub } = makeSut();
		const getBalanceSpy = jest.spyOn(getAccountBalanceStub, "execute");
		await sut.handle({
			headers: {
				authorization: "Bearer any_token",
			},
		});
		expect(getBalanceSpy).toHaveBeenCalledWith("any_token");
	});

	test("Should return 500 if GetAccountBalanceUsecase throws", async () => {
		const { sut, getAccountBalanceStub } = makeSut();
		jest.spyOn(getAccountBalanceStub, "execute").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(serverError(new Error()));
	});

	test("Should return the balance value on GetAccountBalanceUsecase success", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(ok({ balance: 99.5 }));
	});
});
