import { UserModel } from "../../../domain/models/user";
import { IAuthentication } from "../../../domain/usecases/authentication";
import { IHashComparer } from "../../protocols/cryptography/hash-comparer";
import { IEncrypter } from "../../protocols/cryptography/encrypter";
import { IFindUserByUsernameRepository } from "../../protocols/repositories/user/find-user-by-username-repository";
import { IUpdateAccessTokenRepository } from "../../protocols/repositories/user/update-access-token-repository";
import { Authentication } from "./authentication";

describe("Authentication UseCase", () => {
	const makeFindByUsernameRepositoryStub = (): IFindUserByUsernameRepository => {
		class FindByUsernameRepositoryStub implements IFindUserByUsernameRepository {
			async findByUsername(username: string): Promise<UserModel> {
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

	const makeEncrypterStub = (): IEncrypter => {
		class EncrypterStub implements IEncrypter {
			async encrypt(id: string): Promise<string> {
				return new Promise((resolve) => resolve("any_token"));
			}
		}
		return new EncrypterStub();
	};

	const makeUpdateAccessTokenRepositoryStub = (): IUpdateAccessTokenRepository => {
		class UpdateAccessTokenRepositoryStub implements IUpdateAccessTokenRepository {
			async updateAccessToken(id: string, token: string): Promise<void> {
				return new Promise((resolve) => resolve());
			}
		}
		return new UpdateAccessTokenRepositoryStub();
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
		findByUsernameStub: IFindUserByUsernameRepository;
		hashComparerStub: IHashComparer;
		encrypterStub: IEncrypter;
		updateAccessTokenRepositoryStub: IUpdateAccessTokenRepository;
	};

	const makeSut = (): SutTypes => {
		const findByUsernameStub = makeFindByUsernameRepositoryStub();
		const hashComparerStub = makeHashComparerStub();
		const encrypterStub = makeEncrypterStub();
		const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepositoryStub();
		const sut = new Authentication(
			findByUsernameStub,
			hashComparerStub,
			encrypterStub,
			updateAccessTokenRepositoryStub
		);
		return {
			sut,
			findByUsernameStub,
			hashComparerStub,
			encrypterStub,
			updateAccessTokenRepositoryStub,
		};
	};

	test("Should call FindUserByUsernameRepository with correct username", async () => {
		const { sut, findByUsernameStub } = makeSut();
		const findByUsernameSpyStub = jest.spyOn(findByUsernameStub, "findByUsername");
		await sut.auth(makeFakeUserData());
		expect(findByUsernameSpyStub).toHaveBeenCalledWith("any_username");
	});

	test("Should throw if FindUserByUsernameRepository throws", async () => {
		const { sut, findByUsernameStub } = makeSut();
		jest.spyOn(findByUsernameStub, "findByUsername").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.auth(makeFakeUserData());
		await expect(promise).rejects.toThrow();
	});

	test("Should return null if FindUserByUsernameRepository returns null", async () => {
		const { sut, findByUsernameStub } = makeSut();
		jest.spyOn(findByUsernameStub, "findByUsername").mockReturnValueOnce(
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

	test("Should call Encrypter with correct id", async () => {
		const { sut, encrypterStub } = makeSut();
		const encrypterSpy = jest.spyOn(encrypterStub, "encrypt");
		await sut.auth(makeFakeUserData());
		expect(encrypterSpy).toBeCalledWith("valid_id");
	});

	test("Should throw if Encrypter throws", async () => {
		const { sut, encrypterStub } = makeSut();
		jest.spyOn(encrypterStub, "encrypt").mockReturnValueOnce(
			new Promise((resolve, reject) => reject(new Error()))
		);
		const promise = sut.auth(makeFakeUserData());
		await expect(promise).rejects.toThrow();
	});

	test("Should return an accessToken on success", async () => {
		const { sut } = makeSut();
		const accessToken = await sut.auth(makeFakeUserData());
		expect(accessToken).toEqual("any_token");
	});

	test("Should call UpdateAccessTokenRepository with correct values", async () => {
		const { sut, updateAccessTokenRepositoryStub } = makeSut();
		const updateSpy = jest.spyOn(
			updateAccessTokenRepositoryStub,
			"updateAccessToken"
		);
		await sut.auth(makeFakeUserData());
		expect(updateSpy).toBeCalledWith("valid_id", "any_token");
	});

	test("Should throw if UpdateAccessTokenRepository throws", async () => {
		const { sut, updateAccessTokenRepositoryStub } = makeSut();
		jest.spyOn(
			updateAccessTokenRepositoryStub,
			"updateAccessToken"
		).mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
		const promise = sut.auth(makeFakeUserData());
		await expect(promise).rejects.toThrow();
	});
});
