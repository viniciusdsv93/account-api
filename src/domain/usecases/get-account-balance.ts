export interface IGetAccountBalance {
	getBalance(userId: string): Promise<number>;
}
