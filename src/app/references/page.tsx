import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Satellite, BrainCircuit, Map as MapIcon, Image as ImageIcon, Type } from 'lucide-react';
import Link from 'next/link';

const references = [
    {
        icon: <Satellite className="h-8 w-8 text-primary" />,
        title: "NASA POWER API",
        description: "The Prediction of Worldwide Energy Resources (POWER) project provides real-time solar and meteorological datasets. We use this API to fetch climate variables (temperature, precipitation) and all-sky insolation, which serves as a proxy for vegetation health.",
        href: "https://power.larc.nasa.gov/"
    },
    {
        icon: <BrainCircuit className="h-8 w-8 text-primary" />,
        title: "Google AI & Gemini Models",
        description: "The bloom prediction engine is powered by Google's Gemini models. We use Genkit, an open-source AI framework, to process the NASA data and generate predictive insights about bloom timing, ecological impact, and potential species.",
        href: "https://ai.google/"
    },
    {
        icon: <MapIcon className="h-8 w-8 text-primary" />,
        title: "Google Maps Platform",
        description: "The interactive map interface, including the map tiles, markers, and search functionality, is built using the Google Maps Platform. This provides the core geospatial visualization for the application.",
        href: "https://mapsplatform.google.com/"
    },
    {
        icon: <ImageIcon className="h-8 w-8 text-primary" />,
        title: "Unsplash",
        description: "The hero image featured on the homepage is sourced from Unsplash, providing high-quality, freely-usable photography to create a compelling visual introduction to the application.",
        href: "https://unsplash.com/"
    },
    {
        icon: <Type className="h-8 w-8 text-primary" />,
        title: "Google Fonts",
        description: "The application's typography, using the 'PT Sans' font, is served by Google Fonts. This ensures a consistent, readable, and modern text display across all browsers and devices.",
        href: "https://fonts.google.com/"
    },
]

export default function ReferencesPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Project References</h1>
        <p className="text-muted-foreground mt-2">
            The core data sources and technologies that power the BloomWatch prototype.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {references.map((ref) => (
             <Link href={ref.href} target="_blank" rel="noopener noreferrer" key={ref.title}>
                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 h-full">
                    <CardHeader className="flex flex-row items-start gap-4">
                        {ref.icon}
                        <div>
                            <CardTitle className="text-2xl font-headline">{ref.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {ref.description}
                        </p>
                    </CardContent>
                </Card>
            </Link>
        ))}
      </div>
    </div>
  );
}
