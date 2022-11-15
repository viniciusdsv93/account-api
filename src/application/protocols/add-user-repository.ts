import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../domain/usecases/register-user";

export interface IAddUserRepository {
	add(userData: RegisterUserModel): Promise<UserModelWithoutAccountId>;
}
