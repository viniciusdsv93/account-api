import { Router } from "express";
import { expressAdaptRoute } from "../adapters/expressRouteAdapter";
import { makeGetAccountBalanceController } from "../factories/get-account-balance";
import { makeLoginController } from "../factories/login";
import { makeSignUpController } from "../factories/signup";

const router = Router();

router.post("/register", expressAdaptRoute(makeSignUpController()));
router.post("/login", expressAdaptRoute(makeLoginController()));
router.get("/balance", expressAdaptRoute(makeGetAccountBalanceController()));

export { router };
