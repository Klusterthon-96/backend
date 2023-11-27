import supertest from "supertest";
import { app } from "..";

export const offlineTest = () => {
    describe("offline test", () => {
        describe("initilizing", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("temperature", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "1",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("humidity", () => {
            it("should return a 400 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "1*2",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("ph", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "1*2*3",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("water", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "1*2*3*2",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("label", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "1*2*3*2*2",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
        describe("finish", () => {
            it("should return a 200 status code", async () => {
                const response = await supertest(app).post("/api/v1/offline/").send({
                    text: "1*2*3*2*2*11",
                    sessionId: "iceicnecencqncnnqociwncqpciqnicncnqqo",
                    phoneNumber: "+23400000000"
                });
                expect(response.status).toBe(200);
            });
        });
    });
};
