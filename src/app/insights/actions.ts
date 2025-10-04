'use server';

import { predictNextBloomDate, PredictNextBloomDateInput, PredictNextBloomDateOutput } from "@/ai/flows/predict-next-bloom-date";

type PredictionResult = {
    success: true;
    data: PredictNextBloomDateOutput;
} | {
    success: false;
    error: string;
};

export async function getBloomPrediction(input: PredictNextBloomDateInput): Promise<PredictionResult> {
    try {
        const result = await predictNextBloomDate(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting bloom prediction:", error);
        
        let errorMessage = "Failed to get prediction from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
