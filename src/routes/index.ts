import { Router } from "express";

import trimIncomingRequests from "../middlewares/trim-incoming-requests";

import AuthRoutes from "./auth.route";

import UserRoutes from "./user.route";

import AdminRoutes from "./admin.route";

import SessionRoute from "./session.route";

import offline from "./offline.route";

import type { Request, Response } from "express";

const router = Router();

// Trim all incoming requests
router.use(trimIncomingRequests);

router.use("/api/v1/auth", AuthRoutes);

router.use("/api/v1/user", UserRoutes);

router.use("/api/v1/admin", AdminRoutes);

router.use("/api/v1/session", SessionRoute);

router.use("/api/v1/offline", offline);

router.get("/", (req: Request, res: Response) => {
    return res.status(200).json({
        message: "You probably shouldn't be here, but...",
        data: {
            service: "agro_assistant-api",
            version: "1.0"
        }
    });
});

export default router;
