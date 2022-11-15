export interface IUsernameAvailableRepository {
	isAvailable(username: string): Promise<boolean>;
}
