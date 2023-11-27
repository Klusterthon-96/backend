/* eslint-disable @typescript-eslint/no-explicit-any */
import ms from "ms";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

import User from "./../models/user.model";
import MailService from "./mail.service";
import CustomError from "../utils/custom-error";
import { JWT_SECRET, URL } from "../config";
import Token from "../models/token.model";
class AuthService {
    async register(data: RegisterInput) {
        if (!data.name || !data.password || !data.email || !data.gender || !data.termsOfService) throw new CustomError("Please provide all required  fields");

        let user = await User.findOne({ email: data.email });
        if (user) throw new CustomError("email already exists");

        const validate = await this.isPasswordValid({ password: data.password });

        if (!validate) {
            throw new CustomError("Password must contain at least one capital letter, one special character, one number, one small letter, and be at least 8 characters long");
        }

        user = await new User(data).save();

        await this.requestEmailVerification(user._id.toString());

        const authTokens = await this.generateAuthTokens({
            userId: user._id,
            role: user.role
        });

        return {
            user,
            token: authTokens.accessToken,
            refreshToken: authTokens.refreshToken
        };
    }

    async login(data: LoginInput) {
        if (!data.email) throw new CustomError("email is required");
        if (!data.password) throw new CustomError("password is required");

        // Check if user exist
        const user = await User.findOne({ email: data.email }).select("+password");
        if (!user) throw new CustomError("incorrect email or password");

        // Check if user password is correct
        const isCorrect = await bcrypt.compare(data.password, user.password);
        if (!isCorrect) throw new CustomError("incorrect email or password");

        const authTokens = await this.generateAuthTokens({
            userId: user._id,
            role: user.role
        });

        user.password = "";

        return {
            user,
            token: authTokens.accessToken,
            refreshToken: authTokens.refreshToken
        };
    }

    async generateAuthTokens(data: GenerateTokenInput) {
        const { userId, role } = data;

        const accessToken = JWT.sign({ id: userId, role }, JWT_SECRET!, { expiresIn: "1 day" });

        const refreshToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(refreshToken, 10);

        const refreshTokenJWT = JWT.sign({ userId, refreshToken }, JWT_SECRET!, { expiresIn: "1 day" });

        await new Token({
            userId,
            token: hash,
            type: "refresh_token",
            expiresAt: Date.now() + ms("30 days")
        }).save();

        return { accessToken, refreshToken: refreshTokenJWT };
    }

    async refreshAccessToken(data: RefreshTokenInput) {
        const { refreshToken: refreshTokenJWT } = data;

        const decoded: any = JWT.verify(refreshTokenJWT, JWT_SECRET!);
        let { refreshToken } = decoded;
        const { userId } = decoded;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");
        const RTokens = await Token.find({ userId, type: "refresh_token" });
        if (RTokens.length === 0) throw new CustomError("invalid or expired refresh token");

        let tokenExists = false;

        for (const token of RTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.token);

            if (isValid) {
                tokenExists = true;
                break;
            }
        }

        if (!tokenExists) throw new CustomError("invalid or expired refresh token");

        const accessToken = JWT.sign({ id: user._id, role: user.role }, JWT_SECRET!, {
            expiresIn: "1 day"
        });

        refreshToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(refreshToken, 10);

        const refreshTokenJWTNew = JWT.sign({ userId, refreshToken }, JWT_SECRET!, {
            expiresIn: "30 days"
        });

        const tokenData = {
            userId: userId,
            token: hash,
            type: "refresh_token",
            expiresAt: Date.now() + ms("30 days")
        };

        await Token.create(tokenData);

