'use server';

import { predictNextBloomDate, PredictNextBloomDateInput, PredictNextBloomDateOutput } from "@/ai/flows/predict-next-bloom-date";
import { getClimateData } from "@/ai/flows/get-climate-data";
import { getNdviData } from "@/ai/flows/get-ndvi-data";
import type { ClimateDataInput } from "@/ai/flows/types";
import type { NdviDataOutput } from "@/ai/flows/get-ndvi-data";


type PredictionResult = {
    success: true;
    data: PredictNextBloomDateOutput;
} | {
    success: false;
    error: string;
};

type NdviResult = {
    success: true;
    data: NdviDataOutput;
} | {
    success: false;
    error: string;
};

export async function fetchNdviDataForRegion(input: ClimateDataInput): Promise<NdviResult> {
    try {
        const result = await getNdviData(input);
        if (result.length === 0) {
            return { success: false, error: "No NDVI data was found for the requested time period. The location may be over a large body of water or have other data availability issues." };
        }
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting NDVI data:", error);
        
        let errorMessage = "Could not fetch NDVI data.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}


// This combines fetching climate data and getting a prediction into one action.
export async function getEnhancedBloomPrediction(input: Omit<PredictNextBloomDateInput, 'climateData'>): Promise<PredictionResult> {
    try {
        // 1. Fetch climate data first
        const climateInput: ClimateDataInput = { lat: input.lat, lon: input.lon };
        const climateResult = await getClimateData(climateInput);

        // 2. Combine with other input and get prediction
        const predictionInput: PredictNextBloomDateInput = {
            ...input,
            climateData: climateResult,
        };
        
        const result = await predictNextBloomDate(predictionInput);
        return { success: true, data: result };

    } catch (error) {
        console.error("Error getting enhanced bloom prediction:", error);
        
        let errorMessage = "Failed to get prediction from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
