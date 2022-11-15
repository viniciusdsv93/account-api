import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../domain/usecases/registerUser";
import { IAddUserRepository } from "../protocols/add-user-repository";
import { IEncrypter } from "../protocols/encrypter";
import { RegisterUser } from "./register-user";

const makeEncrypterStub = (): IEncrypter => {
	class EncrypterStub implements IEncrypter {
		async encrypt(password: string): Promise<string> {
			return await new Promise((resolve) => resolve("hashed_password"));
		}
	}
	return new EncrypterStub();
};

const makeAddUserRepositoryStub = (): IAddUserRepository => {
	class AddUserRepositoryStub implements IAddUserRepository {
		async add(userData: RegisterUserModel): Promise<UserModelWithoutAccountId> {
			return await new Promise((resolve) =>
				resolve(makeFakeUserWithoutAccountId())
			);
		}
	}
	return new AddUserRepositoryStub();
};

const makeFakeUserData = (): RegisterUserModel => {
	return {
		username: "valid_username",
		password: "Valid_password1",
	};
};

const makeFakeUserWithoutAccountId = (): UserModelWithoutAccountId => {
	return {
		id: "valid_id",
		username: "valid_username",
		password: "Valid_password1",
	};
};

type SutTypes = {
	sut: RegisterUser;
	encrypterStub: IEncrypter;
	addUserRepositoryStub: IAddUserRepository;
};

const makeSut = (): SutTypes => {
	const addUserRepositoryStub = makeAddUserRepositoryStub();
	const encrypterStub = makeEncrypterStub();
	const sut = new RegisterUser(encrypterStub, addUserRepositoryStub);
	return {
		sut,
		encrypterStub,
		addUserRepositoryStub,
	};
};

describe("Register User Usecase", () => {
	test("Should call Encrypter with the correct password", async () => {
		const { sut, encrypterStub } = makeSut();
		const encrypterStubSpy = jest.spyOn(encrypterStub, "encrypt");
		await sut.execute(makeFakeUserData());
		expect(encrypterStubSpy).toHaveBeenCalledWith("Valid_password1");
	});

	// test("Should throw an error if Encrypter throws", async () => {
	// 	const { sut, encrypterStub } = makeSut();
	// 	jest.spyOn(encrypterStub, "encrypt").mockReturnValueOnce(
	// 		new Promise((resolve, reject) => reject(new Error()))
	// 	);
	// 	const promise = await sut.execute(makeFakeUserData());
	// 	await expect(promise).rejects.toThrow();
	// });

	test("Should call AddUserRepository with the correct values", async () => {
		const { sut, addUserRepositoryStub } = makeSut();
		const addUserRepositoryStubSpy = jest.spyOn(addUserRepositoryStub, "add");
		await sut.execute(makeFakeUserData());
		expect(addUserRepositoryStubSpy).toHaveBeenCalledWith({
			username: "valid_username",
			password: "hashed_password",
		});
	});
});
