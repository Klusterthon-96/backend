import express from "express";
// import https from "https";
import http from "http";
// import fs from "fs";
// import path from "path";
import "express-async-errors";
import cookieParser from "cookie-parser";
import session from "express-session";
import treblle from "@treblle/express";
import rateLimiter from "express-rate-limit";
import { Server } from "socket.io";

export const app = express();

app.set("trust proxy", true);
app.use(
    session({
        secret: "348d1911e5741ff7d5a20bb384d1adb2c0fb255ecf4263ba25435f17d47e4e18",
        resave: false,
        saveUninitialized: true,
        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 + 60 * 60 * 24 * 7
        }
    })
);

app.use(cookieParser());
const limiter = rateLimiter({
    windowMs: 1000,
    max: 15
});

app.use(limiter);

// const certificateFolder = "certificate";

// const privateKey = fs.readFileSync(path.join(__dirname, certificateFolder, "private.pem"), "utf8");
// const certificate = fs.readFileSync(path.join(__dirname, certificateFolder, "certificate.crt"), "utf8");
// const credentials = { key: privateKey, cert: certificate };

// const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer(app);

import preRouteMiddleware from "./middlewares/pre-route.middleware";
preRouteMiddleware(app);

app.use(
    treblle({
        apiKey: process.env.TREBLLE_API_KEY,
        projectId: process.env.TREBLLE_PROJECT_ID,
        additionalFieldsToMask: []
    })
);

import routes from "./routes";
app.use(routes);

import errorMiddleware from "./middlewares/error.middleware";
errorMiddleware(app);

import { HTTP } from "./config";

import "./database/index";
import sessionService from "./services/session.service";

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "https://agro-assistant.netlify.app"],
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log(`User connect: ${socket.id}`);

    socket.on(`session`, async (data) => {
        const result = await sessionService.getSession(data.userId, data._id);
        socket.emit("session received", result);
    });
});

httpServer.listen(HTTP, async () => {
    console.log(`:::> 🚀 Server ready at http://localhost:${HTTP}`);
});
// httpsServer.listen(PORT, async () => {
//     console.log(`:::> 🚀 Server ready at https://localhost:${PORT}`);
// });

app.on("error", (error) => {
    console.error(`<::: An error occurred on the server: \n ${error}`);
});
