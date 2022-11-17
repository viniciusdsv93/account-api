export interface IHasher {
	hash(password: string): Promise<string>;
	verify(password: string): Promise<boolean>;
}
