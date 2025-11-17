import express from "express";
import { Request, Response, NextFunction } from "express";
import BaseRouter from "./routes";
import Paths from "tests/common/Paths";
import HttpStatusCodes from "./common/constants/HttpStatusCodes";
import { RouteError } from "./common/util/route-errors";

const app = express();

/**
 * Global Middleware
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(Paths.Public));

/**
 * API Routes
 */
app.use(Paths.Base, BaseRouter);

/**
 * Error Handling
 */