        return { accessToken, refreshTokenJWTNew };
    }

    async logout(data: LogoutInput) {
        const { refreshToken: refreshTokenJWT } = data;

        const decoded: any = JWT.verify(refreshTokenJWT, JWT_SECRET!);
        const { refreshToken, userId } = decoded;

        const user = await User.findOne({ _id: userId });
        if (!user) throw new CustomError("User does not exist");

        const RTokens = await Token.find({ userId, type: "refresh_token" });
        if (RTokens.length === 0) throw new CustomError("invalid or expired refresh token");

        let tokenExists = false;

        for (const token of RTokens) {
            const isValid = await bcrypt.compare(refreshToken, token.token);

            if (isValid) {
                tokenExists = true;
                await token.deleteOne();

                break;
            }
        }

        if (!tokenExists) throw new CustomError("invalid or expired refresh token");

        return true;
    }

    async verifyEmail(data: VerifyEmailInput, userId: string) {
        const { verifyToken } = data;

        const user = await User.findById(userId);
        if (!user) throw new CustomError("User with this Id not found");

        if (user.isVerified) throw new CustomError("Email is already verified");
        const VToken = await Token.findOne({ userId, type: "verify_email" });
        if (!VToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(verifyToken, VToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        await User.updateOne({ _id: userId }, { $set: { isVerified: true } }, { new: true });

        await VToken.deleteOne();

        await new MailService(user).sendSuccessVerificationMail();
        return true;
    }

    async requestEmailVerification(userId: string) {
        if (!userId) throw new CustomError("email is required");
        const user = await User.findById(userId);

        if (!user) throw new CustomError("user does not exist", 404);
        if (user.isVerified) throw new CustomError("email is already verified");

        const token = await Token.findOne({ userId: user.id, type: "verify_email" });
        if (token) await token.deleteOne();

        const verifyToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(verifyToken, 10);

        await new Token({
            token: hash,
            userId: user.id,
            type: "verify_email",
            expiresAt: Date.now() + ms("1h")
        }).save();

        const link = `${URL.CLIENT_URL}/email-verification?uid=${user._id}&verifyToken=${verifyToken}`;

        // Send Mail
        await new MailService(user).sendEmailVerificationMail(link);

        return true;
    }

    async requestPasswordReset(email: string) {
        if (!email) throw new CustomError("email is required");

        const user = await User.findOne({ email });
        if (!user) throw new CustomError("email does not exist");

        const token = await Token.findOne({ userId: user.id, type: "reset_password" });
        if (token) await token.deleteOne();

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hash = await bcrypt.hash(resetToken, 10);

        await new Token({
            token: hash,
            userId: user.id,
            type: "reset_password",
            expiresAt: Date.now() + ms("1h")
        }).save();

        const link = `${URL.CLIENT_URL}/reset-password?uid=${user._id}&resetToken=${resetToken}`;

        // Send Mail
        await new MailService(user).sendPasswordResetMail(link);

        return true;
    }

    async resetPassword(data: ResetPasswordInput) {
        const { userId, resetToken, password, confirmPassword } = data;

        const user = await User.findById(userId);

        if (!user) throw new CustomError("Token has expired or invalid");

        const RToken = await Token.findOne({ userId, type: "reset_password" });
        if (!RToken) throw new CustomError("invalid or expired password reset token");

        const isValid = await bcrypt.compare(resetToken, RToken.token);
        if (!isValid) throw new CustomError("invalid or expired password reset token");

        if (password !== confirmPassword) throw new CustomError("Paasword does not match");

        const validate = await this.isPasswordValid({ password });

        if (!validate) {
            throw new CustomError("Password must contain at least one capital letter, one special character, one number, one small letter, and be at least 8 characters long");
        }
        user.password = password;
        user.save();
        await new MailService(user).sendSuccessPasswordReset();
        return true;
    }

    async updatePassword(userId: string, data: UpdatePasswordInput) {
        if (!data.oldPassword) throw new CustomError("password is required");
        if (!data.newPassword) throw new CustomError("new password is required");

        const user = await User.findOne({ _id: userId }).select("+password");
        if (!user) throw new CustomError("user dose not exist");

        const isCorrect = await bcrypt.compare(data.oldPassword, user.password);
        if (!isCorrect) throw new CustomError("incorrect password");

        if (data.oldPassword == data.newPassword) throw new CustomError("change password to something different");

        if (data.newPassword !== data.confirmPassword) throw new CustomError("Password does not match");

        const validate = await this.isPasswordValid({
            password: data.newPassword
        });

        if (!validate) {
            throw new CustomError("Password must contain at least one capital letter, one special character, one number, one small letter, and be at least 8 characters long");
        }

        const hash = await bcrypt.hash(data.newPassword, 10);

        await User.updateOne({ _id: userId }, { $set: { password: hash } }, { new: true });

        return true;
    }
    async isPasswordValid(data: PasswordValidator) {
        const { password } = data;
        const capitalLetterRegex = /[A-Z]/;
        const specialCharRegex = /[!@#$%^&*]/;
        const numberRegex = /[0-9]/;
        const smallLetterRegex = /[a-z]/;

        return capitalLetterRegex.test(password) && specialCharRegex.test(password) && numberRegex.test(password) && smallLetterRegex.test(password) && password.length >= 8;
    }
}

export default new AuthService();
