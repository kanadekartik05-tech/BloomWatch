'use server';

import { getBatchPredictions as getBatchPredictionsFlow } from "@/ai/flows/get-batch-predictions";
import type { BatchPredictionOutput, SinglePredictionResult } from "@/ai/flows/types";
import type { Region } from "@/lib/data";
import type { City } from "@/lib/geodata";


export type { SinglePredictionResult } from '@/ai/flows/types';

type BatchPredictionResult = {
    success: true;
    predictions: BatchPredictionOutput;
} | {
    success: false;
    error: string;
};

export async function getBatchPredictions(regions: (Region | City)[]): Promise<BatchPredictionResult> {
    try {
        const mappedRegions = regions.map(r => ({
            name: r.name,
            lat: r.lat,
            lon: r.lon,
            // Provide a default latest_bloom if it doesn't exist (for City types)
            latest_bloom: 'latest_bloom' in r ? r.latest_bloom : `${new Date().getFullYear()}-01-01`
        }));

        const result = await getBatchPredictionsFlow({ regions: mappedRegions });
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
