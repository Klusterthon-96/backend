import mongoose from "mongoose";

export interface ISession extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    query_result: {
        query: {
            temperature: number;
            humidity: number;
            ph: number;
            water_availability: number;
            label: string;
            Country: string;
        };
        result: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
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
                query: { temperature: Number, humidity: Number, ph: Number, water_availability: Number, label: String, Country: String },
                result: String
            }
        ]
    },
    {
        timestamps: true
    }
);

export default mongoose.model<ISession>("session", sessionSchema);
