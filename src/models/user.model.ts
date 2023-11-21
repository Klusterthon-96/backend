import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    isVerified: boolean;
    gender: string;
    termsOfService: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema: mongoose.Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        gender: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            trim: true,
            enum: ["user", "admin"],
            default: "user"
        },
        isVerified: {
            type: Boolean,
            required: true,
            default: false
        },
        termsOfService: {
            type: Boolean,
            required: true,
            default: true
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        emailVerificationToken: String,
        emailVerificationExpire: Date
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;

    next();
});

export default mongoose.model<IUser>("user", userSchema);
