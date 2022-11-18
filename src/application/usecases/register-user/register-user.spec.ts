import { AccountModel } from "../../../domain/models/account";
import { UserModel } from "../../../domain/models/user";
import {
	RegisterUserModel,
	UserModelWithoutAccountId,
} from "../../../domain/usecases/register-user";
import { IAddAccountRepository } from "../../protocols/repositories/account/add-account-repository";
import { IAddAccountToUserRepository } from "../../protocols/repositories/user/add-account-to-user-repository";
import { IAddUserRepository } from "../../protocols/repositories/user/add-user-repository";
import { IHasher } from "../../protocols/cryptography/hasher";
import { RegisterUser } from "./register-user";

const makeHasherStub = (): IHasher => {
	class HasherStub implements IHasher {
		verify(password: string): Promise<boolean> {
			throw new Error("Method not implemented.");
		}
		async hash(password: string): Promise<string> {
			return await new Promise((resolve) => resolve("hashed_password"));
		}
	}
	return new HasherStub();
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

const makeAddAccountRepositoryStub = (): IAddAccountRepository => {
	class AddAccountRepositoryStub implements IAddAccountRepository {
		async add(userId: string): Promise<AccountModel> {
			return await new Promise((resolve) => resolve(makeFakeAccount()));
		}
	}
	return new AddAccountRepositoryStub();
};

const makeAddAccountIdToUserRepositoryStub = (): IAddAccountToUserRepository => {
	class AddAccountIdToUserRepositoryStub implements IAddAccountToUserRepository {
		async change(userId: string, accountId: string): Promise<UserModel> {
			return await new Promise((resolve) => resolve(makeFakeUserModel()));
		}
	}
	return new AddAccountIdToUserRepositoryStub();
};

const makeFakeAccount = (): AccountModel => {
	return {
		id: "valid_id",
		balance: 100,
	};
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

const makeFakeUserModel = (): UserModel => {
	return {
		id: "valid_id",
		username: "valid_username",
		password: "Valid_password1",
		accountId: "account_id",
	};
};

type SutTypes = {
	sut: RegisterUser;
	hasherStub: IHasher;
	addUserRepositoryStub: IAddUserRepository;
	addAccountRepositoryStub: IAddAccountRepository;
	addAccountIdToUserRepositoryStub: IAddAccountToUserRepository;
};

const makeSut = (): SutTypes => {
	const addUserRepositoryStub = makeAddUserRepositoryStub();
	const addAccountRepositoryStub = makeAddAccountRepositoryStub();
	const addAccountIdToUserRepositoryStub = makeAddAccountIdToUserRepositoryStub();
	const hasherStub = makeHasherStub();
	const sut = new RegisterUser(
		hasherStub,
		addUserRepositoryStub,
		addAccountRepositoryStub,
		addAccountIdToUserRepositoryStub
	);
	return {
		sut,
		hasherStub,
		addUserRepositoryStub,
		addAccountRepositoryStub,
		addAccountIdToUserRepositoryStub,
	};
};

describe("Register User Usecase", () => {
	test("Should call Encrypter with the correct password", async () => {
		const { sut, hasherStub } = makeSut();
		const hasherStubSpy = jest.spyOn(hasherStub, "hash");
		await sut.execute(makeFakeUserData());
		expect(hasherStubSpy).toHaveBeenCalledWith("Valid_password1");
	});

	test("Should call AddUserRepository with the correct values", async () => {
		const { sut, addUserRepositoryStub } = makeSut();
		const addUserRepositoryStubSpy = jest.spyOn(addUserRepositoryStub, "add");
		await sut.execute(makeFakeUserData());
		expect(addUserRepositoryStubSpy).toHaveBeenCalledWith({
			username: "valid_username",
			password: "hashed_password",
		});
	});

	test("Should get users id on AddUserRepository success", async () => {
		const { addUserRepositoryStub } = makeSut();
		const addUserRepositoryResponse = await addUserRepositoryStub.add(
			makeFakeUserData()
		);
		expect(addUserRepositoryResponse).toHaveProperty("id");
	});

	test("Should call AddAccountRepository if AddUserRepository succeed", async () => {
		const { sut, addAccountRepositoryStub } = makeSut();
		const addAccountSpy = jest.spyOn(addAccountRepositoryStub, "add");
		await sut.execute(makeFakeUserData());
		expect(addAccountSpy).toHaveBeenCalled();
	});
});
