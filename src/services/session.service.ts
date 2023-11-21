/* eslint-disable @typescript-eslint/no-unused-vars */
import Session from "../models/session.model";
import JWT, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import CustomError from "../utils/custom-error";
import { spawn } from "child_process";
import mongoose, { Types } from "mongoose";

class SessionService {
    async create(data: PredictInput, userId: string, sessionId: string) {
        try {
            if (!data.country || !data.humidity || !data.label || !data.ph || !data.temperature || !data.water_availability) {
                throw new CustomError("You're not passing in the correct parameters");
            }

            const decoded = JWT.verify(sessionId, JWT_SECRET!) as JwtPayload;
            let session = await Session.findOne({ userId: userId, _id: decoded.id });

            const country: number = data.country === "Nigeria" ? 0 : data.country === "South Africa" ? 1 : data.country === "Kenya" ? 2 : 3;
            const humidity: number = data.humidity >= 0 && data.humidity <= 20 ? 0 : data.humidity <= 40 ? 1 : data.humidity <= 60 ? 2 : data.humidity <= 80 ? 3 : 4;
            const temperature: number = data.temperature <= 19 ? 0 : data.temperature <= 24 ? 1 : data.temperature <= 29 ? 2 : 3;
            const ph: number = data.ph <= 2 ? 0 : data.ph <= 6 ? 2 : data.ph === 7 ? 2 : 3;

            const water_availability: number = data.water_availability === "low" ? 0 : data.water_availability === "moderate" ? 1 : 2;

            const label: number =
                data.label === "Maize"
                    ? 0
                    : data.label === "Chickpea"
                    ? 1
                    : data.label === "Kidneybeans"
                    ? 2
                    : data.label === "Pigeonpeas"
                    ? 3
                    : data.label === "Mothbeans"
                    ? 4
                    : data.label === "Mungbeans"
                    ? 5
                    : data.label === "Blackgram"
                    ? 6
                    : data.label === "Lentil"
                    ? 7
                    : data.label === "Watermelon"
                    ? 8
                    : data.label === "Muskmelon"
                    ? 9
                    : data.label === "Cotton"
                    ? 10
                    : 11;

            const query = { temperature, humidity, ph, water_availability, label, country };

            const season = await new Promise<string>((resolve, reject) => {
                const pythonProcess = spawn("python3", ["dist/ML/script.py", JSON.stringify(query)]);
                let result: number;

                pythonProcess.stdout.on("data", (data) => {
                    result = parseInt(data.toString());
                    console.log(result)
                });

                pythonProcess.on("close", async () => {
                    const season = result === 0 ? "Rainy" : result === 1 ? "Winter" : result === 2 ? "Spring" : "Summer";
                    if (session) {
                        session.query_result.push({ query: data, result: season });
                        await session.save();
                    } else {
                        const sessionIdAsObjectId = new Types.ObjectId(decoded.id);

                        session = await Session.create({ _id: sessionIdAsObjectId, userId: userId, query_result: [{ query: data, result }] });
                    }
                    resolve(season);
                });
            });
            return { season };
        } catch (error) {
            throw new CustomError("Error Generating Result", 500);
        }
    }
}

export default new SessionService();
