import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-background');

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative h-[60vh] w-full text-white md:h-[70vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl font-headline">
            BloomWatch
          </h1>
          <p className="mb-8 max-w-2xl text-lg text-gray-200 md:text-xl">
            Track, visualize, and predict plant blooming events using NASA Earth observation data.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="/map">
              Explore Blooming Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold font-headline">Interactive Map</h3>
              <p className="text-muted-foreground">
                Visualize global blooming events on an interactive map.
              </p>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold font-headline">Data Insights</h3>
              <p className="text-muted-foreground">
                Analyze NDVI trends and understand vegetation health over time.
              </p>
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold font-headline">AI-Powered Predictions</h3>
              <p className="text-muted-foreground">
                Leverage AI to predict future blooming events based on historical data.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
