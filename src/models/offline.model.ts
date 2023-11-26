import mongoose from "mongoose";

export interface IOffline extends mongoose.Document {
    sessionId: string;
    query: {
        temperature: string;
        humidity: string;
        ph: string;
        water_availability: string;
        label: string;
        country: string;
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
            temperature: String,
            humidity: String,
            ph: String,
            water_availability: String,
            label: String,
            country: String
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model<IOffline>("offline", offlineSchema);
