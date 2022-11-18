import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, unauthorized } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class GetAccountBalanceController implements Controller {
	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		if (!httpRequest.headers.authorization) {
			return badRequest(new MissingParamError("token"));
		}
		return ok("");
	}
}
