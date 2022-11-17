import { IUsernameAvailableRepository } from "../../../application/protocols/repositories/username-available-repository";
import { UserModel } from "../../../domain/models/user";
import {
	IRegisterUser,
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../../domain/usecases/register-user";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { ServerError } from "../../errors/server-error";
import { badRequest, created, ok, serverError } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { SignUpController } from "./signup";

describe("Sign Up Controller", () => {
	const makeFakeRequest = (): HttpRequest => {
		return {
			body: {
				username: "any_username",
				password: "Any_password1",
				passwordConfirmation: "Any_password1",
			},
		};
	};

	const makeUsernameAvailableRepositoryStub = (): IUsernameAvailableRepository => {
		class UsernameAvailableRepositoryStub implements IUsernameAvailableRepository {
			async isAvailable(username: string): Promise<boolean> {
				return await new Promise((resolve) => resolve(true));
			}
		}
		return new UsernameAvailableRepositoryStub();
	};

	const makeRegisterUserStub = (): IRegisterUser => {
		class RegisterUserStub implements IRegisterUser {
			async execute(user: RegisterUserModel): Promise<UserModel> {
				return {
					id: "1",
					username: "valid_username",
					password: "valid_password",
					accountId: "2",
				};
			}
		}
		return new RegisterUserStub();
	};

	type SutTypes = {
		sut: SignUpController;
		registerUserStub: IRegisterUser;
		usernameAvailableRepositoryStub: IUsernameAvailableRepository;
	};

	const makeSut = (): SutTypes => {
		const registerUserStub = makeRegisterUserStub();
		const usernameAvailableRepositoryStub = makeUsernameAvailableRepositoryStub();
		const sut = new SignUpController(
			registerUserStub,
			usernameAvailableRepositoryStub
		);
		return {
			sut,
			registerUserStub,
			usernameAvailableRepositoryStub,
		};
	};

	test("Should return 400 if no username is provided", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				password: "any_password",
				passwordConfirmation: "any_password",
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
				passwordConfirmation: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(badRequest(new MissingParamError("password")));
	});

	test("Should return 400 if no passwordConfirmation is provided", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "any_username",
				password: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(
			badRequest(new MissingParamError("passwordConfirmation"))
		);
	});

	test("Should return 400 if username has less than 3 characters", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "a",
				password: "any_password",
				passwordConfirmation: "another_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(
			badRequest(
				new InvalidParamError(
					"username",
					"username must have at least 3 characters"
				)
			)
		);
	});

	test("Should return 400 if username provided is already in use", async () => {
		const { sut, usernameAvailableRepositoryStub } = makeSut();
		jest.spyOn(usernameAvailableRepositoryStub, "isAvailable").mockReturnValueOnce(
			new Promise((resolve) => resolve(false))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(
			badRequest(new InvalidParamError("username", "username already in use"))
		);
	});

	test("Should return 400 if password has less than 8 characters", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "any_username",
				password: "a",
				passwordConfirmation: "a",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(
			badRequest(
				new InvalidParamError(
					"password",
					"password must have at least 8 characters"
				)
			)
		);
	});

	test("Should return 400 if password does not have at least 1 numeric character", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "any_username",
				password: "any_password",
				passwordConfirmation: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(
			badRequest(
				new InvalidParamError(
					"password",
					"password must have at least 1 numeric character"
				)
			)
		);
	});

	test("Should return 400 if password does not have at least 1 uppercase letter", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "any_username",
				password: "any_password1",
				passwordConfirmation: "any_password1",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(
			badRequest(
				new InvalidParamError(
					"password",
					"password must have at least 1 uppercase letter"
				)
			)
		);
	});

	test("Should return 400 if passwordConfirmation is invalid", async () => {
		const { sut } = makeSut();
		const httpRequest = {
			body: {
				username: "any_username",
				password: "Any_password1",
				passwordConfirmation: "another_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse).toEqual(
			badRequest(
				new InvalidParamError("passwordConfirmation", "passwords do not match")
			)
		);
	});

	test("Should return 500 if RegisteUser throws", async () => {
		const { sut, registerUserStub } = makeSut();
		jest.spyOn(registerUserStub, "execute").mockImplementationOnce(async () => {
			return await new Promise((resolve, reject) => reject(new Error()));
		});
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(serverError(new ServerError("")));
	});

	test("Should call RegisterUserUsecase with correct values", async () => {
		const { sut, registerUserStub } = makeSut();
		const registerUserSpy = jest.spyOn(registerUserStub, "execute");
		await sut.handle(makeFakeRequest());
		expect(registerUserSpy).toHaveBeenCalledWith({
			username: "any_username",
			password: "Any_password1",
		});
	});

	test("Should return an UserModel on success", async () => {
		const { sut } = makeSut();

		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(
			created({
				id: "1",
				username: "valid_username",
				password: "valid_password",
				accountId: "2",
			})
		);
	});
});
