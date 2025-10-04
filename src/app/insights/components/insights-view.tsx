'use client';

import { useState, useMemo, useTransition, useEffect } from 'react';
import type { Region } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { getEnhancedBloomPrediction, fetchNdviDataForRegion } from '../actions';
import { Loader, Wand2, PersonStanding, Sprout, Flower } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PredictNextBloomDateOutput } from '@/ai/flows/predict-next-bloom-date';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';

type InsightsViewProps = {
  regions: Region[];
};

type PredictionState = PredictNextBloomDateOutput | null;

const chartConfig: ChartConfig = {
  value: {
    label: 'Insolation', // Updated Label
    color: 'hsl(var(--primary))',
  },
};

export function InsightsView({ regions }: InsightsViewProps) {
  const [selectedRegionName, setSelectedRegionName] = useState(regions[0].name);
  
  const [prediction, setPrediction] = useState<PredictionState>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [isAIPending, startAITransition] = useTransition();

  const [vegetationData, setVegetationData] = useState<NdviDataOutput | null>(null);
  const [vegetationError, setVegetationError] = useState<string | null>(null);
  const [isVegetationPending, startVegetationTransition] = useTransition();

  const selectedRegion = useMemo(
    () => regions.find((r) => r.name === selectedRegionName)!,
    [regions, selectedRegionName]
  );
  
  useEffect(() => {
    // Reset states when region changes
    setPrediction(null);
    setPredictionError(null);
    setVegetationData(null);
    setVegetationError(null);

    if (!selectedRegion) return;

    startVegetationTransition(async () => {
        const result = await fetchNdviDataForRegion({
            lat: selectedRegion.lat,
            lon: selectedRegion.lon,
        });

        if (result.success) {
            setVegetationData(result.data);
        } else {
            setVegetationError(result.error);
        }
    });

  }, [selectedRegionName, selectedRegion]);

  const peakInsolation = useMemo(() => {
    if (!vegetationData) return 0;
    return Math.max(...vegetationData.map(d => d.value))
  }, [vegetationData]);

  const handleRegionChange = (value: string) => {
    setSelectedRegionName(value);
  };

  const handlePredict = () => {
    if (!vegetationData) return;
    startAITransition(async () => {
      setPrediction(null);
      setPredictionError(null);
      
      const result = await getEnhancedBloomPrediction({
        regionName: selectedRegion.name,
        lat: selectedRegion.lat,
        lon: selectedRegion.lon,
        ndviData: vegetationData,
        latestBloomDate: selectedRegion.latest_bloom,
      });

      if (result.success && result.data) {
        setPrediction(result.data);
      } else {
        setPredictionError(result.error || 'An unknown error occurred.');
      }
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Region Selection</CardTitle>
          <CardDescription>Choose a region to analyze its vegetation data and generate AI-powered insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedRegionName} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-full md:w-72">
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.name} value={region.name}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Insolation Trend for {selectedRegion.name}</CardTitle>
            <CardDescription>All sky insolation from NASA POWER API, a proxy for vegetation health.</CardDescription>
          </CardHeader>
          <CardContent>
            {isVegetationPending && (
                <div className="flex h-72 w-full items-center justify-center text-muted-foreground">
                    <Loader className="mr-2 h-6 w-6 animate-spin" />
                    Fetching real-time vegetation proxy data from NASA...
                </div>
            )}
            {vegetationError && !isVegetationPending && (
                <Alert variant="destructive">
                    <AlertTitle>Failed to Fetch Vegetation Data</AlertTitle>
                    <AlertDescription>{vegetationError}</AlertDescription>
                </Alert>
            )}
            {vegetationData && !isVegetationPending && (
              <ChartContainer config={chartConfig} className="h-72 w-full">
                <BarChart data={vegetationData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  {peakInsolation > 0 && <ReferenceLine y={peakInsolation} label={{ value: 'Peak Proxy', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', dy: -10, dx: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />}
                  <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>Predict the next bloom event and understand its context.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button onClick={handlePredict} disabled={isAIPending || isVegetationPending || !vegetationData}>
              {isAIPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Insights
            </Button>
            
            {isAIPending && (
                <div className="flex items-center text-sm text-muted-foreground p-4 border rounded-lg">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing climate and vegetation data to generate prediction...
                </div>
            )}
            
            {predictionError && !isAIPending &&(
                <Alert variant="destructive">
                    <AlertTitle>Prediction Failed</AlertTitle>
                    <AlertDescription>{predictionError}</AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {prediction && !isAIPending && (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                    Predicted Bloom Date for {selectedRegion.name}: {new Date(prediction.predictedNextBloomDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </CardTitle>
                <CardDescription>{prediction.predictionJustification}</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Flower className="text-accent"/>Ecological Significance</h3>
                    <p className="text-muted-foreground text-sm">{prediction.ecologicalSignificance}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><Sprout className="text-accent"/>Potential Species</h3>
                    <p className="text-muted-foreground text-sm">{prediction.potentialSpecies}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><PersonStanding className="text-accent"/>Human Impact</h3>
                    <p className="text-muted-foreground text-sm">{prediction.humanImpact}</p>

                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
