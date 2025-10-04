'use server';

import { getClimateData, ClimateDataInput, ClimateDataOutput } from "@/ai/flows/get-climate-data";

type ClimateResult = {
    success: true;
    data: ClimateDataOutput;
} | {
    success: false;
    error: string;
};

export async function fetchClimateDataForRegion(input: ClimateDataInput): Promise<ClimateResult> {
    try {
        const result = await getClimateData(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting climate data:", error);
        
        let errorMessage = "Failed to get climate data from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
