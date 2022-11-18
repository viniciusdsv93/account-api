import { IGetAccountBalance } from "../../../domain/usecases/get-account-balance";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class GetAccountBalanceController implements Controller {
	private readonly getAccountBalance: IGetAccountBalance;

	constructor(getAccountBalance: IGetAccountBalance) {
		this.getAccountBalance = getAccountBalance;
	}
	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
			if (!httpRequest.headers.authorization) {
				return badRequest(new MissingParamError("token"));
			}
			const token = httpRequest.headers.authorization.split(" ")[1];
			const balanceValue = await this.getAccountBalance.execute(token);
			return ok({ value: balanceValue });
		} catch (error) {
			return serverError(error as Error);
		}
	}
}
