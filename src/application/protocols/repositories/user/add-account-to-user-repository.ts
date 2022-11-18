import { UserModel } from "../../../../domain/models/user";

export interface IAddAccountToUserRepository {
	change(userId: string, accountId: string): Promise<UserModel>;
}
