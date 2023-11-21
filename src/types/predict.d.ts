interface PredictInput {
    temperature: number;
    humidity: number;
    ph: number;
    water_availability: number;
    label: "maize" | "chickpea" | "kidneybeans" | "pigeonpeas" | "mothbeans" | "mungbeans" | "blackgram" | "lentil" | "watermelon" | "muskmelon" | "cotton" | "jute";
    country: "nigeria" | "south africa" | "kenya" | "sudan";
}
