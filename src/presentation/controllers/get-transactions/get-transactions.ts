import { IGetTransactions } from "../../../domain/usecases/get-transactions";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class GetTransactionsController implements Controller {
	private readonly getTransactions: IGetTransactions;

	constructor(getTransactions: IGetTransactions) {
		this.getTransactions = getTransactions;
	}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		if (!httpRequest.headers.authorization) {
			return badRequest(new MissingParamError("token"));
		}
		return new Promise((resolve) => resolve(ok("")));
	}
}
