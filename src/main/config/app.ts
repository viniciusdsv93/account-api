import express from "express";
import { bodyParser } from "../middlewares/bodyParser";
import { contentType } from "../middlewares/contentType";
import { cors } from "../middlewares/cors";
import * as dotenv from "dotenv";
import { router } from "../routes/routes";
dotenv.config();
import { serve, setup } from "swagger-ui-express";
import swaggerDocument from "../../../swagger.json";

export class App {
	private readonly express: express.Application;
	private readonly port = process.env.PORT || 3334;

	constructor() {
		this.express = express();
		this.documentation();
		this.middlewares();
		this.routes();
		this.listen();
	}

	private middlewares() {
		this.express.use(cors);
		this.express.use(bodyParser);
		this.express.use(contentType);
	}

	private documentation() {
		this.express.use("/api-docs", serve, setup(swaggerDocument));
	}

	private routes() {
		this.express.use(router);
	}

	private listen() {
		this.express.listen(this.port, () => {
			console.log(`Server running on http://localhost:${this.port}/api-docs`);
		});
	}
}
