'use client';

import { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import type { Region } from '@/lib/data';
import { getBatchPredictions } from '../actions';
import type { SinglePredictionResult } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Flower, CalendarDays, AlertTriangle, X } from 'lucide-react';
import { differenceInDays, format, isFuture, isPast } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { geodata, allCountries } from '@/lib/geodata';
import type { City } from '@/lib/geodata';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';

type RegionPrediction = {
    region: City | Region;
    predictionResult: SinglePredictionResult;
};

export function DashboardView({ initialRegions }: { initialRegions: Region[] }) {
    const [isPending, startTransition] = useTransition();
    const [predictions, setPredictions] = useState<RegionPrediction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [displayRegions, setDisplayRegions] = useState<(City | Region)[]>(initialRegions);

    const cityOptions = useMemo(() => {
        const allCities: { label: string, value: string, city: City }[] = [];
        const addedCities = new Set(displayRegions.map(r => `${r.name}-${r.lat}`));

        [...geodata, ...allCountries].forEach(country => {
            country.states?.forEach(state => {
                state.cities?.forEach(city => {
                    if (!addedCities.has(`${city.name}-${city.lat}`)) {
                        allCities.push({
                            label: `${city.name}, ${state.name}, ${country.name}`,
                            value: `${city.name}-${city.lat}`,
                            city
                        });
                    }
                });
            });
        });
        return allCities.sort((a,b) => a.label.localeCompare(b.label));
    }, [displayRegions]);

    const fetchPredictions = useCallback((regionsToFetch: (City|Region)[]) => {
        startTransition(async () => {
            if (regionsToFetch.length === 0) {
                setPredictions([]);
                return;
            }
            const result = await getBatchPredictions(regionsToFetch);
            if (result.success) {
                const newPredictions = regionsToFetch.map((region, index) => ({
                    region,
                    predictionResult: result.predictions[index],
                }));
                
                // This merging logic ensures we don't duplicate and we keep existing ones
                setPredictions(prev => {
                    const existingMap = new Map(prev.map(p => [`${p.region.name}-${p.region.lat}`, p]));
                    newPredictions.forEach(p => existingMap.set(`${p.region.name}-${p.region.lat}`, p));
                    
                    const finalPredictions = Array.from(existingMap.values());
                    const displayRegionNames = new Set(displayRegions.map(r => `${r.name}-${r.lat}`));

                    return finalPredictions.filter(p => displayRegionNames.has(`${p.region.name}-${p.region.lat}`));
                });

            } else {
                setError(result.error);
            }
        });
    }, [displayRegions]);

    useEffect(() => {
        fetchPredictions(displayRegions);
    }, [displayRegions, fetchPredictions]);

    const handleAddCity = (value: string) => {
        const selected = cityOptions.find(opt => opt.value === value);
        if (selected) {
            setDisplayRegions(prev => [...prev, selected.city]);
        }
    }

    const handleRemoveRegion = (regionToRemove: City | Region) => {
        setDisplayRegions(prev => prev.filter(r => r.name !== regionToRemove.name || r.lat !== regionToRemove.lat));
        setPredictions(prev => prev.filter(p => p.region.name !== regionToRemove.name || p.region.lat !== regionToRemove.lat));
    }


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

        if (daysUntilBloom > bloomSeasonLength) return 0;
        if (daysUntilBloom < -7) return 100;

        const progress = 100 - (daysUntilBloom / bloomSeasonLength) * 100;
        return Math.max(0, Math.min(100, progress));
    };

    return (
        <div>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Customize Dashboard</CardTitle>
                    <CardDescription>Add or remove cities to create your personalized bloom dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Combobox
                        options={cityOptions}
                        onChange={handleAddCity}
                        placeholder="Search and add a city..."
                        searchPlaceholder="Type to search for a city..."
                        emptyPlaceholder="No cities found, or city already on dashboard."
                    />
                </CardContent>
            </Card>

            {isPending && predictions.length === 0 && (
                <div className="flex h-64 w-full items-center justify-center rounded-lg border border-dashed">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader className="h-6 w-6 animate-spin" />
                        <p>Loading global predictions...</p>
                    </div>
                </div>
            )}

            {error && (
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
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {predictions.map(({ region, predictionResult }) => {
                    const key = `${region.name}-${region.lat}`;
                    if (!predictionResult.success) {
                        return (
                            <Card key={key} className="flex flex-col justify-between bg-secondary/50 relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleRemoveRegion(region)}>
                                    <X className="h-4 w-4" />
                                </Button>
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
                        <Card key={key} className="flex flex-col justify-between hover:shadow-lg transition-shadow relative">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleRemoveRegion(region)}>
                                <X className="h-4 w-4" />
                            </Button>
                            <CardHeader>
                                <CardTitle>{region.name}</CardTitle>
                                <CardDescription>
                                    {'latest_bloom' in region ? `Latest bloom: ${format(new Date(region.latest_bloom), "PPP")}` : `Lat: ${region.lat.toFixed(2)}, Lon: ${region.lon.toFixed(2)}`}
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
                 {isPending && <div className="flex items-center gap-2 text-muted-foreground"><Loader className="h-6 w-6 animate-spin" /><p>Fetching new prediction...</p></div>}
            </div>
        </div>
    );
}
