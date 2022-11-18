import { IGetAccountBalance } from "../../../domain/usecases/get-account-balance";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { IFindAccountByUserIdRepository } from "../../protocols/repositories/find-account-by-user-id-repository";

export class GetAccountBalance implements IGetAccountBalance {
	private readonly decrypter: IDecrypter;
	private readonly findAccountByUserIdRepository: IFindAccountByUserIdRepository;

	constructor(
		decrypter: IDecrypter,
		findAccountByUserIdRepository: IFindAccountByUserIdRepository
	) {
		this.decrypter = decrypter;
		this.findAccountByUserIdRepository = findAccountByUserIdRepository;
	}

	async execute(token: string): Promise<number | null> {
		try {
			const payload = await this.decrypter.decrypt(token);
			if (payload) {
				const { id } = payload;
				const account = await this.findAccountByUserIdRepository.findByUserId(id);
				if (account) {
					return account.balance;
				}
			}
			return null;
		} catch (error) {
			return null;
		}
	}
}
