
'use server';

import { predictNextBloomDate } from "@/ai/flows/predict-next-bloom-date";
import type { PredictNextBloomDateInput, PredictNextBloomDateOutput } from "@/ai/flows/types";
import { getClimateData } from "@/ai/flows/get-climate-data";
import { getNdviData } from "@/ai/flows/get-ndvi-data";
import type { ClimateDataInput } from "@/ai/flows/types";
import type { NdviDataOutput } from "@/ai/flows/get-ndvi-data";
import { initializeFirebaseAdmin } from '@/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';


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

async function logHistoryEvent(userId: string, type: 'PREDICTION', regionName: string, prediction: PredictNextBloomDateOutput) {
    try {
        await initializeFirebaseAdmin();
        const firestore = getFirestore();
        const historyCollection = firestore.collection('users').doc(userId).collection('history');
        await historyCollection.add({
            type,
            regionName,
            prediction,
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


export async function getEnhancedBloomPrediction(input: { cityName: string, lat: number, lon: number, ndviData: NdviDataOutput, userId?: string }): Promise<PredictionResult> {
    try {
        // 1. Fetch climate data first
        const climateInput: ClimateDataInput = { lat: input.lat, lon: input.lon };
        const climateResult = await getClimateData(climateInput);
        
        // Use a dummy bloom date for now. In a real app this might come from a DB.
        const dummyLatestBloom = `${new Date().getFullYear()}-04-01`;

        // 2. Combine with other input and get prediction
        const predictionInput: PredictNextBloomDateInput = {
            regionName: input.cityName,
            lat: input.lat,
            lon: input.lon,
            climateData: climateResult,
            ndviData: input.ndviData, // Pass the full ndviData object which includes the date
            latestBloomDate: dummyLatestBloom,
        };
        
        const result = await predictNextBloomDate(predictionInput);

        if (input.userId) {
            await logHistoryEvent(input.userId, 'PREDICTION', input.cityName, result);
        }
        
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
