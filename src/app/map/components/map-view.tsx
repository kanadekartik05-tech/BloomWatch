
'use client';

import { APIProvider, Map, MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { useState, useCallback, useMemo } from 'react';
import { RegionMarker } from './region-marker';
import { MapSearch } from './map-search';
import { geodata, allCountries as extraCountries } from '@/lib/geodata';
import type { Country, State, City } from '@/lib/geodata';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Globe, Satellite, Library, X, Info } from 'lucide-react';
import { ComparisonView } from './comparison-view';
import { StateInfoPanel } from './state-info-panel';
import { CityInfoPanel } from './city-info-panel';

type MapViewProps = {
  apiKey: string;
};

type ViewLevel = 'country' | 'state' | 'city';
type MapType = 'roadmap' | 'satellite';

const INITIAL_CAMERA = {
  center: { lat: 20, lng: 0 },
  zoom: 2,
};

const MAX_COMPARISON_ITEMS = 3;

export default function MapView({ apiKey }: MapViewProps) {
  const [cameraState, setCameraState] = useState(INITIAL_CAMERA);
  const [viewLevel, setViewLevel] = useState<ViewLevel>('country');
  const [mapType, setMapType] = useState<MapType>('roadmap');
  
  const allCountries = useMemo(() => {
    const mergedData = [...geodata];
    extraCountries.forEach(country => {
        const existingCountry = mergedData.find(c => c.name === country.name);
        if (!existingCountry) {
            mergedData.push(country);
        }
    });
    mergedData.sort((a, b) => a.name.localeCompare(b.name));
    return mergedData;
  }, []);

  // Data states
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Selection states
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Comparison states
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [comparisonList, setComparisonList] = useState<City[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const handleMapChange = (e: MapCameraChangedEvent) => {
    const { center, zoom } = e.detail;
    setCameraState({ center, zoom });
  };
  
  const resetSelection = (level: 'country' | 'state' | 'city') => {
    if (level === 'country') {
      setSelectedCountry(null);
      setSelectedState(null);
      setSelectedCity(null);
      setStates([]);
      setCities([]);
    }
    if (level === 'state') {
       setSelectedState(null);
       setSelectedCity(null);
       setCities([]);
    }
    if (level === 'city') {
       setSelectedCity(null);
    }
  }

  const handleSelectCountry = useCallback((country: Country) => {
    setError(null);
    setInfo(null);
    setSelectedCountry(country);
    
    if (country.states && country.states.length > 0) {
        setViewLevel('state');
        setCameraState({ center: { lat: country.lat, lng: country.lon }, zoom: 5 });
        resetSelection('state');
        setStates(country.states || []);
    } else {
        setInfo("Data for this country is not yet available. We are working on it!");
        setCameraState({ center: { lat: country.lat, lng: country.lon }, zoom: 5 });
        setViewLevel('country');
        setStates([]);
        setCities([]);
        setSelectedState(null);
        setSelectedCity(null);
    }
  }, []);

  const handleSelectState = useCallback((state: State) => {
    if (!selectedCountry) return;
    setInfo(null);
    setSelectedState(state);
    setViewLevel('city');
    setCameraState({ center: { lat: state.lat, lng: state.lon }, zoom: 8 });
    resetSelection('city');
    setCities(state.cities || []);
  }, [selectedCountry]);

  const handleToggleCompareItem = (city: City) => {
    setComparisonList(prevList => {
      const isAlreadyInList = prevList.some(item => item.name === city.name && item.lat === city.lat);
      if (isAlreadyInList) {
        return prevList.filter(item => item.name !== city.name || item.lat !== city.lat);
      }
      if (prevList.length < MAX_COMPARISON_ITEMS) {
        return [...prevList, city];
      }
      setError(`You can only compare up to ${MAX_COMPARISON_ITEMS} cities at a time.`);
      setTimeout(() => setError(null), 3000);
      return prevList;
    });
  }

  const handleSelectCity = useCallback((city: City) => {
    if (isCompareMode) {
      handleToggleCompareItem(city);
      return;
    }
    setSelectedCity(city);
    setCameraState({ center: { lat: city.lat, lng: city.lon }, zoom: 12 });
  }, [isCompareMode]);

  const handleBackToCountries = () => {
    setViewLevel('country');
    setCameraState(INITIAL_CAMERA);
    resetSelection('country');
    setInfo(null);
    setError(null);
  };

  const handleBackToStates = () => {
    if (!selectedCountry) return;
    setViewLevel('state');
    setCameraState({ center: { lat: selectedCountry.lat, lng: selectedCountry.lon }, zoom: 5 });
    resetSelection('city');
  };
  
  const markersToDisplay = useMemo(() => {
    if (viewLevel === 'city') return cities.map(c => ({...c, type: 'city'}));
    if (viewLevel === 'state') return states.map(s => ({...s, type: 'state'}));
    return allCountries.map(c => ({...c, type: 'country'}));
  }, [viewLevel, allCountries, states, cities]);

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    if (isCompareMode) {
      setComparisonList([]);
    }
  }

  const handleMarkerClick = (item: any) => {
     if (item.type === 'country') {
      handleSelectCountry(item);
    } else if (item.type === 'state') {
      handleSelectState(item);
    } else {
       handleSelectCity(item);
    }
  };
  
  const toggleMapType = () => {
    setMapType(current => current === 'roadmap' ? 'satellite' : 'roadmap');
  }

  const isCityInComparison = (city: City) => {
    return comparisonList.some(item => item.name === city.name && item.lat === city.lat);
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-10 w-full max-w-sm">
        <MapSearch
          viewLevel={viewLevel}
          countries={allCountries}
          states={states}
          cities={cities}
          loadingStates={false}
          loadingCities={false}
          selectedCountry={selectedCountry}
          selectedState={selectedState}
          onSelectCountry={handleSelectCountry}
          onSelectState={handleSelectState}
          onSelectCity={handleSelectCity}
          onBackToCountries={handleBackToCountries}
          onBackToStates={handleBackToStates}
        />
        {error && <Alert variant="destructive" className="mt-2"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {info && (
          <Alert className="mt-2">
            <Info className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>{info}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant={isCompareMode ? "default" : "outline"}
            size="icon"
            onClick={handleToggleCompareMode}
            title={isCompareMode ? 'Exit Compare Mode' : 'Enter Compare Mode'}
            className="bg-background/80 hover:bg-background"
          >
              <Library className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleMapType}
            title={mapType === 'roadmap' ? 'Switch to Satellite View' : 'Switch to Map View'}
            className="bg-background/80 hover:bg-background"
          >
              {mapType === 'roadmap' ? <Satellite className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
          </Button>
      </div>

       {selectedState && !selectedCity && (
         <StateInfoPanel 
            state={selectedState} 
            country={selectedCountry}
            onBackToCountries={handleBackToCountries}
            onClose={() => setSelectedState(null)} 
        />
       )}

       {selectedCity && !isCompareMode && (
          <CityInfoPanel
            city={selectedCity}
            state={selectedState}
            country={selectedCountry}
            onBackToStates={handleBackToStates}
            onClose={() => setSelectedCity(null)}
          />
       )}
      
      <APIProvider apiKey={apiKey}>
        <Map
            {...cameraState}
            onCameraChanged={handleMapChange}
            mapId="bloomwatch_map"
            mapTypeId={mapType}
            disableDefaultUI={true}
            gestureHandling={'greedy'}
            className="h-full w-full"
        >
            {markersToDisplay.map((item: any) => (
            <RegionMarker
                key={`${item.name}-${item.lat}-${item.lon}`}
                item={item}
                isSelected={selectedCity?.name === item.name && selectedCity?.lat === item.lat && !isCompareMode}
                isComparing={isCompareMode && item.type === 'city' && isCityInComparison(item)}
                isCompareModeActive={isCompareMode}
                onClick={() => handleMarkerClick(item)}
            />
            ))}
        </Map>
      </APIProvider>

      {isCompareMode && comparisonList.length > 0 && (
         <div className="absolute bottom-4 left-4 z-10">
            <Button onClick={() => setComparisonList([])} size="sm">
              <X className="mr-2 h-4 w-4" />
              Clear Comparison ({comparisonList.length})
            </Button>
         </div>
      )}

      {comparisonList.length > 1 && (
        <ComparisonView cities={comparisonList} />
      )}
    </>
  );
}
