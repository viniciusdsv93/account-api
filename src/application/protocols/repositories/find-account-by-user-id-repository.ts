import { AccountModel } from "../../../domain/models/account";

export interface IFindAccountByUserIdRepository {
	findByUserId(userId: string): Promise<AccountModel | null>;
}
