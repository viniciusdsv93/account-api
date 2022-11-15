import { RegisterUserModel } from "../../domain/usecases/registerUser";
import { IEncrypter } from "../protocols/encrypter";
import { RegisterUser } from "./register-user";

const makeEncrypterStub = (): IEncrypter => {
	class EncrypterStub implements IEncrypter {
		async encrypt(password: string): Promise<string> {
			return await new Promise((resolve) => resolve(password));
		}
	}
	return new EncrypterStub();
};

const makeFakeUserData = (): RegisterUserModel => {
	return {
		username: "valid_username",
		password: "Valid_password1",
	};
};

type SutTypes = {
	sut: RegisterUser;
	encrypterStub: IEncrypter;
};

const makeSut = (): SutTypes => {
	const encrypterStub = makeEncrypterStub();
	const sut = new RegisterUser(encrypterStub);
	return {
		sut,
		encrypterStub,
	};
};

describe("Register User Usecase", () => {
	test("Should call Encrypter with the correct password", async () => {
		const { sut, encrypterStub } = makeSut();
		const encrypterStubSpy = jest.spyOn(encrypterStub, "encrypt");
		await sut.execute(makeFakeUserData());
		expect(encrypterStubSpy).toHaveBeenCalledWith("Valid_password1");
	});
});
