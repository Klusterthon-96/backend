import { testAuth } from "./auth";
import { predictionTest } from "./prediction";
import { userTest } from "./user";
import { offlineTest } from "./offline";

describe("Sequential Test", () => {
    testAuth();
    predictionTest();
    userTest();
    offlineTest();
});
