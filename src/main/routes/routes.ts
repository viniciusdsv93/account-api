import { Router } from "express";
import { expressAdaptRoute } from "../adapters/expressRouteAdapter";
import { makeCreateTransactionController } from "../factories/create-transaction";
import { makeGetAccountBalanceController } from "../factories/get-account-balance";
import { makeGetTransactionsController } from "../factories/get-transactions";
import { makeLoginController } from "../factories/login";
import { makeSignUpController } from "../factories/signup";

const router = Router();

router.post("/register", expressAdaptRoute(makeSignUpController()));
router.post("/login", expressAdaptRoute(makeLoginController()));
router.get("/balance", expressAdaptRoute(makeGetAccountBalanceController()));
router.post("/transaction", expressAdaptRoute(makeCreateTransactionController()));
router.get("/transaction", expressAdaptRoute(makeGetTransactionsController()));

export { router };
