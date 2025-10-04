import { InsightsView } from './components/insights-view';
import { regions } from '@/lib/data';

export const metadata = {
  title: 'Data Insights | BloomWatch',
  description: 'Analyze NDVI trends and get AI-powered bloom predictions.',
};

export default function InsightsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Data Insights</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Explore historical vegetation trends and predict future blooming events for different regions around the world.
        </p>
      </div>
      <InsightsView regions={regions} />
    </div>
  );
}
