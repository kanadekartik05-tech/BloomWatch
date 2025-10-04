'use client';

import { useState, useMemo, useTransition } from 'react';
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
import { getEnhancedBloomPrediction } from '../actions';
import { Loader, Wand2, PersonStanding, Sprout, Flower } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { PredictNextBloomDateOutput } from '@/ai/flows/predict-next-bloom-date';

type InsightsViewProps = {
  regions: Region[];
};

type PredictionState = PredictNextBloomDateOutput | null;

const chartConfig: ChartConfig = {
  value: {
    label: 'NDVI',
    color: 'hsl(var(--primary))',
  },
};

export function InsightsView({ regions }: InsightsViewProps) {
  const [selectedRegionName, setSelectedRegionName] = useState(regions[0].name);
  const [prediction, setPrediction] = useState<PredictionState>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedRegion = useMemo(
    () => regions.find((r) => r.name === selectedRegionName)!,
    [regions, selectedRegionName]
  );
  
  const peakNdvi = useMemo(() => Math.max(...selectedRegion.ndvi.map(d => d.value)), [selectedRegion]);

  const handleRegionChange = (value: string) => {
    setSelectedRegionName(value);
    setPrediction(null);
    setError(null);
  };

  const handlePredict = () => {
    startTransition(async () => {
      setPrediction(null);
      setError(null);
      
      const result = await getEnhancedBloomPrediction({
        regionName: selectedRegion.name,
        lat: selectedRegion.lat,
        lon: selectedRegion.lon,
        ndviData: selectedRegion.ndvi,
        latestBloomDate: selectedRegion.latest_bloom,
      });

      if (result.success && result.data) {
        setPrediction(result.data);
      } else {
        setError(result.error || 'An unknown error occurred.');
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
            <CardTitle>NDVI Trend for {selectedRegion.name}</CardTitle>
            <CardDescription>Monthly average NDVI values over the last year. High values often correlate with peak bloom.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-72 w-full">
              <BarChart data={selectedRegion.ndvi} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <ReferenceLine y={peakNdvi} label={{ value: 'Peak Bloom Proxy', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', dy: -10, dx: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Insights</CardTitle>
            <CardDescription>Predict the next bloom event and understand its context.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button onClick={handlePredict} disabled={isPending}>
              {isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Insights
            </Button>
            
            {isPending && (
                <div className="flex items-center text-sm text-muted-foreground p-4 border rounded-lg">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing climate and vegetation data to generate prediction...
                </div>
            )}
            
            {error && !isPending && (
                <Alert variant="destructive">
                    <AlertTitle>Prediction Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {prediction && !isPending && (
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
