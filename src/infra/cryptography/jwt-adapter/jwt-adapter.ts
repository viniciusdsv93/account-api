import { IEncrypter } from "../../../application/protocols/cryptography/encrypter";
import jwt from "jsonwebtoken";
import { IDecrypter } from "../../../application/protocols/cryptography/decrypter";

export class JwtAdapter implements IEncrypter, IDecrypter {
	private readonly secret: string;

	constructor(secret: string) {
		this.secret = secret;
	}

	async encrypt(value: string): Promise<string> {
		return jwt.sign({ id: value }, this.secret, {
			expiresIn: "24h",
		});
	}

	async decrypt(value: string): Promise<any> {
		return jwt.verify(value, this.secret);
	}
}
