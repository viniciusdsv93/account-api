import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, unauthorized } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class CreateTransactionController implements Controller {
	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		const requiredFields = ["creditedUsername", "value"];
		for (const field of requiredFields) {
			if (!httpRequest.body[field]) {
				return badRequest(new MissingParamError(field));
			}
		}

		if (!httpRequest.headers.authorization) {
			return unauthorized();
		}

		return new Promise((resolve) => resolve(ok("")));
	}
}
