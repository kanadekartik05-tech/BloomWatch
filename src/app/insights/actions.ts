
'use server';

import { summarizeChartData } from "@/ai/flows/summarize-chart-data";
import type { ChartDataSummaryInput, ChartDataSummaryOutput, ClimateDataInput } from "@/ai/flows/types";
import { getNdviData } from "@/ai/flows/get-ndvi-data";
import type { NdviDataOutput } from "@/ai/flows/get-ndvi-data";
import { initializeFirebaseAdmin } from '@/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';


type SummaryResult = {
    success: true;
    data: ChartDataSummaryOutput;
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

async function logHistoryEvent(userId: string, type: 'CLIMATE_SUMMARY', regionName: string, summary: string) {
    try {
        await initializeFirebaseAdmin();
        const firestore = getFirestore();
        const historyCollection = firestore.collection('users').doc(userId).collection('history');
        await historyCollection.add({
            type,
            regionName,
            summary,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("Failed to log history event:", error);
    }
}


export async function fetchNdviDataForRegion(input: ClimateDataInput): Promise<NdviResult> {
    try {
        const result = await getNdviData(input);
        if (result.length === 0) {
            return { success: false, error: "No vegetation data was found for the requested time period. The location may be over a large body of water or have other data availability issues." };
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


export async function getChartSummary(input: ChartDataSummaryInput, userId?: string): Promise<SummaryResult> {
    try {
        const result = await summarizeChartData(input);

        if (userId) {
            await logHistoryEvent(userId, 'CLIMATE_SUMMARY', input.locationName, result.summary);
        }
        
        return { success: true, data: result };

    } catch (error) {
        console.error("Error getting chart summary:", error);
        
        let errorMessage = "Failed to get summary from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
