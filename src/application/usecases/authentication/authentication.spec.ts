import { UserModel } from "../../../domain/models/user";
import { IAuthentication } from "../../../domain/usecases/authentication";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";
import { Authentication } from "./authentication";

describe("Authentication UseCase", () => {
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

	const makeFakeUserData = () => {
		return {
			username: "any_username",
			password: "any_password",
		};
	};

	type SutTypes = {
		sut: IAuthentication;
		findByUsername: IFindByUsernameRepository;
	};

	const makeSut = (): SutTypes => {
		const findByUsername = makeFindByUsernameRepositoryStub();
		const sut = new Authentication(findByUsername);
		return {
			sut,
			findByUsername,
		};
	};

	test("Should call FindUserByUsernameRepository with correct username", async () => {
		const { sut, findByUsername } = makeSut();
		const findByUsernameSpy = jest.spyOn(findByUsername, "find");
		await sut.auth(makeFakeUserData());
		expect(findByUsernameSpy).toHaveBeenCalledWith("any_username");
	});

	test("Should throw if FindUserByUsernameRepository throws", async () => {
		const { sut, findByUsername } = makeSut();
		jest.spyOn(findByUsername, "find").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.auth(makeFakeUserData());
		await expect(promise).rejects.toThrow();
	});
});
