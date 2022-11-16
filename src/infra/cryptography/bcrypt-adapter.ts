import { IEncrypter } from "../../application/protocols/encrypter";
import bcrypt from "bcrypt";

export class BcryptAdapter implements IEncrypter {
	private readonly salt: number;

	constructor(salt: number) {
		this.salt = salt;
	}
	verify(password: string): Promise<string | null> {
		throw new Error("Method not implemented.");
	}

	async encrypt(password: string): Promise<string> {
		return await bcrypt.hash(password, this.salt);
	}
}
