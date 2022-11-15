import { IEncrypter } from "../protocols/encrypter";
import { RegisterUser } from "./register-user";

describe("Register User Usecase", () => {
	test("Should call Encrypter with the correct password", async () => {
		class Encrypter implements IEncrypter {
			async encrypt(password: string): Promise<string> {
				return await new Promise((resolve) => resolve(password));
			}
		}
		const encrypterStub = new Encrypter();
		const encrypterStubSpy = jest.spyOn(encrypterStub, "encrypt");
		const sut = new RegisterUser(encrypterStub);
		await sut.execute({
			username: "valid_username",
			password: "Valid_password1",
		});
		expect(encrypterStubSpy).toHaveBeenCalledWith("Valid_password1");
	});
});
