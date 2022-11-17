import { IHasher } from "../../application/protocols/cryptography/hasher";
import bcrypt from "bcrypt";

export class BcryptAdapter implements IHasher {
	private readonly salt: number;

	constructor(salt: number) {
		this.salt = salt;
	}
	verify(password: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}

	async hash(password: string): Promise<string> {
		return await bcrypt.hash(password, this.salt);
	}
}
