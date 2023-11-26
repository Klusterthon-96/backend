import { Router } from "express";

import offline from "../controllers/offline.controller";

const router = Router();

router.post("/", offline.start);

export default router;
