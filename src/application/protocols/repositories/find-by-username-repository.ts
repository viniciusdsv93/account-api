import { UserModel } from "../../../domain/models/user";

export interface IFindByUsernameRepository {
	findByUsername(username: string): Promise<UserModel | null>;
}
