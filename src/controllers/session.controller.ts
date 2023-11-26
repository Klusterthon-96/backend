import mongoose from "mongoose";
import response from "../utils/response";
import JWT from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_SECRET } from "../config";
import sessionService from "../services/session.service";

class SessionController {
    async initialize(req: Request, res: Response) {
        res.clearCookie("sid");
        const thirtyDaysInSeconds = 30 * 24 * 60 * 60;
        const expires = new Date(Date.now() + thirtyDaysInSeconds * 1000);
        const id = new mongoose.Types.ObjectId();
        const token = JWT.sign({ id }, JWT_SECRET!, {
            expiresIn: "1 day"
        });
        res.cookie("sid", token, {
            expires,
            httpOnly: true
        });
        const sessionId = token;

        res.status(200).send(response("new session", sessionId));
    }
    async newSession(req: Request, res: Response) {
        const sid = req.cookies.sid;
        const predictInput: PredictInput = {
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            ph: req.body.ph,
            water_availability: req.body.water_availability,
            label: req.body.label.toLowerCase(),
            Country: req.body.country
                .split(" ")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
        };

        const result = await sessionService.newSession(predictInput, req.$user._id, sid);
        res.status(200).send(response("new session", result));
    }
    async getSession(req: Request, res: Response) {
        const result = await sessionService.getSession(req.$user._id, req.params.id);
        res.status(200).send(response("Session gotten successfully", result));
    }
    async continueSession(req: Request, res: Response) {
        const predictInput: PredictInput = {
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            ph: req.body.ph,
            water_availability: req.body.water_availability,
            label: req.body.label.toLowerCase(),
            Country: req.body.country
                .split(" ")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
        };
        const result = await sessionService.continueSession(predictInput, req.$user._id, req.params.id);
        res.status(200).send(response("Session", result));
    }
    async getAllSession(req: Request, res: Response) {
        const result = await sessionService.getAllSession(req.query, req.$user._id);
        res.status(200).send(response("All Session", result));
    }
    async deleteOneSession(req: Request, res: Response) {
        await sessionService.deleteOneSession(req.$user._id, req.params.id);
        res.status(204).end();
    }
    async deleteAllSession(req: Request, res: Response) {
        await sessionService.deleteAllSession(req.$user._id);
        res.status(204).end();
    }
}

export default new SessionController();
