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
import { getBloomPrediction } from '../actions';
import { Loader, Wand2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type InsightsViewProps = {
  regions: Region[];
};

type PredictionState = {
  date: string;
  explanation: string;
} | null;

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
      const result = await getBloomPrediction({
        regionName: selectedRegion.name,
        lat: selectedRegion.lat,
        lon: selectedRegion.lon,
        ndviData: selectedRegion.ndvi,
        latestBloomDate: selectedRegion.latest_bloom,
      });

      if (result.success && result.data) {
        setPrediction({
            date: result.data.predictedNextBloomDate,
            explanation: result.data.explanation,
        });
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
          <CardDescription>Choose a region to analyze its vegetation data.</CardDescription>
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
            <CardDescription>Monthly average NDVI values over the last year.</CardDescription>
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
                <ReferenceLine y={peakNdvi} label={{ value: 'Peak Bloom', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', dy: -10, dx: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bloom Prediction</CardTitle>
            <CardDescription>Predict the next bloom event using AI.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button onClick={handlePredict} disabled={isPending}>
              {isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Predict Next Bloom
            </Button>
            {isPending && (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing historical data...
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Prediction Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {prediction && (
                <Alert className="bg-primary/10">
                    <Wand2 className="h-4 w-4" />
                    <AlertTitle className="text-primary font-bold">
                      Predicted Bloom Date: {new Date(prediction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </AlertTitle>
                    <AlertDescription>{prediction.explanation}</AlertDescription>
                </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
