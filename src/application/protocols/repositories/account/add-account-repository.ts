import { AccountModel } from "../../../../domain/models/account";

export interface IAddAccountRepository {
	add(userId: string): Promise<AccountModel>;
}
