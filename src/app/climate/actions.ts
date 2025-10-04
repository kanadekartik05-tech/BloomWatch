
'use server';

import { getClimateData } from "@/ai/flows/get-climate-data";
import { getNdviData } from "@/ai/flows/get-ndvi-data";
import { summarizeChartData } from "@/ai/flows/summarize-chart-data";
import type { ClimateDataInput, ClimateDataOutput, ChartDataSummaryInput, ChartDataSummaryOutput } from "@/ai/flows/types";
import type { NdviDataOutput } from "@/ai/flows/get-ndvi-data";

type ClimateResult = {
    success: true;
    data: ClimateDataOutput;
} | {
    success: false;
    error: string;
};

type VegetationResult = {
    success: true;
    data: NdviDataOutput;
} | {
    success: false;
    error: string;
}

type SummaryResult = {
    success: true;
    data: ChartDataSummaryOutput;
} | {
    success: false;
    error: string;
}

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

export async function fetchVegetationDataForRegion(input: ClimateDataInput): Promise<VegetationResult> {
    try {
        const result = await getNdviData(input);
        if (result.length === 0) {
            return { success: false, error: "No vegetation data was found for the requested time period." };
        }
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting vegetation data:", error);
        
        let errorMessage = "Could not fetch vegetation data.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function getChartSummary(input: ChartDataSummaryInput): Promise<SummaryResult> {
    try {
        const result = await summarizeChartData(input);
        return { success: true, data: result };
    } catch(error) {
        console.error("Error getting chart summary:", error);
        let errorMessage = "Failed to generate summary from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}
