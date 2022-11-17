export interface IEncrypter {
	encrypt(password: string): Promise<string>;
	verify(password: string): Promise<boolean>;
}
