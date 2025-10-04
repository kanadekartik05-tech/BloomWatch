import { DashboardView } from './components/dashboard-view';
import { regions } from '@/lib/data';

export const metadata = {
  title: 'Dashboard | BloomWatch',
  description: 'View real-time flowering patterns across different regions on the maps.',
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Global Bloom Dashboard</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          A real-time overview of predicted flowering events and vegetation health across key regions. Add any city to customize your view.
        </p>
      </div>
      <DashboardView initialRegions={[]} />
    </div>
  );
}
