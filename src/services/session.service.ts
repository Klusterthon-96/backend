/* eslint-disable @typescript-eslint/no-unused-vars */
import Session from "../models/session.model";
import JWT, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import CustomError from "../utils/custom-error";
import { spawn } from "child_process";
import mongoose, { Types } from "mongoose";
import User from "../models/user.model";

class SessionService {
    async newSession(data: PredictInput, userId: string, sessionId: string) {
        try {
            if (!data.country || !data.humidity || !data.label || !data.ph || !data.temperature || !data.water_availability) {
                throw new CustomError("You're not passing in the correct parameters");
            }

            const decoded = JWT.verify(sessionId, JWT_SECRET!) as JwtPayload;
            let session = await Session.findOne({ userId: userId, _id: decoded.id });

            const query = await this.convertInputToNumbers(data);

            const season = await new Promise<string>((resolve, reject) => {
                const pythonProcess = spawn("python3", ["dist/ML/script.py", JSON.stringify(query)]);
                let result: number;

                pythonProcess.stdout.on("data", (data) => {
                    result = parseInt(data.toString());
                });

                pythonProcess.on("close", async () => {
                    const season = result === 0 ? "Rainy" : result === 1 ? "Winter" : result === 2 ? "Spring" : "Summer";
                    if (session) {
                        session.query_result.push({ query: data, result: season });
                        await session.save();
                    } else {
                        const sessionIdAsObjectId = new Types.ObjectId(decoded.id);

                        session = await Session.create({ _id: sessionIdAsObjectId, userId: userId, query_result: [{ query: data, season }] });
                    }
                    resolve(season);
                });
            });
            return { season };
        } catch (error) {
            throw new CustomError("Error Generating Result", 500);
        }
    }
    async getSession(userId: string, sessionId: string) {
        const user = await User.findById(userId);
        if (!user) throw new CustomError("User not found", 404);
        const session = await Session.findOne({ userId: userId, _id: sessionId });
        if (!session) throw new CustomError("Session Not found", 404);
        return session;
    }
    async continueSession(data: PredictInput, userId: string, sessionId: string) {
        try {
            if (!data.country || !data.humidity || !data.label || !data.ph || !data.temperature || !data.water_availability) {
                throw new CustomError("You're not passing in the correct parameters");
            }
            const session = await Session.findOne({ userId: userId, _id: sessionId });
            if (!session) throw new CustomError("Session Not found", 404);

            const query = await this.convertInputToNumbers(data);

            const season = await new Promise<string>((resolve, reject) => {
                const pythonProcess = spawn("python3", ["dist/ML/script.py", JSON.stringify(query)]);
                let result: number;

                pythonProcess.stdout.on("data", (data) => {
                    result = parseInt(data.toString());
                });

                pythonProcess.on("close", async () => {
                    const season = result === 0 ? "Rainy" : result === 1 ? "Winter" : result === 2 ? "Spring" : "Summer";
                    session.query_result.push({ query: data, result: season });
                    await session.save();
                    resolve(season);
                });
            });
            return { season };
        } catch (error) {
            throw new CustomError("Error Generating Result", 500);
        }
    }
    async getAllSession(pagination: PaginationInput, userId: string) {
        const user = await User.findById(userId);
        const { limit = 10, next } = pagination;
        let query = {};
        const total = await Session.countDocuments(query);

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                ...query,
                $or: [{ createdAt: { $gt: nextCreatedAt } }, { createdAt: nextCreatedAt, _id: { $gt: nextId } }]
            };
        }

        const sessions = await Session.find(query, { password: 0, __v: 0 })
            .sort({ createdAt: 1, _id: 1 })
            .limit(Number(limit) + 1);

        const hasNext = sessions.length > limit;
        if (hasNext) sessions.pop();

        const nextCursor = hasNext ? `${sessions[sessions.length - 1]._id}_${sessions[sessions.length - 1].createdAt.getTime()}` : null;

        return {
            sessions,
            pagination: {
                total,
                hasNext,
                next: nextCursor
            }
        };
    }
    async convertInputToNumbers(data: PredictInput) {
        const country: number = data.country === "nigeria" ? 0 : data.country === "south africa" ? 1 : data.country === "kenya" ? 2 : 3;
        const humidity: number = data.humidity >= 0 && data.humidity <= 20 ? 0 : data.humidity <= 40 ? 1 : data.humidity <= 60 ? 2 : data.humidity <= 80 ? 3 : 4;
        const temperature: number = data.temperature <= 19 ? 0 : data.temperature <= 24 ? 1 : data.temperature <= 29 ? 2 : 3;
        const ph: number = data.ph <= 2 ? 0 : data.ph <= 6 ? 2 : data.ph === 7 ? 2 : 3;

        const water_availability: number = data.water_availability <= 50 ? 0 : data.water_availability >= 51 && data.water_availability <= 100 ? 1 : 2;

        const label: number =
            data.label === "maize"
                ? 0
                : data.label === "chickpea"
                ? 1
                : data.label === "kidneybeans"
                ? 2
                : data.label === "pigeonpeas"
                ? 3
                : data.label === "mothbeans"
                ? 4
                : data.label === "mungbeans"
                ? 5
                : data.label === "blackgram"
                ? 6
                : data.label === "lentil"
                ? 7
                : data.label === "watermelon"
                ? 8
                : data.label === "muskmelon"
                ? 9
                : data.label === "cotton"
                ? 10
                : 11;

        return { temperature, humidity, ph, water_availability, label, country };
    }
}

export default new SessionService();
