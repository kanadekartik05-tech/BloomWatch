
import { InsightsView } from './components/insights-view';
import { geodata, allCountries } from '@/lib/geodata';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const metadata = {
  title: 'Analysis | BloomWatch',
  description: 'Analyze NDVI trends and get AI-powered bloom predictions.',
};

export default function AnalysisPage() {
    const apiKey = process.env.NASA_API_KEY;

    if (!apiKey || apiKey === "YOUR_NASA_API_KEY_HERE") {
        return (
            <div className="container mx-auto py-10 text-center">
                <Alert variant="destructive" className="mx-auto max-w-lg">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>
                        NASA POWER API key is not configured. Please get a key from{' '}
                        <a href="https://power.larc.nasa.gov/login" target="_blank" rel="noopener noreferrer" className="underline">
                            NASA POWER
                        </a>{' '}
                        and set the <code>NASA_API_KEY</code> environment variable.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Data Analysis</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore historical vegetation trends and predict future blooming events for different regions around the world.
        </p>
      </div>
      <InsightsView geodata={geodata} allCountries={allCountries} />
    </div>
  );
}
