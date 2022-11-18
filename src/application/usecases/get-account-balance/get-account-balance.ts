import { IGetAccountBalance } from "../../../domain/usecases/get-account-balance";
import { IDecrypter } from "../../protocols/cryptography/decrypter";

export class GetAccountBalance implements IGetAccountBalance {
	private readonly decrypter: IDecrypter;

	constructor(decrypter: IDecrypter) {
		this.decrypter = decrypter;
	}

	async execute(token: string): Promise<number> {
		return await this.decrypter.decrypt(token);
	}
}
