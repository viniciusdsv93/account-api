import { UserModel } from "../../../domain/models/user";

export interface IFindUserByUsernameRepository {
	findByUsername(username: string): Promise<UserModel | null>;
}
