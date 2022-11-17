export interface IAuthentication {
	auth(username: string, password: string): Promise<string>;
}
