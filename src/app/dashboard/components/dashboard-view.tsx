'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Region } from '@/lib/data';
import { getBatchPredictions } from '../actions';
import type { SinglePredictionResult } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Flower, CalendarDays, AlertTriangle } from 'lucide-react';
import { differenceInDays, format, isFuture, isPast } from 'date-fns';
import { Progress } from '@/components/ui/progress';

type RegionPrediction = {
    region: Region;
    predictionResult: SinglePredictionResult;
};

export function DashboardView({ regions }: { regions: Region[] }) {
    const [isPending, startTransition] = useTransition();
    const [predictions, setPredictions] = useState<RegionPrediction[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startTransition(async () => {
            const result = await getBatchPredictions(regions);
            if (result.success) {
                const combined = regions.map((region, index) => ({
                    region,
                    predictionResult: result.predictions[index],
                }));
                setPredictions(combined);
            } else {
                setError(result.error);
            }
        });
    }, [regions]);

    const getStatus = (predictedDate: Date) => {
        const today = new Date();
        const daysUntilBloom = differenceInDays(predictedDate, today);

        if (isPast(predictedDate) && differenceInDays(today, predictedDate) <= 7) {
            return { text: "Peak Bloom", color: "text-green-500", days: 0 };
        }
        if (isPast(predictedDate)) {
            return { text: "Finished", color: "text-muted-foreground", days: daysUntilBloom };
        }
        if (isFuture(predictedDate)) {
            return { text: `Blooming in ${daysUntilBloom} days`, color: "text-yellow-500", days: daysUntilBloom };
        }
        return { text: "Today", color: "text-primary", days: 0 };
    };

    const calculateProgress = (predictedDate: Date) => {
        const bloomSeasonLength = 30; // Assume a 30-day "observation window" around the bloom
        const today = new Date();
        const daysUntilBloom = differenceInDays(predictedDate, today);

        // If bloom is more than 30 days away, progress is 0
        if (daysUntilBloom > bloomSeasonLength) return 0;
        // If bloom has passed more than a few days ago, progress is 100 (finished)
        if (daysUntilBloom < -7) return 100;

        // Calculate progress within the 30-day window before the bloom
        const progress = 100 - (daysUntilBloom / bloomSeasonLength) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    if (isPending) {
        return (
            <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader className="h-6 w-6 animate-spin" />
                    <p>Loading global predictions...</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
            <div className="flex justify-center">
                 <Card className="max-w-xl bg-destructive/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle /> Prediction Engine Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-destructive/80">
                            There was an error fetching the batch predictions from the AI model. This can sometimes happen due to high traffic or API availability. Please try refreshing the page in a moment.
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">Error: {error}</p>
                    </CardContent>
                </Card>
            </div>
         )
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {predictions.map(({ region, predictionResult }) => {
                if (!predictionResult.success) {
                    return (
                        <Card key={region.name} className="flex flex-col justify-between bg-secondary/50">
                             <CardHeader>
                                <CardTitle>{region.name}</CardTitle>
                                <CardDescription>Prediction unavailable</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <div className="flex h-full items-center justify-center text-xs text-destructive">
                                   {predictionResult.error}
                               </div>
                            </CardContent>
                        </Card>
                    );
                }

                const predictedDate = new Date(predictionResult.data.predictedNextBloomDate);
                const status = getStatus(predictedDate);
                const progress = calculateProgress(predictedDate);

                return (
                    <Card key={region.name} className="flex flex-col justify-between hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle>{region.name}</CardTitle>
                            <CardDescription>
                                Latest bloom: {format(new Date(region.latest_bloom), "PPP")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-end space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-baseline justify-between">
                                    <div className="flex items-center gap-2 font-semibold">
                                        <Flower className="h-5 w-5 text-primary" />
                                        <span>Predicted Bloom</span>
                                    </div>
                                    <span className="text-lg font-bold text-primary">
                                        {format(predictedDate, "MMMM do")}
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between text-sm">
                                     <div className="flex items-center gap-2 font-semibold">
                                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                                        <span>Status</span>
                                    </div>
                                    <span className={`font-bold ${status.color}`}>
                                        {status.text}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <Progress value={progress} className="h-2" />
                                <p className="mt-1 text-right text-xs text-muted-foreground">
                                    Bloom Timeline
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
