import allowedOrigin from "../config/allowedOrigin";
import type { Request, Response, NextFunction } from "express";

const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (allowedOrigin.includes(origin!)) {
        res.header("Access-Control-Allow-Credentials", "true");
    } else {
        res.header("Access-Control-Allow-Credentials", ""); 
    }
    next();
};

export { allowedOrigin };
export default credentials;
