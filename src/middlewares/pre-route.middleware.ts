import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import express from "express";
import credentials from "./credentials";
import corsOptions from "../config/corsOptions";

import type { Application } from "express";

export default (app: Application) => {
    dotenv.config({
        path: path.resolve(__dirname, "..", "..", ".env")
    });

    app.use(credentials);
    app.use(cors(corsOptions));


    app.use(helmet({ contentSecurityPolicy: false }));


    app.use(morgan("common"));

  
    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));

    return app;
};
