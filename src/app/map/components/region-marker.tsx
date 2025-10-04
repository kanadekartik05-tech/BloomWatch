'use client';

import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useMemo } from 'react';
import type { Region } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartConfig } from '@/components/ui/chart';

type RegionMarkerProps = {
  region: Region;
  isSelected: boolean;
  onClick: (regionName: string) => void;
};

const getMarkerColor = (ndviValue: number): string => {
  if (ndviValue > 0.7) return '#FFD700'; // Peak Bloom (Gold)
  if (ndviValue > 0.3) return '#228B22'; // Healthy (ForestGreen)
  return '#A0522D'; // Low Vegetation (Sienna)
};

const MarkerIcon = ({ color }: { color: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill={color} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);


export function RegionMarker({ region, isSelected, onClick }: RegionMarkerProps) {
  const latestNdvi = region.ndvi[region.ndvi.length - 1];
  const markerColor = useMemo(() => getMarkerColor(latestNdvi.value), [latestNdvi.value]);

  const chartConfig: ChartConfig = {
    value: { label: "NDVI", color: 'hsl(var(--primary))' },
  };

  return (
    <>
      <AdvancedMarker
        position={{ lat: region.lat, lng: region.lon }}
        onClick={() => onClick(region.name)}
        title={region.name}
      >
        <div className="transition-transform duration-200 ease-in-out hover:scale-125">
            <MarkerIcon color={markerColor} />
        </div>
      </AdvancedMarker>
      {isSelected && (
        <InfoWindow
          position={{ lat: region.lat, lng: region.lon }}
          onCloseClick={() => onClick(region.name)}
          minWidth={300}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="p-2">
              <CardTitle className="text-lg">{region.name}</CardTitle>
              <CardDescription>Latest Bloom: {new Date(region.latest_bloom).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <p className="text-sm font-medium">
                Current NDVI: <span style={{ color: markerColor }}>{latestNdvi.value.toFixed(2)}</span>
              </p>
              <div className="h-32 w-full mt-2">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={region.ndvi} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                          cursor={{fill: 'hsl(var(--muted))'}}
                          content={<ChartTooltipContent indicator="dot" />}
                       />
                      <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </InfoWindow>
      )}
    </>
  );
}
