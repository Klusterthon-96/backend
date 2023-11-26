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
            // let session = await Session.findOne({ userId: userId, _id: decoded.id });

            const query = await this.convertInputToNumbers(data);
            console.log(query);

            const season = await new Promise<string>((resolve, reject) => {
                const pythonProcess = spawn("python3", ["dist/ML/script.py", JSON.stringify(data)]);
                let result: number;

                pythonProcess.stdout.on("data", (data) => {
                    console.log(data.toString());
                    result = parseInt(data.toString());
                });

                pythonProcess.stderr.on("data", (data) => {
                    // Handle errors from the Python script
                    console.error(`Error from Python script: ${data}`);
                    return;
                    // res.status(500).send("Internal Server Error");
                });

                pythonProcess.on("close", async () => {
                    console.log(result);
                    const season = result === 0 ? "Rainy" : result === 1 ? "Spring" : result === 2 ? "Summer" : "Winter";
                    // if (session) {
                    //     session.query_result.push({ query: data, result: season });
                    //     await session.save();
                    // } else {
                    //     const sessionIdAsObjectId = new Types.ObjectId(decoded.id);

                    //     session = await Session.create({ _id: sessionIdAsObjectId, userId: userId, query_result: [{ query: data, season }] });
                    // }
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
                    const season = result === 0 ? "Rainy" : result === 1 ? "Spring" : result === 2 ? "Summer" : "Winter";
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
        if (!user) throw new CustomError("User not found", 404);
        const { limit = 10, next } = pagination;
        let query = {};

        const total = await Session.countDocuments({ userId });

        if (next) {
            const [nextId, nextCreatedAt] = next.split("_");
            query = {
                $or: [{ createdAt: { $gt: new Date(nextCreatedAt) } }, { createdAt: new Date(nextCreatedAt), _id: { $gt: nextId } }]
            };
        }

        const sessions = await Session.find({ userId, ...query }, { __v: 0 })
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
        const country: number = data.country === "kenya" ? 0 : data.country === "nigeria" ? 1 : data.country === "south africa" ? 2 : 3;
        const humidity: number =
            data.humidity >= 0 && data.humidity < 20
                ? 0
                : data.humidity >= 20 && data.humidity < 40
                ? 1
                : data.humidity >= 40 && data.humidity < 60
                ? 2
                : data.humidity >= 60 && data.humidity < 80
                ? 3
                : 4;
        const temperature: number = data.temperature < 19 ? 0 : data.temperature >= 19 && data.temperature < 24 ? 1 : data.temperature >= 24 && data.temperature < 29 ? 2 : 3;
        const ph: number = data.ph >= 0 && data.ph < 2 ? 0 : data.ph >= 2 && data.ph < 6 ? 1 : data.ph >= 6 && data.ph < 7 ? 2 : data.ph >= 7 && data.ph < 10 ? 3 : 4;

        const water_availability: number = data.water_availability < 50 ? 0 : data.water_availability >= 50 && data.water_availability < 100 ? 1 : 2;

        const label: number =
            data.label === "blackgram"
                ? 0
                : data.label === "chickpea"
                ? 1
                : data.label === "cotton"
                ? 2
                : data.label === "jute"
                ? 3
                : data.label === "kidneybeans"
                ? 4
                : data.label === "lentil"
                ? 5
                : data.label === "maize"
                ? 6
                : data.label === "mothbeans"
                ? 7
                : data.label === "mungbean"
                ? 8
                : data.label === "muskmelon"
                ? 9
                : data.label === "pigeonpeas"
                ? 10
                : data.label === "rice"
                ? 11
                : 12;
        // const season: number = data.season === "rain" ? 0 : data.season === "summer" ? 1 : data.season === "spring" ? 2 : 3;

        return { temperature, humidity, ph, water_availability, label, country };
    }
    async deleteOneSession(userId: string, sessionId: string) {
        const session = await Session.findOne({ userId: userId, _id: sessionId });
        if (!session) throw new CustomError("Session not found", 404);
        await session.deleteOne();
    }
    async deleteAllSession(userId: string) {
        const session = await Session.find({ userId: userId });
        if (!session.length) throw new CustomError("No session found", 404);
        await Session.deleteMany({ userId: userId });
    }
}

export default new SessionService();
