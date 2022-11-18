export interface IGetAccountBalance {
	execute(token: string): Promise<number | null>;
}
