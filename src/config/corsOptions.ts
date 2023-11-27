/* eslint-disable @typescript-eslint/no-explicit-any */
import allowedOrigins from "./allowedOrigin";

const corsOptions = {
    origin: (origin:any, callback:any) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    optionsSuccessStatus: 200
};

export default corsOptions;
