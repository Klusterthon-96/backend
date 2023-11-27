import supertest from "supertest";
import { app } from "..";
import { accessToken } from "./auth";

export let sid: string;
export let sessionId: string;
export const predictionTest = () => {
    describe("Prediction Test", () => {
        describe("intialize session", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/session/").set("Authorization", `Bearer ${accessToken}`).send();
                const setCookieHeader = response.header["set-cookie"];

                for (const cookie of setCookieHeader) {
                    const match = cookie.match(/sid=([^;]+)/);
                    if (match && match.length > 1) {
                        sid = match[1];
                        break;
                    }
                }

                if (sid) {
                    console.log("Found sid:", sid);
                } else {
                    console.log("Session token not found");
                }

                expect(response.status).toBe(200);
            });
        });
        describe("New session", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app)
                    .put("/api/v1/session/")
                    .set("Cookie", [`sid=${sid}`])
                    .set("Authorization", `Bearer ${accessToken}`)
                    .send({
                        temperature: "warm",
                        humidity: "low",
                        ph: "moderately alkaline",
                        water_availability: "high",
                        label: "chickpea",
                        country: "Nigeria"
                    });
                expect(response.status).toBe(200);
            }, 10000);
        });
        describe("Get All Session", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).get("/api/v1/session/").set("Authorization", `Bearer ${accessToken}`);
                sessionId = response.body.data.sessions[0]._id;
                expect(response.status).toBe(200);
            });
        });
        describe("Get One Session", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).get(`/api/v1/session/${sessionId}`).set("Authorization", `Bearer ${accessToken}`);
                expect(response.status).toBe(200);
            });
        });
        describe("Continue One Session", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).put(`/api/v1/session/${sessionId}`).set("Authorization", `Bearer ${accessToken}`).send({
                    temperature: "warm",
                    humidity: "low",
                    ph: "moderately alkaline",
                    water_availability: "high",
                    label: "chickpea",
                    country: "Nigeria"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("Delete One Session", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).delete(`/api/v1/session/${sessionId}`).set("Authorization", `Bearer ${accessToken}`);
                expect(response.status).toBe(204);
            });
        });
        describe("Delete All session", () => {
            it("should return a 404 status code", async () => {
                const response = await supertest(app).delete(`/api/v1/session`).set("Authorization", `Bearer ${accessToken}`);
                expect(response.status).toBe(404);
            });
        });
    });
};
