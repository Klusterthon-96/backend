import { testAuth } from "./auth";
import { predictionTest } from "./prediction";
import { userTest } from "./user";

describe("Sequential Test", () => {
    testAuth();
    predictionTest();
    userTest();
});
