import { IEncrypter } from "../../application/protocols/encrypter";
import bcrypt from "bcrypt";

export class BcryptAdapter implements IEncrypter {
	private readonly salt: number;

	constructor(salt: number) {
		this.salt = salt;
	}

	async encrypt(password: string): Promise<string> {
		return await bcrypt.hash(password, this.salt);
	}
}
