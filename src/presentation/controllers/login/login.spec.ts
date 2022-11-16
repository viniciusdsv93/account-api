import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest } from "../../helpers/http";
import { LoginController } from "./login";

describe('Login Controller', () => {


  test('Should return 400 if no username is provided', async () => {
    const sut = new LoginController()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(new MissingParamError('username')))
  });
})