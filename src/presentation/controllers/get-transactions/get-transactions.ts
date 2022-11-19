import { IGetTransactions } from "../../../domain/usecases/get-transactions";
import { InvalidParamError } from "../../errors/invalid-param-error";
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

		if (httpRequest.query.date) {
			const date = httpRequest.query.date;
			if (new Date(date).toString() === "Invalid Date") {
				return badRequest(new InvalidParamError("date", "invalid date format"));
			}
		}

		if (httpRequest.query.type) {
			const type = httpRequest.query.type;
			if (type !== "cash-in" && type !== "cash-out") {
				return badRequest(new InvalidParamError("type", "invalid type format"));
			}
		}
		const filters = {
			date: httpRequest.query.date,
			type: httpRequest.query.type,
		};

		await this.getTransactions.execute(filters);

		return new Promise((resolve) => resolve(ok("")));
	}
}
