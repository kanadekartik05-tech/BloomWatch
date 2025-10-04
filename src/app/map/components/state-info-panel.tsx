
'use client';

import type { State, Country } from '@/lib/geodata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, CalendarDays, Thermometer, CloudRain } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type StateInfoPanelProps = {
  state: State | null;
  country: Country | null;
  onClose: () => void;
};

export function StateInfoPanel({ state, country, onClose }: StateInfoPanelProps) {
  if (!state) {
    return null;
  }

  return (
    <div className="absolute top-0 right-0 z-20 h-full w-full max-w-sm overflow-y-auto bg-background/95 p-4 shadow-lg backdrop-blur-sm transition-transform duration-300 ease-in-out">
        <Card className="flex h-full flex-col border-none bg-transparent shadow-none">
            <CardHeader>
                <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Countries
                </Button>
                </div>
                <CardTitle className="mt-4 text-2xl font-bold font-headline">
                {state.name}, {country?.name}
                </CardTitle>
                <CardDescription>
                High-level analysis for this region. More features coming soon!
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Historical Bloom Patterns
                    </h3>
                    <Alert>
                        <CalendarDays className="h-4 w-4"/>
                        <AlertTitle>Feature Coming Soon!</AlertTitle>
                        <AlertDescription>
                            Historical trend charts (last 3-5 years) from NASA's Landsat & MODIS archives will be displayed here. You will be able to visualize bloom shifts and identify anomalies over time.
                        </AlertDescription>
                    </Alert>
                </div>

                <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Thermometer className="h-5 w-5 text-destructive" />
                        <CloudRain className="h-5 w-5 text-blue-500" />
                        Environmental Trends
                    </h3>
                     <Alert>
                        <AlertTitle>Feature Coming Soon!</AlertTitle>
                        <AlertDescription>
                            This section will show charts correlating bloom patterns with environmental factors like temperature and precipitation, helping you understand the climatic drivers of phenology in this region.
                        </AlertDescription>
                    </Alert>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
