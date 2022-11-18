export interface IGetAccountBalance {
	execute(userId: string): Promise<number>;
}
