export interface UsernameAvailableRepository {
	isAvailable(username: string): Promise<boolean>;
}
