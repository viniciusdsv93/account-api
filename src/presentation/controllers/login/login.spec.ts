import { IFindByUsernameRepository } from "../../../application/protocols/find-by-username-repository";
import { UserModel } from "../../../domain/models/user";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
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

	type SutTypes = {
		sut: LoginController;
		findByUsernameRepositoryStub: IFindByUsernameRepository;
	};

	const makeSut = (): SutTypes => {
		const findByUsernameRepositoryStub = makeFindByUsernameRepositoryStub();
		const sut = new LoginController(findByUsernameRepositoryStub);
		return {
			sut,
			findByUsernameRepositoryStub,
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
});
