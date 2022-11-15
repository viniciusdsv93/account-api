import { UserModel } from "../models/user";

export type RegisterUserModel = {
	username: string;
	password: string;
	passwordConfirmation: string;
};

export interface RegisterUser {
	execute: (user: RegisterUserModel) => Promise<UserModel>;
}
