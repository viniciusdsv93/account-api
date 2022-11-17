import { IEncrypter } from "../../../application/protocols/cryptography/encrypter";
import jwt from "jsonwebtoken";

export class JwtAdapter implements IEncrypter {
	private readonly secret: string;

	constructor(secret: string) {
		this.secret = secret;
	}

	async encrypt(value: string): Promise<string> {
		return jwt.sign({ id: value }, this.secret);
	}
}
