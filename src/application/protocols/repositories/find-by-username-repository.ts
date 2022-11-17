import { UserModel } from "../../../domain/models/user";

export interface IFindByUsernameRepository {
	find(username: string): Promise<UserModel | null>;
}
