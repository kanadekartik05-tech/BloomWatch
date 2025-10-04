import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Satellite, Thermometer, CloudRain, Microscope } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <h1 className="mb-8 text-center text-4xl font-bold font-headline">About BloomWatch</h1>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            BloomWatch is dedicated to making Earth observation data accessible and understandable for everyone.
            Our goal is to monitor global flowering phenology (the timing of plant life cycle events) to help
            scientists, ecologists, and nature enthusiasts track and predict plant blooming events. By visualizing
            this data, we can better understand the impact of climate change on ecosystems.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-8">
        <div>
          <h2 className="mb-4 text-3xl font-bold font-headline">What is NDVI?</h2>
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <Microscope className="h-24 w-24 shrink-0 text-primary" />
            <p className="text-muted-foreground">
              The <strong>Normalized Difference Vegetation Index (NDVI)</strong> is a simple graphical indicator that can be used to analyze remote sensing measurements and assess whether the target being observed contains live green vegetation or not. It is calculated from the visible and near-infrared light reflected by vegetation. Healthy vegetation absorbs most of the visible light that hits it, and reflects a large portion of the near-infrared light. Unhealthy or sparse vegetation reflects more visible light and less near-infrared light. NDVI values range from -1.0 to 1.0, where higher values indicate healthier and denser vegetation. In BloomWatch, we use peaks in NDVI as a proxy for peak blooming periods.
            </p>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-3xl font-bold font-headline">Data Sources</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <Satellite className="h-8 w-8 text-accent" />
                <CardTitle>MODIS & Landsat/Sentinel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use NDVI data from NASA's Moderate Resolution Imaging Spectroradiometer (MODIS) instrument, as well as higher-resolution imagery from the Landsat and Sentinel satellite constellations. These provide frequent, global coverage of the Earth's land surface.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex">
                  <Thermometer className="h-8 w-8 text-accent" />
                  <CloudRain className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>NASA POWER API</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  For contextual climate data, we integrate with the NASA Prediction of Worldwide Energy Resources (POWER) API. This provides valuable information on environmental factors like temperature and rainfall, which can influence plant growth and blooming cycles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
