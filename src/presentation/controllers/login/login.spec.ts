import { IEncrypter } from "../../../application/protocols/encrypter";
import { IFindByUsernameRepository } from "../../../application/protocols/find-by-username-repository";
import { UserModel } from "../../../domain/models/user";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, unauthorized } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { LoginController } from "./login";

describe("Login Controller", () => {
	const makeFakeRequest = (): HttpRequest => {
		return {
			body: {
				username: "any_username",
				password: "any_password",
			},
		};
	};

	const makeFindByUsernameRepositoryStub = (): IFindByUsernameRepository => {
		class FindByUsernameRepositoryStub implements IFindByUsernameRepository {
			async find(username: string): Promise<UserModel> {
				return new Promise((resolve) =>
					resolve({
						id: "valid_id",
						username: "valid_username",
						password: "valid_password",
						accountId: "valid_account_id",
					})
				);
			}
		}
		return new FindByUsernameRepositoryStub();
	};

	const makeEncrypterStub = (): IEncrypter => {
		class EncrypterStub implements IEncrypter {
			encrypt(password: string): Promise<string> {
				throw new Error("Method not implemented.");
			}
			async verify(password: string): Promise<boolean> {
				return new Promise((resolve) => resolve(true));
			}
		}
		return new EncrypterStub();
	};

	type SutTypes = {
		sut: LoginController;
		findByUsernameRepositoryStub: IFindByUsernameRepository;
		encrypterStub: IEncrypter;
	};

	const makeSut = (): SutTypes => {
		const findByUsernameRepositoryStub = makeFindByUsernameRepositoryStub();
		const encrypterStub = makeEncrypterStub();
		const sut = new LoginController(findByUsernameRepositoryStub, encrypterStub);
		return {
			sut,
			findByUsernameRepositoryStub,
			encrypterStub,
		};
	};

	test("Should return 400 if no username is provided", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				password: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(badRequest(new MissingParamError("username")));
	});

	test("Should return 400 if no password is provided", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "any_username",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(badRequest(new MissingParamError("password")));
	});

	test("Should return 400 if the username provided is not registered", async () => {
		const { sut, findByUsernameRepositoryStub } = makeSut();
		jest.spyOn(findByUsernameRepositoryStub, "find").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(
			badRequest(new InvalidParamError("username", "invalid username or password"))
		);
	});

	test("Should call Encrypter with the correct password", async () => {
		const { sut, encrypterStub } = makeSut();
		const encrypterSpy = jest.spyOn(encrypterStub, "verify");
		await sut.handle(makeFakeRequest());
		expect(encrypterSpy).toHaveBeenCalledWith("any_password");
	});

	test("Should return 401 if invalid password is provided", async () => {
		const { sut, encrypterStub } = makeSut();
		jest.spyOn(encrypterStub, "verify").mockReturnValueOnce(
			new Promise((resolve) => resolve(false))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(unauthorized());
	});
});
