import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, LayoutDashboard, BarChart3, Thermometer, BrainCircuit, Droplets, Telescope, CalendarRange } from 'lucide-react';

const features = [
    {
        icon: <Map className="h-8 w-8 text-primary" />,
        title: "Interactive Map",
        description: "Explore a world map to visualize bloom data. Select countries, states, and cities to get detailed analysis. Use the compare mode to see data for multiple cities side-by-side.",
        subFeatures: [
            { icon: <Telescope className="h-5 w-5 text-accent"/>, text: "Multi-level search for any location." },
            { icon: <BarChart3 className="h-5 w-5 text-accent"/>, text: "View vegetation and climate charts." },
            { icon: <BrainCircuit className="h-5 w-5 text-accent"/>, text: "Generate AI-powered bloom predictions." },
            { icon: <CalendarRange className="h-5 w-5 text-accent"/>, text: "Analyze data within custom date ranges." },
        ]
    },
    {
        icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
        title: "Global Dashboard",
        description: "Get a high-level overview of predicted bloom events for key regions around the world. This page provides a real-time snapshot of vegetation health and flowering timelines.",
        subFeatures: [
            { icon: <CalendarRange className="h-5 w-5 text-accent"/>, text: "See predicted bloom dates at a glance." },
            { icon: <Droplets className="h-5 w-5 text-accent"/>, text: "Quickly assess the status (e.g., 'Blooming soon')." },
            { icon: <Telescope className="h-5 w-5 text-accent"/>, text: "Compare progress across different ecosystems." },
        ]
    },
    {
        icon: <BarChart3 className="h-8 w-8 text-primary" />,
        title: "Data Analysis",
        description: "Dive deep into the data for any specific location. This page allows you to analyze historical vegetation trends and generate detailed AI predictions about future bloom events.",
        subFeatures: [
            { icon: <Telescope className="h-5 w-5 text-accent"/>, text: "Search and select any city worldwide." },
            { icon: <BarChart3 className="h-5 w-5 text-accent"/>, text: "Visualize long-term insolation trends." },
            { icon: <BrainCircuit className="h-5 w-5 text-accent"/>, text: "Get detailed AI insights on bloom timing and impact." },
        ]
    },
    {
        icon: <Thermometer className="h-8 w-8 text-primary" />,
        title: "Climate Data",
        description: "Explore and analyze historical climate data. This page provides charts for temperature and rainfall for any selected location and allows you to fetch data for custom date ranges.",
        subFeatures: [
            { icon: <Telescope className="h-5 w-5 text-accent"/>, text: "Select any location with searchable dropdowns." },
            { icon: <CalendarRange className="h-5 w-5 text-accent"/>, text: "Fetch data for specific yearly or seasonal periods." },
            { icon: <BrainCircuit className="h-5 w-5 text-accent"/>, text: "Generate a simple AI summary of the chart data." },
        ]
    }
]

export default function InfoPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline">Application Features</h1>
        <p className="text-muted-foreground mt-2">
            A detailed guide to the features available in each section of BloomWatch.
        </p>
      </div>

      <div className="space-y-8">
        {features.map((feature) => (
            <Card key={feature.title} className="shadow-md">
                <CardHeader className="flex flex-row items-start gap-4">
                    {feature.icon}
                    <div className="flex-1">
                        <CardTitle className="text-2xl font-headline">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <h4 className="font-semibold mb-3">Key Features:</h4>
                    <ul className="space-y-2">
                        {feature.subFeatures.map((sub, index) => (
                            <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                                {sub.icon}
                                <span>{sub.text}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
