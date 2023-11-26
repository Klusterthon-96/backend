import mongoose from "mongoose";

export interface IOffline extends mongoose.Document {
    sessionId: string;
    query: {
        temperature: number;
        humidity: number;
        ph: number;
        water_availability: number;
        label: string;
        Country: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const offlineSchema: mongoose.Schema = new mongoose.Schema(
    {
        sessionId: {
            type: String
        },
        query: {
            temperature: Number,
            humidity: Number,
            ph: Number,
            water_availability: Number,
            label: String,
            Country: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IOffline>("offline", offlineSchema);
