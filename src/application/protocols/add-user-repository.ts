import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../domain/usecases/registerUser";

export interface IAddUserRepository {
	add(userData: RegisterUserModel): Promise<UserModelWithoutAccountId>;
}
