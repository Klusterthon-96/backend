import { Router } from "express";

import { ROLE } from "./../config";
import auth from "../middlewares/auth.middleware";
import session from "../controllers/session.controller";

const router = Router();

router.route("/").post(auth(ROLE.USER), session.initialize).put(auth(ROLE.USER), session.newSession).get(auth(ROLE.USER), session.getAllSession).delete(auth(ROLE.USER), session.deleteAllSession);
router.route("/:id").get(auth(ROLE.USER), session.getSession).put(auth(ROLE.USER), session.continueSession).delete(auth(ROLE.USER), session.deleteOneSession);

export default router;
