export type RegisterUserModel = {
	username: string;
	password: string;
	passwordConfirmation: string;
};

export type UserModelWithoutAccountId = {
	id: string;
	username: string;
	password: string;
};

export interface RegisterUser {
	execute: (user: RegisterUserModel) => Promise<UserModelWithoutAccountId>;
}
