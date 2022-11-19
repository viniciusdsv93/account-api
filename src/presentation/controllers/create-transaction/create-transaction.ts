import { ICreateTransaction } from "../../../domain/usecases/create-transaction";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class CreateTransactionController implements Controller {
	private readonly createTransaction: ICreateTransaction;

	constructor(createTransaction: ICreateTransaction) {
		this.createTransaction = createTransaction;
	}

	async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
		try {
			const requiredFields = ["creditedUsername", "value"];
			for (const field of requiredFields) {
				if (!httpRequest.body[field]) {
					return badRequest(new MissingParamError(field));
				}
			}

			if (!httpRequest.headers.authorization) {
				return unauthorized();
			}

			const { creditedUsername, value } = httpRequest.body;

			const token = httpRequest.headers.authorization.split(" ")[1];

			const transactionCreated = await this.createTransaction.execute({
				token: token,
				creditedUsername,
				value,
			});

			if (!transactionCreated) {
				return unauthorized();
			}

			// TODO handle error responses
			return new Promise((resolve) => resolve(ok("")));
		} catch (error) {
			return serverError(error as Error);
		}
	}
}
