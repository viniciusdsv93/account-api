export type AuthenticationModel = {
	username: string;
	password: string;
};

export interface IAuthentication {
	auth(authentication: AuthenticationModel): Promise<string | null>;
}
