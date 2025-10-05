
'use server';

import { getBatchPredictions as getBatchPredictionsFlow } from "@/ai/flows/get-batch-predictions";
import type { BatchPredictionOutput, SinglePredictionResult } from "@/ai/flows/types";
import type { Region } from "@/lib/data";
import type { City } from "@/lib/geodata";
import { initializeFirebaseAdmin } from '@/firebase/server-init';
import { getFirestore } from 'firebase-admin/firestore';


export type { SinglePredictionResult } from '@/ai/flows/types';

type BatchPredictionResult = {
    success: true;
    predictions: BatchPredictionOutput;
} | {
    success: false;
    error: string;
};

async function logHistoryEvent(
    userId: string,
    type: 'PREDICTION',
    regionName: string,
    predictedDate?: string
) {
    try {
        await initializeFirebaseAdmin();
        const firestore = getFirestore();
        const historyCollection = firestore.collection('users').doc(userId).collection('history');
        const eventData: any = {
            type,
            regionName,
            createdAt: new Date(),
        };
        if (predictedDate) {
            eventData.predictedDate = predictedDate;
        }
        await historyCollection.add(eventData);
    } catch (error) {
        console.error("Failed to log history event:", error);
    }
}


export async function getBatchPredictions(regions: (Region | City)[], userId?: string): Promise<BatchPredictionResult> {
    try {
        const mappedRegions = regions.map(r => ({
            name: r.name,
            lat: r.lat,
            lon: r.lon,
            // Provide a default latest_bloom if it doesn't exist (for City types)
            latest_bloom: 'latest_bloom' in r ? r.latest_bloom : `${new Date().getFullYear()}-01-01`
        }));

        const result = await getBatchPredictionsFlow({ regions: mappedRegions });

        if (result && userId) {
             const logPromises = result.map((prediction, index) => {
                if (prediction.success) {
                    const region = regions[index];
                    return logHistoryEvent(userId, 'PREDICTION', region.name, prediction.data.predictedNextBloomDate);
                }
                return null;
            }).filter(p => p !== null);
            
            await Promise.all(logPromises);
        }

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
