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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, ComposedChart } from 'recharts';
import { fetchClimateDataForRegion } from '../actions';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ClimateDataOutput } from '@/ai/flows/types';

type ClimateViewProps = {
  regions: Region[];
};

const chartConfig: ChartConfig = {
  rainfall: {
    label: 'Rainfall (mm)',
    color: 'hsl(var(--chart-1))',
  },
  temperature: {
    label: 'Temp. (°C)',
    color: 'hsl(var(--chart-2))',
  },
};

export function ClimateView({ regions }: ClimateViewProps) {
  const [selectedRegionName, setSelectedRegionName] = useState(regions[0].name);
  const [climateData, setClimateData] = useState<ClimateDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedRegion = useMemo(
    () => regions.find((r) => r.name === selectedRegionName)!,
    [regions, selectedRegionName]
  );

  useEffect(() => {
    startTransition(async () => {
        setError(null);
        const result = await fetchClimateDataForRegion({
            lat: selectedRegion.lat,
            lon: selectedRegion.lon,
        });

        if (result.success) {
            setClimateData(result.data);
        } else {
            setError(result.error);
        }
    });
  }, [selectedRegion]);


  const handleRegionChange = (value: string) => {
    setSelectedRegionName(value);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Region Selection</CardTitle>
          <CardDescription>Choose a region to see its climate data.</CardDescription>
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
      
      <Card>
        <CardHeader>
          <CardTitle>Climate Data for {selectedRegion.name}</CardTitle>
          <CardDescription>Monthly average temperature and rainfall over the last year.</CardDescription>
        </CardHeader>
        <CardContent>
            {isPending && (
                <div className="flex h-72 w-full items-center justify-center text-muted-foreground">
                    <Loader className="mr-2 h-6 w-6 animate-spin" />
                    Fetching NASA climate data...
                </div>
            )}
            {error && !isPending && (
                <Alert variant="destructive">
                    <AlertTitle>Failed to Fetch Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {climateData && !isPending && !error && (
                <ChartContainer config={chartConfig} className="h-72 w-full">
                    <ComposedChart data={climateData} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-rainfall)" tickLine={false} axisLine={false} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}/>
                        <YAxis yAxisId="right" orientation="right" stroke="var(--color-temperature)" tickLine={false} axisLine={false} label={{ value: 'Temperature (°C)', angle: 90, position: 'insideRight' }}/>
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="rainfall" fill="var(--color-rainfall)" radius={4} yAxisId="left"/>
                        <Line type="monotone" dataKey="temperature" stroke="var(--color-temperature)" strokeWidth={2} yAxisId="right" />
                    </ComposedChart>
                </ChartContainer>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
