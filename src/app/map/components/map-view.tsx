'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import type { Region } from '@/lib/data';
import { useState, useCallback } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Legend } from 'lucide-react';

type MapViewProps = {
  apiKey: string;
  regions: Region[];
};

const INITIAL_CAMERA = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
};

export default function MapView({ apiKey, regions }: MapViewProps) {
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState(INITIAL_CAMERA);

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
        {regions.map((region) => (
          <RegionMarker
            key={region.name}
            region={region}
            isSelected={selectedRegionName === region.name}
            onClick={handleMarkerClick}
          />
        ))}
      </Map>
      <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
        <MapSearch regions={regions} onSelect={handleRegionSelect} />
      </div>
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="w-48">
          <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2"><Legend size={16}/> Legend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFD700' }}></div>
              <span>Peak Bloom</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#228B22' }}></div>
              <span>Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#A0522D' }}></div>
              <span>Low Veg.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </APIProvider>
  );
}
