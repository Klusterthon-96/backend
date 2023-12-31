import JWT, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";
import CustomError from "../utils/custom-error";

import type { Request, Response, NextFunction } from "express";

const urlToSkip = ["/api/v1/auth/email"];
const { JWT_SECRET } = process.env;

/**
 * If no role is passed the default role is user
 *
 * @param  {any[]} roles List of roles allowed to access the route
 */
const auth = (roles: string[] = []) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.headers.authorization) throw new CustomError("unauthorized access: Token not found", 401);
        const token = req.headers.authorization.split(" ")[1];
        const decoded = JWT.verify(token, JWT_SECRET!) as JwtPayload;

        const user = await User.findOne({ _id: decoded.id });

        if (!user) throw new CustomError("unauthorized access: User does not exist", 401);

        if (urlToSkip.some((url) => req.originalUrl.includes(url))) {
        } else {
            if (!user.isVerified) throw new CustomError("unauthorized access: Please verify email address", 401);
        }

        if (!roles.includes(user.role)) throw new CustomError("unauthorized access", 401);

        req.$user = user;

        next();
    };
};

export default auth;
