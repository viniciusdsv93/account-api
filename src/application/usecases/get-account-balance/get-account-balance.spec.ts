import { IGetAccountBalance } from "../../../domain/usecases/get-account-balance";
import { IDecrypter } from "../../protocols/cryptography/decrypter";
import { GetAccountBalance } from "./get-account-balance";

describe("Get Account Balance UseCase", () => {
	const makeDecrypterStub = (): IDecrypter => {
		class DecrypterStub implements IDecrypter {
			async decrypt(value: string): Promise<any> {
				return new Promise((resolve) => resolve({ id: "valid_id" }));
			}
		}
		return new DecrypterStub();
	};

	type SutTypes = {
		sut: IGetAccountBalance;
		decrypterStub: IDecrypter;
	};

	const makeSut = (): SutTypes => {
		const decrypterStub = makeDecrypterStub();
		const sut = new GetAccountBalance(decrypterStub);
		return {
			sut,
			decrypterStub,
		};
	};

	test("Should call decrypter with the correct token", async () => {
		const { sut, decrypterStub } = makeSut();
		const decrypterSpy = jest.spyOn(decrypterStub, "decrypt");
		await sut.execute("valid_token");
		expect(decrypterSpy).toHaveBeenCalledWith("valid_token");
	});
});
