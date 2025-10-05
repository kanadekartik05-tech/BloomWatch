
'use client';

import React, { useState, useEffect, useTransition, useMemo, useCallback } from 'react';
import type { Region } from '@/lib/data';
import { getBatchPredictions } from '../actions';
import type { SinglePredictionResult } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Flower, CalendarDays, AlertTriangle, X, Sprout, PersonStanding, BarChart3, Wand2 } from 'lucide-react';
import { differenceInDays, format, isFuture, isPast } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { geodata, allCountries } from '@/lib/geodata';
import type { City } from '@/lib/geodata';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { PredictNextBloomDateOutput } from '@/ai/flows/types';
import { useUser } from '@/firebase';


type RegionPrediction = {
    region: City | Region;
    predictionResult: SinglePredictionResult;
};

const vegetationChartConfig: ChartConfig = {
    value: {
      label: 'Insolation',
      color: 'hsl(var(--primary))',
    },
};

export function DashboardView() {
    const { user } = useUser();
    const [isPending, startTransition] = useTransition();
    const [predictions, setPredictions] = useState<RegionPrediction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [displayRegions, setDisplayRegions] = useState<(City | Region)[]>([]);
    const [selectedCityValue, setSelectedCityValue] = useState<string>("");
    const [selectedRegionDetails, setSelectedRegionDetails] = useState<PredictNextBloomDateOutput | null>(null);


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
            const result = await getBatchPredictions(regionsToFetch, user?.uid);
            if (result.success) {
                const newPredictions = regionsToFetch.map((region, index) => ({
                    region,
                    predictionResult: result.predictions[index],
                }));
                
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
    }, [displayRegions, user]);

    useEffect(() => {
        fetchPredictions(displayRegions);
    }, [displayRegions, fetchPredictions]);

    const handleAddCity = (value: string) => {
        const selected = cityOptions.find(opt => opt.value === value);
        if (selected) {
            setDisplayRegions(prev => [...prev, selected.city]);
            setSelectedCityValue(""); 
        }
    }

    const handleRemoveRegion = (regionToRemove: City | Region) => {
        setDisplayRegions(prev => prev.filter(r => r.name !== regionToRemove.name || r.lat !== regionToRemove.lat));
        setPredictions(prev => prev.filter(p => p.region.name !== regionToRemove.name || p.region.lat !== regionToRemove.lat));
    }

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
                        value={selectedCityValue}
                        onChange={handleAddCity}
                        placeholder="Search and add a city..."
                        searchPlaceholder="Type to search for a city..."
                        emptyPlaceholder="No cities found, or city already on dashboard."
                    />
                </CardContent>
            </Card>

            {isPending && predictions.length === 0 && displayRegions.length > 0 && (
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

            <Dialog>
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

                        return (
                            <DialogTrigger asChild key={key}>
                                <Card className="flex flex-col justify-between hover:shadow-lg transition-shadow relative cursor-pointer" onClick={() => setSelectedRegionDetails(predictionResult.data)}>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10" onClick={(e) => { e.stopPropagation(); handleRemoveRegion(region); }}>
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
                                                    <Sprout className="h-5 w-5 text-primary" />
                                                    <span>Suitable Species</span>
                                                </div>
                                            </div>
                                             <p className="text-sm text-muted-foreground line-clamp-3">
                                                {predictionResult.data.potentialSpecies}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DialogTrigger>
                        )
                    })}
                    {isPending && <div className="flex items-center gap-2 text-muted-foreground"><Loader className="h-6 w-6 animate-spin" /><p>Fetching new prediction...</p></div>}
                </div>
                <DialogContent className="max-w-3xl">
                     {selectedRegionDetails && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-primary">
                                    Botanical Analysis
                                </DialogTitle>
                                <DialogDescription>{selectedRegionDetails.predictionJustification}</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><Flower className="text-accent"/>Ecological Significance</h3>
                                        <p className="text-muted-foreground text-sm">{selectedRegionDetails.ecologicalSignificance}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><Sprout className="text-accent"/>Potential Species</h3>
                                        <p className="text-muted-foreground text-sm">{selectedRegionDetails.potentialSpecies}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold flex items-center gap-2"><PersonStanding className="text-accent"/>Human Impact</h3>
                                        <p className="text-muted-foreground text-sm">{selectedRegionDetails.humanImpact}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="font-semibold flex items-center gap-2"><BarChart3 className="text-accent"/>Vegetation Trend</h3>
                                    <ChartContainer config={vegetationChartConfig} className="h-48 w-full">
                                        <BarChart data={selectedRegionDetails.ndviData} accessibilityLayer>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                                            <YAxis tickLine={false} axisLine={false} tickMargin={10} fontSize={12}/>
                                            <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent indicator="dot" />}
                                            />
                                            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        </>
                     )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
