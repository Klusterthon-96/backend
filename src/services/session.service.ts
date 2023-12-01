/* eslint-disable @typescript-eslint/no-unused-vars */
import Session from "../models/session.model";
import JWT, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, URL } from "../config";
import CustomError from "../utils/custom-error";
import User from "../models/user.model";
import axios from "axios";
import { Types } from "mongoose";
import session from "express-session";

class SessionService {
    async newSession(data: PredictInput, userId: string, sessionId: string) {
        try {
            if (!data.Country || !data.humidity || !data.label || !data.ph || !data.temperature || !data.water_availability) {
                throw new CustomError("You're not passing in the correct parameters");
            }

            const decoded = JWT.verify(sessionId, JWT_SECRET!) as JwtPayload;
            // let session = await Session.findOne({ userId: userId, _id: decoded.id });

            const query = await this.convertInputToNumbers(data.temperature, data.humidity, data.ph, data.water_availability);
            if (query.humiNumber === undefined || query.phNumber === undefined || query.tempNumber === undefined || query.waterNumber === undefined)
                throw new CustomError("You're not passing the correct parameters");
            const request = {
                temperature: query.tempNumber,
                humidity: query.humiNumber,
                ph: query.phNumber,
                water_availability: query.waterNumber,
                label: data.label,
                Country: data.Country
            };
            const response = await axios.post(URL.ML_URL!, {
                temperature: query.tempNumber,
                humidity: query.humiNumber,
                ph: query.phNumber,
                water_availability: query.waterNumber,
                label: data.label,
                Country: data.Country
            });

            const sessionIdAsObjectId = new Types.ObjectId(decoded.id);

            await Session.create({
                _id: sessionIdAsObjectId,
                userId: userId,
                name: `Prediction for ${data.label}`,
                query_result: { query: request, result: response.data.harvest_season }
            });

            return { result: response.data.harvest_season, userId: userId, _id: decoded.id };
        } catch (error) {
            throw new CustomError("Error Generating prediction", 500);
        }
    }
    async getSession(userId: string, sessionId: string) {
        const user = await User.findById(userId);
        if (!user) throw new CustomError("User not found", 404);
        const session = await Session.findOne({ userId: userId, _id: sessionId });
        if (!session) throw new CustomError("Session Not found", 404);
        return session;
    }
    // async continueSession(data: PredictInput, userId: string, sessionId: string) {
    //     try {
    //         if (!data.Country || !data.humidity || !data.label || !data.ph || !data.temperature || !data.water_availability) {
    //             throw new CustomError("You're not passing in the correct parameters");
    //         }
    //         const session = await Session.findOne({ userId: userId, _id: sessionId });

    //         if (!session || session === null) throw new CustomError("Session Not found", 404);

    //         const query = await this.convertInputToNumbers(data.temperature, data.humidity, data.ph, data.water_availability);

    //         if (query.humiNumber === undefined || query.phNumber === undefined || query.tempNumber === undefined || query.waterNumber === undefined)
    //             throw new CustomError("You're not passing the correct parameters");
    //         const request = {
    //             temperature: query.tempNumber,
    //             humidity: query.humiNumber,
    //             ph: query.phNumber,
    //             water_availability: query.waterNumber,
    //             label: data.label,
    //             Country: data.Country
    //         };

    //         const response = await axios.post(URL.ML_URL!, {
    //             temperature: query.tempNumber,
    //             humidity: query.humiNumber,
    //             ph: query.phNumber,
    //             water_availability: query.waterNumber,
    //             label: data.label,
    //             Country: data.Country
    //         });
    //         session.query_result = { query: request, result: response.data.harvest_season };
    //         await session.save();
    //         return { result: response.data.harvest_season };
    //     } catch (error) {
    //         throw new CustomError("Error Generating Result", 500);
    //     }
    // }
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

        const sessionsQuery = Session.find({ userId, ...query }, { __v: 0 })
            .sort({ createdAt: -1, _id: -1 })
            .limit(Number(limit) + 1);

        const sessions = await sessionsQuery.exec();

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

    async convertInputToNumbers(temperature: string, humidity: string, ph: string, water: string) {
        const tempNumber: number | undefined = temperature === "cool" ? 16 : temperature === "mild" ? 21 : temperature === "warm" ? 26 : temperature === "hot" ? 30 : undefined;
        const humiNumber: number | undefined =
            humidity === "low" ? 10 : humidity === "moderate" ? 30 : humidity === "average" ? 45 : humidity === "high" ? 81 : humidity === "very high" ? 90 : undefined;
        const phNumber: number | undefined =
            ph === "strongly acidic" ? 1 : ph === "moderately acidic" ? 3 : ph === "neutral" ? 6.5 : ph === "moderately alkaline" ? 8 : ph === "highly alkaline" ? 11 : undefined;
        const waterNumber: number | undefined = water === "low" ? 30 : water === "moderate" ? 60 : water === "high" ? 120 : undefined;
        return { tempNumber, humiNumber, phNumber, waterNumber };
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
