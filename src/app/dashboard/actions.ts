
'use server';

import { getBatchPredictions as getBatchPredictionsFlow } from "@/ai/flows/get-batch-predictions";
import type { BatchPredictionOutput, SinglePredictionResult } from "@/ai/flows/types";
import type { Region } from "@/lib/data";
import type { City } from "@/lib/geodata";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


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

        // Log successful predictions to history
        const { auth, firestore } = initializeFirebase();
        const currentUser = auth.currentUser;

        if (currentUser && result) {
            const historyCollection = collection(firestore, 'users', currentUser.uid, 'history');
            
            const logPromises = result.map((prediction, index) => {
                if (prediction.success) {
                    const region = regions[index];
                    return addDoc(historyCollection, {
                        type: 'PREDICTION',
                        regionName: region.name,
                        predictedDate: prediction.data.predictedNextBloomDate,
                        createdAt: serverTimestamp(),
                    });
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
