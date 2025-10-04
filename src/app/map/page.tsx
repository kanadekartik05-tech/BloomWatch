
import MapView from './components/map-view';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export const metadata = {
  title: 'Interactive Map | BloomWatch',
  description: 'Explore global blooming events on an interactive map.',
};

export default function MapPage() {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleApiKey) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Alert variant="destructive" className="mx-auto max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            Google Maps API key is not configured. Please set the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-3.5rem)] w-full">
      <MapView apiKey={googleApiKey} />
    </div>
  );
}
