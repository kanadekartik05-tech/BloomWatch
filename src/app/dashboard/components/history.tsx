
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, List, Flower, BarChart3, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

type HistoryEvent = {
    id: string;
    type: 'PREDICTION' | 'ANALYSIS' | 'CLIMATE_SUMMARY';
    regionName: string;
    predictedDate?: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

const eventConfig = {
    PREDICTION: {
        icon: Flower,
        color: "text-primary",
        title: (region: string) => `Predicted bloom for ${region}`,
        description: (date?: string) => date ? `Bloom expected around: ${format(new Date(date), 'PPP')}` : 'No date predicted'
    },
    ANALYSIS: {
        icon: BarChart3,
        color: "text-blue-500",
        title: (region: string) => `Analyzed data for ${region}`,
        description: () => `Viewed vegetation & climate charts`
    },
    CLIMATE_SUMMARY: {
        icon: MessageCircle,
        color: "text-orange-500",
        title: (region: string) => `Generated summary for ${region}`,
        description: () => `AI-powered chart explanation`
    }
};


export function History() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const historyQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'users', user.uid, 'history'),
            orderBy('createdAt', 'desc'),
            limit(20)
        );
    }, [user, firestore]);

    const { data: history, isLoading, error } = useCollection<Omit<HistoryEvent, 'id'>>(historyQuery);
    
    if (isUserLoading) {
        return null; // Don't show anything until we know who the user is
    }

    if (!user) {
        return (
            <div className="mt-12">
                <p className="text-center text-muted-foreground">
                    Please <a href="/login" className="text-primary underline">log in</a> to see your prediction history.
                </p>
            </div>
        );
    }

    return (
        <Card className="mt-12">
            <CardHeader>
                <CardTitle>Activity History</CardTitle>
                <CardDescription>Your most recent activities across the app.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>Loading history...</span>
                    </div>
                )}

                {error && (
                    <p className="text-destructive">Failed to load history: {error.message}</p>
                )}

                {!isLoading && history && history.length > 0 && (
                    <ul className="space-y-4">
                        {history.map((item) => {
                            const config = eventConfig[item.type] || eventConfig.ANALYSIS;
                            const Icon = config.icon;

                            return (
                                <li key={item.id} className="flex items-center justify-between rounded-md border p-4">
                                    <div className="flex items-center gap-4">
                                        <Icon className={`h-6 w-6 ${config.color}`} />
                                        <div>
                                            <p className="font-semibold">
                                                {config.title(item.regionName)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {config.description(item.predictedDate)}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(item.createdAt.seconds * 1000), 'Pp')}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                )}
                
                {!isLoading && (!history || history.length === 0) && (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
                        <List className="h-10 w-10 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No History Yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Your activity history will appear here as you use the app.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
