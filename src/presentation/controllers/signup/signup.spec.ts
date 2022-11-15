import { SignUpController } from "./signup";

describe("Sign Up Controller", () => {
	test("Should return 400 if no username is provided", async () => {
		const sut = new SignUpController();
		const httpRequest = {
			body: {
				password: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse.statusCode).toBe(400);
	});
});
