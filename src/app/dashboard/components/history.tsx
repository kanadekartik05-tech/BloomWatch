
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader, List, Flower } from 'lucide-react';
import { format } from 'date-fns';

type HistoryEvent = {
    id: string;
    type: 'PREDICTION';
    regionName: string;
    predictedDate: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
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
                <CardTitle>Prediction History</CardTitle>
                <CardDescription>Your most recent prediction requests.</CardDescription>
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
                        {history.map((item) => (
                            <li key={item.id} className="flex items-center justify-between rounded-md border p-4">
                                <div className="flex items-center gap-4">
                                    <Flower className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="font-semibold">
                                            Predicted bloom for <span className="text-accent">{item.regionName}</span>
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Bloom expected around: {format(new Date(item.predictedDate), 'PPP')}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(item.createdAt.seconds * 1000), 'Pp')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
                
                {!isLoading && (!history || history.length === 0) && (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
                        <List className="h-10 w-10 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">No History Yet</h3>
                        <p className="text-sm text-muted-foreground">
                            Your prediction history will appear here once you add a city to your dashboard.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
