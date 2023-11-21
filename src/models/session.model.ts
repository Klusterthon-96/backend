import mongoose from "mongoose";

export interface ISession extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    query_result: {
        query: {
            temperature: number;
            humidity: number;
            ph: number;
            water_availability: string;
            label: string;
            country: string;
        };
        result: string;
    }[];
}

const sessionSchema: mongoose.Schema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "user"
        },
        name: {
            type: String
        },
        query_result: [
            {
                query: { temperature: Number, humidity: Number, ph: Number, water_availability: String, label: String, country: String },
                result: String
            }
        ]
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ISession>("session", sessionSchema);
