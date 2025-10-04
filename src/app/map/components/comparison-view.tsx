
'use client';
import { useState, useEffect, useTransition } from 'react';
import type { City } from '@/lib/geodata';
import { getBloomPredictionForCity } from '../actions';
import type { PredictNextBloomDateOutput } from '@/ai/flows/predict-next-bloom-date';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, Flower, BarChart2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

type ComparisonViewProps = {
  cities: City[];
};

type ComparisonData = {
  city: City;
  prediction: PredictNextBloomDateOutput | null;
  vegetationData: { month: string; value: number }[] | null;
  isLoading: boolean;
  error: string | null;
};

const chartConfig: ChartConfig = {
  value: {
    label: 'Insolation',
    color: 'hsl(var(--chart-1))',
  },
};

export function ComparisonView({ cities }: ComparisonViewProps) {
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = () => {
      startTransition(async () => {
        const results = await Promise.all(
          cities.map(async (city) => {
            const initialData: ComparisonData = {
              city,
              prediction: null,
              vegetationData: null,
              isLoading: true,
              error: null,
            };

            try {
              const result = await getBloomPredictionForCity(city);
              if (result.success) {
                return {
                  ...initialData,
                  prediction: result.data,
                  vegetationData: result.data.ndviData || [],
                  isLoading: false,
                };
              } else {
                return { ...initialData, error: result.error, isLoading: false };
              }
            } catch (e: any) {
              return { ...initialData, error: e.message || 'Failed to fetch data', isLoading: false };
            }
          })
        );
        setComparisonData(results);
      });
    };

    if (cities.length > 0) {
      fetchData();
    } else {
      setComparisonData([]);
    }
  }, [cities]);

  if (cities.length < 2) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 w-full bg-background/90 p-4 shadow-2xl backdrop-blur-sm">
      <h2 className="mb-4 text-center text-xl font-bold font-headline">Region Comparison</h2>
      <div className={`grid grid-cols-1 md:grid-cols-${cities.length} gap-4`}>
        {comparisonData.map(({ city, prediction, vegetationData, isLoading, error }) => (
          <Card key={`${city.name}-${city.lat}`} className="flex flex-col">
            <CardHeader>
              <CardTitle>{city.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between space-y-4">
              {isLoading && (
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                  <Loader className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </div>
              )}
              {error && !isLoading && (
                <div className="flex flex-1 items-center justify-center text-center text-sm text-destructive">{error}</div>
              )}
              {prediction && vegetationData && !isLoading && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-semibold">
                      <Flower className="h-4 w-4 text-primary" />
                      <span>
                        {new Date(prediction.predictedNextBloomDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground italic">{prediction.predictionJustification}</p>
                  </div>
                  <div className="flex-1">
                    <ChartContainer config={chartConfig} className="h-32 w-full">
                      <BarChart data={vegetationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} accessibilityLayer>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" labelClassName="text-sm" className="text-xs" />}
                        />
                        <Bar dataKey="value" fill="var(--color-value)" radius={2} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
