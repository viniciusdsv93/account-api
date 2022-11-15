import { Router } from "express";
import { expressAdaptRoute } from "../adapters/expressRouteAdapter";
import { makeSignUpController } from "../factories/signup";

const router = Router();

router.post("/register", expressAdaptRoute(makeSignUpController()));

export { router };
