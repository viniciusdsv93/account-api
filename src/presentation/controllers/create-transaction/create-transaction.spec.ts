import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
import { CreateTransactionController } from "./create-transaction";

describe("Create Transaction Controller", () => {
	test("Should return 400 if no debitedUsername is provided", async () => {
		const sut = new CreateTransactionController();
		const httpResponse = await sut.handle({
			body: {
				creditedUsername: "any_credited_username",
				value: 99,
			},
		});
		expect(httpResponse).toEqual(
			badRequest(new MissingParamError("debitedUsername"))
		);
	});

	test("Should return 400 if no creditedUsername is provided", async () => {
		const sut = new CreateTransactionController();
		const httpResponse = await sut.handle({
			body: {
				debitedUsername: "any_debited_username",
				value: 99,
			},
		});
		expect(httpResponse).toEqual(
			badRequest(new MissingParamError("creditedUsername"))
		);
	});
});
