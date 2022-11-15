import { SignUpController } from "./signup";

describe("Sign Up Controller", () => {
	test("Should return 400 if no username is provided", async () => {
		const sut = new SignUpController();
		const httpRequest = {
			body: {
				password: "any_password",
				passwordConfirmation: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse.statusCode).toBe(400);
	});

	test("Should return 400 if no password is provided", async () => {
		const sut = new SignUpController();
		const httpRequest = {
			body: {
				username: "any_username",
				passwordConfirmation: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse.statusCode).toBe(400);
	});

	test("Should return 400 if no passwordConfirmation is provided", async () => {
		const sut = new SignUpController();
		const httpRequest = {
			body: {
				username: "any_username",
				password: "any_password",
			},
		};
		const httpResponse = await sut.handle(httpRequest);
		expect(httpResponse.statusCode).toBe(400);
	});
});
