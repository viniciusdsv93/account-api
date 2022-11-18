import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class CreateTransactionController implements Controller {
	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		const requiredFields = ["debitedUsername", "creditedUsername", "value"];
		for (const field of requiredFields) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field));
			}
		}

		return new Promise((resolve) => resolve(ok("")));
	}
}
