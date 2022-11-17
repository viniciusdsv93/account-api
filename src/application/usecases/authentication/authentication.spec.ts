import { UserModel } from "../../../domain/models/user";
import { IAuthentication } from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { ITokenGenerator } from "../../protocols/cryptography/token-generator";
import { IFindByUsernameRepository } from "../../protocols/repositories/find-by-username-repository";
import { Authentication } from "./authentication";

describe("Authentication UseCase", () => {
	const makeFindByUsernameRepositoryStub = (): IFindByUsernameRepository => {
		class FindByUsernameRepositoryStub implements IFindByUsernameRepository {
			async find(username: string): Promise<UserModel> {
				return new Promise((resolve) => resolve(makeFakeUserResult()));
			}
		}
		return new FindByUsernameRepositoryStub();
	};

	const makeHashComparerStub = (): IHashComparer => {
		class HashComparerStub implements IHashComparer {
			async compare(value: string, hash: string): Promise<boolean> {
				return new Promise((resolve) => resolve(true));
			}
		}
		return new HashComparerStub();
	};

	const makeTokenGeneratorStub = (): ITokenGenerator => {
		class TokenGeneratorStub implements ITokenGenerator {
			async generate(id: string): Promise<string | null> {
				return new Promise((resolve) => resolve("any_token"));
			}
		}
		return new TokenGeneratorStub();
	};

	const makeFakeUserData = () => {
		return {
			username: "any_username",
			password: "any_password",
		};
	};

	const makeFakeUserResult = () => {
		return {
			id: "valid_id",
			username: "valid_username",
			password: "hashed_password",
			accountId: "valid_account_id",
		};
	};

	type SutTypes = {
		sut: IAuthentication;
		findByUsernameStub: IFindByUsernameRepository;
		hashComparerStub: IHashComparer;
		tokenGeneratorStub: ITokenGenerator;
	};

	const makeSut = (): SutTypes => {
		const findByUsernameStub = makeFindByUsernameRepositoryStub();
		const hashComparerStub = makeHashComparerStub();
		const tokenGeneratorStub = makeTokenGeneratorStub();
		const sut = new Authentication(
			findByUsernameStub,
			hashComparerStub,
			tokenGeneratorStub
		);
		return {
			sut,
			findByUsernameStub,
			hashComparerStub,
			tokenGeneratorStub,
		};
	};

	test("Should call FindUserByUsernameRepository with correct username", async () => {
		const { sut, findByUsernameStub } = makeSut();
		const findByUsernameSpyStub = jest.spyOn(findByUsernameStub, "find");
		await sut.auth(makeFakeUserData());
		expect(findByUsernameSpyStub).toHaveBeenCalledWith("any_username");
	});

	test("Should throw if FindUserByUsernameRepository throws", async () => {
		const { sut, findByUsernameStub } = makeSut();
		jest.spyOn(findByUsernameStub, "find").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.auth(makeFakeUserData());
		await expect(promise).rejects.toThrow();
	});

	test("Should return null if FindUserByUsernameRepository returns null", async () => {
		const { sut, findByUsernameStub } = makeSut();
		jest.spyOn(findByUsernameStub, "find").mockReturnValueOnce(
			new Promise((resolve) => resolve(null))
		);
		const accessToken = await sut.auth(makeFakeUserData());
		expect(accessToken).toBeNull();
	});

	test("Should call HashComparer with correct values", async () => {
		const { sut, hashComparerStub } = makeSut();
		const hashComparerSpy = jest.spyOn(hashComparerStub, "compare");
		await sut.auth(makeFakeUserData());
		expect(hashComparerSpy).toBeCalledWith("any_password", "hashed_password");
	});

	test("Should throw if HashComparer throws", async () => {
		const { sut, hashComparerStub } = makeSut();
		jest.spyOn(hashComparerStub, "compare").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.auth(makeFakeUserData());
		await expect(promise).rejects.toThrow();
	});

	test("Should return null if HashComparer returns false", async () => {
		const { sut, hashComparerStub } = makeSut();
		jest.spyOn(hashComparerStub, "compare").mockReturnValueOnce(
			new Promise((resolve) => resolve(false))
		);
		const accessToken = await sut.auth(makeFakeUserData());
		expect(accessToken).toBeNull();
	});

	test("Should call TokenGenerator with correct id", async () => {
		const { sut, tokenGeneratorStub } = makeSut();
		const tokenGeneratorSpy = jest.spyOn(tokenGeneratorStub, "generate");
		await sut.auth(makeFakeUserData());
		expect(tokenGeneratorSpy).toBeCalledWith("valid_id");
	});
});
