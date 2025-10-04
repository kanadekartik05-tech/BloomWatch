import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ClimateView } from './components/climate-view';
import { regions } from '@/lib/data';

export const metadata = {
    title: 'Climate Data | BloomWatch',
    description: 'Explore climate data from NASA POWER API.',
};

export default function ClimatePage() {
    const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY;

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
                        and set the <code>NEXT_PUBLIC_NASA_API_KEY</code> environment variable.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold font-headline">Climate Data</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Explore historical climate data for different regions.
                </p>
            </div>
            <ClimateView regions={regions} />
        </div>
    );
}
