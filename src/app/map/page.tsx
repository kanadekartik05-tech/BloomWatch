
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sidebar, SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Terminal } from 'lucide-react';
import MapView from './components/map-view';

export const metadata = {
  title: 'Interactive Map | BloomWatch',
  description: 'Explore global blooming events on an interactive map.',
};

export default function MapPage() {
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const nasaApiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

  if (!googleApiKey || !nasaApiKey || nasaApiKey === "YOUR_NASA_API_KEY_HERE") {
    return (
      <div className="container mx-auto py-10 text-center">
        <Alert variant="destructive" className="mx-auto max-w-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Configuration Error</AlertTitle>
          <AlertDescription>
            One or more API keys are not configured. Please set the <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> and <code>NEXT_PUBLIC_NASA_API_KEY</code> environment variables.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <SidebarProvider>
        <Sidebar side="right" collapsible="offcanvas">
            <MapView apiKey={googleApiKey} />
        </Sidebar>
        <SidebarInset>
            <div className="relative h-[calc(100vh-3.5rem)] w-full">
                 <MapView apiKey={googleApiKey} />
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
