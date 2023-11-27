/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "redis";
import { REDIS_HOST } from "../config";

const isDocker = process.env.DOCKER === "true";

const HOST = isDocker ? "redis" : REDIS_HOST;
console.log(HOST)

const logStruct = (func: any, error: any) => {
    return { func, file: "cacheLib", error };
};

const client = createClient({
    host: HOST,
    port: 6379
} as any);

client.on("connect", () => {
    console.log(":::>  Redis Connected");
});

client.on("ready", () => {
    console.log(":::>  Redis is ready");
});

client.on("error", (err) => console.error(logStruct("Redis is not running", err)));

client.on("end", () => {
    console.log("Client disconnected from redis");
});

process.on("SIGINT", () => {
    client.quit();
    process.exit();
});

client.connect();
export default client;
