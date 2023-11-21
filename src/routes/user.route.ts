import { Router } from "express";

import { ROLE } from "./../config";
import auth from "../middlewares/auth.middleware";
import UserCtrl from "../controllers/user.controller";

const router = Router();

router.get("/me", auth(ROLE.USER), UserCtrl.getMe);

router.put("/me", auth(ROLE.USER), UserCtrl.updateMe);

export default router;
