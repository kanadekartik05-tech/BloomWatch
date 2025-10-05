
'use server';

import type { PredictNextBloomDateOutput, ClimateDataInput } from "@/ai/flows/types";
import { getNdviData } from "@/ai/flows/get-ndvi-data";
import { getBloomAnalysis as getBloomAnalysisFlow } from "@/ai/flows/get-bloom-analysis";
import type { NdviDataOutput } from "@/ai/flows/get-ndvi-data";
import { initializeFirebaseAdmin } from '@/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';
import type { City, State, Country } from "@/lib/geodata";


type AnalysisResult = {
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

async function logHistoryEvent(
    userId: string,
    city: City,
    state: State | null,
    country: Country | null,
    prediction: PredictNextBloomDateOutput
) {
    try {
        await initializeFirebaseAdmin();
        const firestore = getFirestore();
        const historyCollection = firestore.collection('users').doc(userId).collection('history');
        await historyCollection.add({
            type: 'PREDICTION',
            regionName: city.name,
            city: city.name,
            state: state?.name || null,
            country: country?.name || null,
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


export async function getBloomAnalysis(
    city: City,
    state: State | null,
    country: Country | null,
    vegetationData: NdviDataOutput,
    userId?: string
): Promise<AnalysisResult> {
    try {
        const result = await getBloomAnalysisFlow({
            locationName: city.name,
            vegetationData: vegetationData,
        });

        if (userId) {
            await logHistoryEvent(userId, city, state, country, result);
        }
        
        return { success: true, data: result };

    } catch (error) {
        console.error("Error getting bloom analysis:", error);
        
        let errorMessage = "Failed to get analysis from AI.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
    }
}
