
'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import type { Region } from '@/lib/data';
import { useState, useCallback, useEffect } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Loader } from 'lucide-react';
import { fetchNdviDataForRegion } from '@/app/insights/actions';
import type { NdviDataOutput } from '@/ai/flows/get-ndvi-data';

type MapViewProps = {
  apiKey: string;
  regions: Region[];
};

type DynamicRegionData = Region & {
    vegetationData?: NdviDataOutput;
    error?: string;
};

const INITIAL_CAMERA = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
};

export default function MapView({ apiKey, regions }: MapViewProps) {
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState(INITIAL_CAMERA);
  const [dynamicRegions, setDynamicRegions] = useState<DynamicRegionData[]>(regions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllRegionData() {
      setIsLoading(true);
      const promises = regions.map(async (region) => {
        const result = await fetchNdviDataForRegion({ lat: region.lat, lon: region.lon });
        if (result.success) {
          return { ...region, vegetationData: result.data };
        } else {
          return { ...region, error: result.error };
        }
      });
      const results = await Promise.all(promises);
      setDynamicRegions(results);
      setIsLoading(false);
    }
    fetchAllRegionData();
  }, [regions]);


  const handleMarkerClick = useCallback((regionName: string) => {
    setSelectedRegionName(prev => (prev === regionName ? null : regionName));
  }, []);

  const handleMapChange = (e: MapCameraChangedEvent) => {
    const { center, zoom } = e.detail;
    setCameraState({ center, zoom });
  };
  
  const handleRegionSelect = (region: Region) => {
    setCameraState({ center: { lat: region.lat, lng: region.lon }, zoom: 8 });
    setSelectedRegionName(region.name);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        {...cameraState}
        onCameraChanged={handleMapChange}
        mapId="bloomwatch_map"
        disableDefaultUI={true}
        gestureHandling={'greedy'}
        className="h-full w-full"
      >
        {dynamicRegions.map((region) => (
          <RegionMarker
            key={region.name}
            region={region}
            isSelected={selectedRegionName === region.name}
            onClick={handleMarkerClick}
          />
        ))}
      </Map>

      {isLoading && (
        <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-md bg-background/80 p-2 shadow-md">
            <div className="flex items-center text-muted-foreground">
                <Loader className="mr-2 h-5 w-5 animate-spin" />
                <span>Fetching live vegetation data...</span>
            </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
        <MapSearch regions={regions} onSelect={handleRegionSelect} />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="w-48">
          <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2"><List size={16}/> Legend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm space-y-2">
             <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F97316' }}></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#A16207' }}></div>
              <span>Low Veg.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </APIProvider>
  );
}
