import { Router } from "express";

import { ROLE } from "./../config";
import auth from "../middlewares/auth.middleware";
import session from "../controllers/session.controller";

const router = Router();

router.post("/", auth(ROLE.USER), session.create);

export default router;
