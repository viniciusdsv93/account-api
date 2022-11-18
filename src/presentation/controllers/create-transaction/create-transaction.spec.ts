import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, unauthorized } from "../../helpers/http";
import { CreateTransactionController } from "./create-transaction";

describe("Create Transaction Controller", () => {
	type SutTypes = {
		sut: CreateTransactionController;
	};

	const makeSut = (): SutTypes => {
		const sut = new CreateTransactionController();
		return {
			sut,
		};
	};

	test("Should return 400 if no creditedUsername is provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle({
			body: {
				debitedUsername: "any_debited_username",
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
				debitedUsername: "any_debited_username",
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
				debitedUsername: "any_debited_username",
				value: 99,
			},
			headers: {},
		});
		expect(httpResponse).toEqual(unauthorized());
	});
});
