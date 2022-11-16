import { IUsernameAvailableRepository } from "../../../application/protocols/username-available-repository";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
import { HttpRequest } from "../../protocols/http";
import { LoginController } from "./login";

describe('Login Controller', () => {

  const makeFakeRequest = (): HttpRequest => {
    return {
      body: {
        username: 'any_username',
        password: 'any_password'
      }
    }
  }

  const makeUsernameAvailableRepositoryStub = (): IUsernameAvailableRepository => {
		class UsernameAvailableRepositoryStub implements IUsernameAvailableRepository {
			async isAvailable(username: string): Promise<boolean> {
				return await new Promise((resolve) => resolve(false));
			}
		}
		return new UsernameAvailableRepositoryStub();
	};

  type SutTypes = {
    sut: LoginController
    usernameAvailableRepositoryStub: IUsernameAvailableRepository
  }

  const makeSut = () => {
    const usernameAvailableRepositoryStub = makeUsernameAvailableRepositoryStub()
    const sut = new LoginController(usernameAvailableRepositoryStub)
    return {
      sut,
      usernameAvailableRepositoryStub
    }
  }

  test('Should return 400 if no username is provided', async () => {
    const {sut} = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('username')))
  });

  test('Should return 400 if no password is provided', async () => {
    const {sut} = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
  });

  test("Should return 400 if the username provided is not registered", async () => {
		const { sut, usernameAvailableRepositoryStub } = makeSut();
		jest.spyOn(usernameAvailableRepositoryStub, "isAvailable").mockReturnValueOnce(
			new Promise((resolve) => resolve(true))
		);
		const httpResponse = await sut.handle(makeFakeRequest());
		expect(httpResponse).toEqual(
			badRequest(new InvalidParamError("username", "invalid username or password"))
		);
	});
})