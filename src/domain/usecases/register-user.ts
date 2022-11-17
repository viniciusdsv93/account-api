import { UserModel } from "../models/user";

export type RegisterUserModel = {
	username: string;
	password: string;
};

export type UserModelWithoutAccountId = {
	id: string;
	username: string;
	password: string;
	accessToken?: string | null;
};

export interface IRegisterUser {
	execute(user: RegisterUserModel): Promise<UserModel>;
}
