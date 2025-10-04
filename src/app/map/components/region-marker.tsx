
'use client';

import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { Loader, AlertTriangle, Flower } from 'lucide-react';
import type { PredictNextBloomDateOutput } from '@/ai/flows/predict-next-bloom-date';

type MarkerItem = {
    name: string;
    lat: number;
    lon: number;
    type: 'country' | 'state' | 'city';
}

type RegionMarkerProps = {
  item: MarkerItem;
  isSelected: boolean;
  onClick: () => void;
  onClose: () => void;
  isLoading: boolean;
  prediction: PredictNextBloomDateOutput | null;
  error: string | null;
};

const getMarkerColor = (type: MarkerItem['type']): string => {
  switch(type) {
    case 'country': return '#EF4444'; // Red
    case 'state': return '#F97316';   // Orange
    case 'city': return '#22C55E';    // Green
    default: return '#808080';
  }
};

const MarkerIcon = ({ color, type }: { color: string, type: MarkerItem['type'] }) => {
    const scale = type === 'country' ? 1.5 : type === 'state' ? 1.2 : 1.0;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={24 * scale} height={24*scale} viewBox="0 0 24 24" fill={color} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
    );
};

export function RegionMarker({ item, isSelected, onClick, onClose, isLoading, prediction, error }: RegionMarkerProps) {

  const markerColor = getMarkerColor(item.type);

  return (
    <>
      <AdvancedMarker
        position={{ lat: item.lat, lng: item.lon }}
        onClick={onClick}
        title={item.name}
      >
        <div className="transition-transform duration-200 ease-in-out hover:scale-125">
            <MarkerIcon color={markerColor} type={item.type} />
        </div>
      </AdvancedMarker>
      {isSelected && item.type === 'city' && (
        <InfoWindow
          position={{ lat: item.lat, lng: item.lon }}
          onCloseClick={onClose}
          minWidth={220}
        >
          <div className="p-1">
              <h3 className="mb-2 text-lg font-bold font-headline text-foreground">{item.name}</h3>
              
              {isLoading && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Analyzing bloom data...</span>
                  </div>
              )}

              {error && !isLoading && (
                  <div className="flex items-start space-x-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                  </div>
              )}

              {prediction && !isLoading && (
                  <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 font-semibold">
                          <Flower className="h-4 w-4 text-primary" />
                          Predicted Bloom: 
                          <span className="font-medium text-primary">
                            {new Date(prediction.predictedNextBloomDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                          </span>
                      </div>
                      <p className="text-muted-foreground text-xs italic">
                        {prediction.predictionJustification}
                      </p>
                  </div>
              )}
          </div>
        </InfoWindow>
      )}
    </>
  );
}
