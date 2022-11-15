export class InvalidParamError extends Error {
	constructor(paramName: string, message: string) {
		super(`Invalid Param: ${paramName}`);
		this.name = "InvalidParamError";
		this.message = message;
	}
}
