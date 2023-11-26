/* eslint-disable no-var */
import type { Request, Response } from "express";
import Offline from "../models/offline.model";
import axios from "axios";
import { URL } from "../config";

class OfflineController {
    async start(req: Request, res: Response) {
        const query = {
            temperature: "",
            humidity: "",
            ph: "",
            water_availability: "",
            label: "",
            Country: ""
        };

        let session = await Offline.findOne({ sessionId: req.body.sessionId });

        if (!session && req.body.text === "") {
            session = await Offline.create({ sessionId: req.body.sessionId, query });
        } else if (!session && req.body.text !== "") {
            return;
        }
        const text = req.body.text;
        let response = "";

        if (req.body.phoneNumber.startsWith("+234")) {
            session!.query.Country = "Nigeria";
            await session!.save();
        } else if (req.body.phoneNumber.startsWith("+27")) {
            session!.query.Country = "South Africa";
            await session!.save();
        } else if (req.body.phoneNumber.startsWith("+254")) {
            session!.query.Country = "Kenya";
            await session!.save();
        } else if (req.body.phoneNumber.startsWith("+249")) {
            session!.query.Country = "Sudan";
            await session!.save();
        }
        if (text.length === 12 || text.length === 11) {
            if (session && session.query) {
                const label = text.split("*")[5];
                if (label === "1") {
                    session.query.label = "blackgram";
                    await session.save();
                } else if (label === "2") {
                    session.query.label = "chickpea";
                    await session.save();
                } else if (label === "3") {
                    session.query.label = "cotton";
                    await session.save();
                } else if (label === "4") {
                    session.query.label = "jute";
                    await session.save();
                } else if (label === "5") {
                    session.query.label = "kidneybeans";
                    await session.save();
                } else if (label === "6") {
                    session.query.label = "lentil";
                    await session.save();
                } else if (label === "7") {
                    session.query.label = "maize";
                    await session.save();
                } else if (label === "8") {
                    session.query.label = "mothbeans";
                    await session.save();
                } else if (label === "9") {
                    session.query.label = "mungbean";
                    await session.save();
                } else if (label === "10") {
                    session.query.label = "muskmelon";
                    await session.save();
                } else if (label === "11") {
                    session.query.label = "pigeonpeas";
                    await session.save();
                } else if (label === "12") {
                    session.query.label = "rice";
                    await session.save();
                } else if (label === "13") {
                    session.query.label = "watermelon";
                    await session.save();
                }
                const query = await Offline.findOne({ sessionId: req.body.sessionId });

                if (query) {
                    console.log(query);
                    try {
                        const response = await axios.post(URL.ML_URL!, {
                            temperature: query.query.temperature,
                            humidity: query.query.humidity,
                            ph: query.query.ph,
                            water_availability: query.query.water_availability,
                            label: query.query.label,
                            Country: query.query.Country
                        });
                        console.log(response.data.harvest_season);
                        var result = response.data.harvest_season;
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }

        async function handleTemperatureInput(temperatureCode: string) {
            if (temperatureCode === "1") {
                session!.query.temperature = 16;
                await session!.save();
            } else if (temperatureCode === "2") {
                session!.query.temperature = 21;
                await session!.save();
            } else if (temperatureCode === "3") {
                session!.query.temperature = 25;
                await session!.save();
            } else if (temperatureCode === "4") {
                session!.query.temperature = 30;
                await session!.save();
            }
        }

        async function handleHumidityInput(humidityCode: string) {
            if (humidityCode === "1") {
                session!.query.humidity = 10;
                await session!.save();
            } else if (humidityCode === "2") {
                session!.query.humidity = 22;
                await session!.save();
            } else if (humidityCode === "3") {
                session!.query.humidity = 43;
                await session!.save();
            } else if (humidityCode === "4") {
                session!.query.humidity = 70;
                await session!.save();
            } else if (humidityCode === "5") {
                session!.query.humidity = 85;
                await session!.save();
            }
        }

        async function handlePhInput(phCode: string) {
            if (phCode === "1") {
                session!.query.ph = 1.9;
                await session!.save();
            } else if (phCode === "2") {
                session!.query.ph = 4;
                await session!.save();
            } else if (phCode === "3") {
                session!.query.ph = 6.5;
                await session!.save();
            } else if (phCode === "4") {
                session!.query.ph = 8;
                await session!.save();
            } else if (phCode === "5") {
                session!.query.ph = 11;
                await session!.save();
            }
        }
        async function handleWaterInput(waterCode: string) {
            if (waterCode === "1") {
                session!.query.water_availability = 30;
                await session!.save();
            } else if (waterCode === "2") {
                session!.query.water_availability = 60;
                await session!.save();
            } else if (waterCode === "3") {
                session!.query.water_availability = 105;
                await session!.save();
            }
        }

        if (text.length === 0) {
            // Initial welcome message
            response = "CON Hi comrade, Welcome to your Agro Assistant \n\n What will you like to do today?\n";
            response += "1. Enter Crop details\n";
            response += "2. Contact support\n";
        } else if (text.startsWith("1") && text.length === 1) {
            response = "CON  What is your temperature \n";
            response += "1. Cool: 15-18.99 \n";
            response += "2. Mild: 19-23.99 \n";
            response += "3. Warm: 24-28.99 \n";
            response += "4. Hot: 29 and above\n";
        } else if (text.startsWith("2") && text.length === 1) {
            response = "END  Support Service not avaliable now\n";
        } else if (text.startsWith("1") && text.length === 3) {
            const temperatureCode = text.split("*")[1];
            handleTemperatureInput(temperatureCode);
            response = "CON What is your Humidity? \n";
            response += "1. Low: 0-19.99 \n";
            response += "2. Moderate: 20-39.99\n";
            response += "3. Average: 40-59.99\n";
            response += "4. High: 60-79.99\n";
            response += "5. Very High: 80 and above";
        } else if (text.startsWith("1") && text.length === 5) {
            const humidityCode = text.split("*")[2];
            handleHumidityInput(humidityCode);
            response = "CON What is your pH level? \n";
            response += "1. Strongly Acidic: 0-1.99 \n";
            response += "2. Moderately Acidic: 2-5.99\n";
            response += "3. Neutral: 6-6.99\n";
            response += "4. Moderately Alkaline: 7-9.99\n";
            response += "5. Highly Alkaline: 10 and above";
        } else if (text.startsWith("1") && text.length === 7) {
            const phCode = text.split("*")[3];
            handlePhInput(phCode);
            response = "CON What is your water availability? \n\n";
            response += "1. Low: 0-49.99\n";
            response += "2. Moderate: 50-99.99\n";
            response += "3. High: 100 and abovee\n";
        } else if (text.startsWith("1") && text.length === 9) {
            const waterCode = text.split("*")[4];
            handleWaterInput(waterCode);
            response = "CON What is your Crop? \n\n";
            response += "1. Blackgram\n";
            response += "2. Chickpea\n";
            response += "3. Cotton\n";
            response += "4. Jute\n";
            response += "5. Kidney Beans\n";
            response += "6. Lentil\n";
            response += "7. Maize\n";
            response += "8. Moth Beans\n";
            response += "9. Mungbean\n";
            response += "10. Pigeonpeas\n";
            response += "11. Rice\n";
            response += "12. Water Melon\n";
        } else if (text.startsWith("1") && text.length <= 12) {
            response = "END Harvest season is \n\n";
            response += `${result}`;
        }

        // if (text === "") {
        //     // Initial welcome message
        //     response = "CON Hi comrade, Welcome to your Agro Assistant \n\n What will you like to do today?\n";
        //     response += "1. Enter Crop details\n";
        //     response += "2. Contact support\n";
        // } else if (text === "1") {
        //     // Ask for temperature input
        //     response = "CON  What is your temperature \n";
        //     response += "1. Cool: 15-18.99 \n";
        //     response += "2. Mild: 19-23.99 \n";
        //     response += "3. Warm: 24-28.99 \n";
        //     response += "4. Hot: 29 and above\n";
        // } else if (text.startsWith("1*") && text.length <= 3) {
        //     const temperatureCode = text.split("*")[1];
        //     console.log(temperatureCode);
        //     handleTemperatureInput(temperatureCode);
        //     console.log(query);
        //     response = "CON What is your Humidity? \n";
        //     response += "1. Low: 0-19.99 \n";
        //     response += "2. Moderate: 20-39.99\n";
        //     response += "3. Average: 40-59.99\n";
        //     response += "4. Very High: 80 and above";
        // } else if ((text.startsWith("1*1*") || text.startsWith("1*2*") || text.startsWith("1*3*") || text.startsWith("1*4*")) && text.length <= 5) {
        //     const humidityCode = text.split("*")[2];
        //     handleHumidityInput(humidityCode);
        //     console.log(query);
        //     response = "CON What is your pH level? \n";
        //     response += "1. Strongly Acidic: 0-1.99 \n";
        //     response += "2. Moderately Acidic: 2-5.99\n";
        //     response += "3. Neutral: 6-6.99\n";
        //     response += "4. Moderately Alkaline: 7-9.99\n";
        //     response += "5. Highly Alkaline: 10 and above";
        // } else if (
        //     (text.startsWith("1*1*1*") ||
        //         text.startsWith("1*2*1*") ||
        //         text.startsWith("1*3*1*") ||
        //         text.startsWith("1*4*1*") ||
        //         text.startsWith("1*1*2*") ||
        //         text.startsWith("1*2*2*") ||
        //         text.startsWith("1*3*2*") ||
        //         text.startsWith("1*4*2*") ||
        //         text.startsWith("1*1*3*") ||
        //         text.startsWith("1*2*3*") ||
        //         text.startsWith("1*3*3*") ||
        //         text.startsWith("1*4*3*") ||
        //         text.startsWith("1*1*4*") ||
        //         text.startsWith("1*2*4*") ||
        //         text.startsWith("1*3*4*") ||
        //         text.startsWith("1*4*4*") ||
        //         text.startsWith("1*1*5*") ||
        //         text.startsWith("1*2*5*") ||
        //         text.startsWith("1*3*5*") ||
        //         text.startsWith("1*4*5*")) &&
        //     text.length <= 7
        // ) {
        //     const phCode = text.split("*")[3];
        //     handlePhInput(phCode);
        //     response = "CON What is your water availability? \n\n";
        //     response += "1. Low: 0-49.99\n";
        //     response += "2. 50-99.99\n";
        //     response += "3. 100 and above\n";
        // } else if (
        //     (text.startsWith("1*1*1*1*") ||
        //         text.startsWith("1*2*1*") ||
        //         text.startsWith("1*3*1*") ||
        //         text.startsWith("1*4*1*") ||
        //         text.startsWith("1*1*2*") ||
        //         text.startsWith("1*2*2*") ||
        //         text.startsWith("1*3*2*") ||
        //         text.startsWith("1*4*2*") ||
        //         text.startsWith("1*1*3*") ||
        //         text.startsWith("1*2*3*") ||
        //         text.startsWith("1*3*3*") ||
        //         text.startsWith("1*4*3*") ||
        //         text.startsWith("1*1*4*") ||
        //         text.startsWith("1*2*4*") ||
        //         text.startsWith("1*3*4*") ||
        //         text.startsWith("1*4*4*") ||
        //         text.startsWith("1*1*5*") ||
        //         text.startsWith("1*2*5*") ||
        //         text.startsWith("1*3*5*") ||
        //         text.startsWith("1*4*5*")) &&
        //     text.length <= 7
        // ) {
        //     // Handle other cases if needed
        // }

        res.set("Content-Type", "text/plain");
        res.send(response);
    }
}

export default new OfflineController();
