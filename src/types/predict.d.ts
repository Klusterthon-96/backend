interface PredictInput {
    temperature: number;
    humidity: number;
    ph: number;
    water_availability: number;
    label: "blackgram" | "chickpea" | "cotton" | "jute" | "kidneybeans" | "lentil" | "maize" | "mothbeans" | "mungbean" | "muskmelon" | "pigeonpeas" | "rice" | "watermelon";
    season: "rain" | "summer" | "spring" | "winter";
    country: "kenya" | "nigeria" | "south africa" | "sudan";
}

