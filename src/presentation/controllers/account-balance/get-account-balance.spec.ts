import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, unauthorized } from "../../helpers/http";
import { GetAccountBalanceController } from "./get-account-balance";

describe("Get Account Balance Controller", () => {
	test("Should return 400 if no token is provided", async () => {
		const sut = new GetAccountBalanceController();
		const httpResponse = await sut.handle({
			headers: {},
		});
		expect(httpResponse).toEqual(badRequest(new MissingParamError("token")));
	});
});
