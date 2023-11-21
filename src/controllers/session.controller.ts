import mongoose from "mongoose";
import response from "../utils/response";
import JWT from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_SECRET } from "../config";
import sessionService from "../services/session.service";

class SessionController {
    async create(req: Request, res: Response) {
        let sid = req.cookies.sid;
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        const expires = new Date(Date.now() + thirtyDaysInSeconds * 1000);
        if (!sid) {
            const id = new mongoose.Types.ObjectId();
            const token = JWT.sign({ id }, JWT_SECRET!, {
                expiresIn: "1 day"
            });
            res.cookie("sid", token, {
                expires,
                httpOnly: true
            });
            sid = token;
        }
        const result = await sessionService.create(req.body, req.$user._id, sid);
        res.status(200).send(response("new session", result));
    }
}

export default new SessionController();
