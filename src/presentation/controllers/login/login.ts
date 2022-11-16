import { IUsernameAvailableRepository } from "../../../application/protocols/username-available-repository";
import { InvalidParamError } from "../../errors/invalid-param-error";
import { MissingParamError } from "../../errors/missing-param-error";
import { badRequest, ok } from "../../helpers/http";
import { Controller } from "../../protocols/controller";
import { HttpRequest, HttpResponse } from "../../protocols/http";

export class LoginController implements Controller {

  private readonly usernameRepository: IUsernameAvailableRepository

  constructor(usernameRepository: IUsernameAvailableRepository) {
    this.usernameRepository = usernameRepository
  }

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    const requiredFields = ['username', 'password']
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }

    const {username, password} = httpRequest.body

    const isAvailable = await this.usernameRepository.isAvailable(username)

    if (isAvailable) {
      return badRequest(new InvalidParamError("username", "invalid username or password"))
    }

    return ok('')
  }

}