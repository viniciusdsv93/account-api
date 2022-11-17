import { IEncrypter } from "../../../application/protocols/cryptography/encrypter";
import { IFindByUsernameRepository } from "../../../application/protocols/repositories/find-by-username-repository";
import { UserModel } from "../../../domain/models/user";
import { IAuthentication } from "../../../domain/usecases/authentication";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http";
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

	const makeAuthenticationStub = (): IAuthentication => {
		class AuthenticationStub implements IAuthentication {
			async auth(username: string, password: string): Promise<string> {
				return new Promise((resolve) => resolve("any_token"));
			}
		}
		return new AuthenticationStub();
	};

	type SutTypes = {
		sut: LoginController;
		findByUsernameRepositoryStub: IFindByUsernameRepository;
		authenticationStub: IAuthentication;
	};

	const makeSut = (): SutTypes => {
		const findByUsernameRepositoryStub = makeFindByUsernameRepositoryStub();
		const authenticationStub = makeAuthenticationStub();
		const sut = new LoginController(findByUsernameRepositoryStub, authenticationStub);
		return {
			sut,
			findByUsernameRepositoryStub,
			authenticationStub,
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

	test("Should call Authentication with the correct values", async () => {
		const { sut, authenticationStub } = makeSut();
		const authSpy = jest.spyOn(authenticationStub, "auth");
		await sut.handle(makeFakeRequest());
		expect(authSpy).toHaveBeenCalledWith("any_username", "any_password");
	});

	test("Should return 401 if invalid credentials are provided", async () => {
		const { sut, authenticationStub } = makeSut();
		jest.spyOn(authenticationStub, "auth").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(unauthorized());
	});

	test("Should return 500 if Authentication throws", async () => {
		const { sut, authenticationStub } = makeSut();
		jest.spyOn(authenticationStub, "auth").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(serverError(new Error()));
	});

	test("Should return 200 if valid credentials are provided", async () => {
		const { sut } = makeSut();
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(
			ok({
				accessToken: "any_token",
			})
		);
	});
});
