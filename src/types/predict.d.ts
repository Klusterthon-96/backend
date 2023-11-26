interface PredictInput {
    temperature: string;
    humidity: string;
    ph: string;
    water_availability: string;
    label: "blackgram" | "chickpea" | "cotton" | "jute" | "kidneybeans" | "lentil" | "maize" | "mothbeans" | "mungbean" | "muskmelon" | "pigeonpeas" | "rice" | "watermelon";
    // season: "rain" | "summer" | "spring" | "winter";
    Country: "Kenya" | "Nigeria" | "South Africa" | "Sudan";
}
