interface PredictInput {
    temperature: number;
    humidity: number;
    ph: number;
    water_availability: "low" | "moderate" | "high";
    label: "Maize" | "Chickpea" | "Kidneybeans" | "Pigeonpeas" | "Mothbeans" | "Mungbeans" | "Blackgram" | "Lentil" | "Watermelon" | "Muskmelon" | "Cotton" | "Jute";
    country: "Nigeria" | "South Africa" | "Kenya" | "Sudan";
}
