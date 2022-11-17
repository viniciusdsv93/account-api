import { IHasher } from "../../../application/protocols/cryptography/hasher";
import bcrypt from "bcrypt";
import { IHashComparer } from "../../../application/protocols/cryptography/hash-comparer";

export class BcryptAdapter implements IHasher, IHashComparer {
	private readonly salt: number;

	constructor(salt: number) {
		this.salt = salt;
	}

	async compare(value: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(value, hash);
	}

	async hash(password: string): Promise<string> {
		return await bcrypt.hash(password, this.salt);
	}
}
