import { UserModel } from "../../../domain/models/user";
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

	test("Should call FindUserByUsernameRepository with correct username", async () => {
		const findByUsername = makeFindByUsernameRepositoryStub();
		const sut = new Authentication(findByUsername);
		const findByUsernameSpy = jest.spyOn(findByUsername, "find");
		await sut.auth({
			username: "any_username",
			password: "any_password",
		});
		expect(findByUsernameSpy).toHaveBeenCalledWith("any_username");
	});
});
