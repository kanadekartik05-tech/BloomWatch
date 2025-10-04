'use server';

import { getBatchPredictions as getBatchPredictionsFlow, BatchPredictionOutput } from "@/ai/flows/get-batch-predictions";
import type { Region } from "@/lib/data";

export type { SinglePredictionResult } from '@/ai/flows/get-batch-predictions';

type BatchPredictionResult = {
    success: true;
    predictions: BatchPredictionOutput;
} | {
    success: false;
    error: string;
};

export async function getBatchPredictions(regions: Region[]): Promise<BatchPredictionResult> {
    try {
        const result = await getBatchPredictionsFlow({ regions });
        return { success: true, predictions: result };
    } catch (error) {
        console.error("Error getting batch predictions:", error);
        
        let errorMessage = "Failed to get batch predictions from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
