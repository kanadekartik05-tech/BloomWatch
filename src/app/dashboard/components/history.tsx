
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader, List, Flower, BarChart3, MessageCircle, Sprout, PersonStanding } from 'lucide-react';
import { format } from 'date-fns';
import type { PredictNextBloomDateOutput } from '@/ai/flows/types';

type HistoryEvent = {
    id: string;
    type: 'PREDICTION' | 'ANALYSIS' | 'CLIMATE_SUMMARY';
    regionName: string;
    city: string;
    state: string;
    country: string;
    summary?: string;
    prediction?: PredictNextBloomDateOutput;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
};

const eventConfig = {
    PREDICTION: {
        icon: Wand2,
        color: "text-purple-500",
        title: (region: string) => `AI Prediction for ${region}`,
    },
    ANALYSIS: {
        icon: BarChart3,
        color: "text-blue-500",
        title: (region: string) => `Analyzed charts for ${region}`,
    },
    CLIMATE_SUMMARY: {
        icon: MessageCircle,
        color: "text-orange-500",
        title: (region: string) => `Generated summary for ${region}`,
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
                    Please <a href="/login" className="text-primary underline">log in</a> to see your activity history.
                </p>
            </div>
        );
    }
    
    const getLocationString = (item: HistoryEvent) => {
        return [item.city, item.state, item.country].filter(Boolean).join(', ');
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
                    <Accordion type="single" collapsible className="w-full space-y-2">
                        {history.map((item) => {
                            const config = eventConfig[item.type] || eventConfig.ANALYSIS;
                            const Icon = config.icon;

                            return (
                                <AccordionItem value={item.id} key={item.id} className="rounded-md border px-4">
                                     <AccordionTrigger>
                                        <div className="flex w-full items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Icon className={`h-6 w-6 ${config.color}`} />
                                                <div className="text-left">
                                                    <p className="font-semibold">
                                                        {config.title(item.regionName)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getLocationString(item)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground pr-4">
                                                {format(new Date(item.createdAt.seconds * 1000), 'Pp')}
                                            </span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-2 pb-4">
                                        {item.type === 'CLIMATE_SUMMARY' && item.summary && (
                                            <div className="border-t pt-4 mt-2">
                                                 <h4 className="font-semibold mb-2">AI Summary</h4>
                                                <p className="text-sm text-muted-foreground italic">"{item.summary}"</p>
                                            </div>
                                        )}
                                        {item.type === 'PREDICTION' && item.prediction && (
                                            <div className="border-t pt-4 mt-2 space-y-4">
                                                <div className="font-semibold">
                                                    Predicted Bloom Date: <span className="text-primary">{new Date(item.prediction.predictedNextBloomDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">"{item.prediction.predictionJustification}"</p>
                                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div className="space-y-1">
                                                        <h5 className="font-semibold flex items-center gap-2"><Flower className="text-accent h-4 w-4"/>Ecological Significance</h5>
                                                        <p className="text-muted-foreground">{item.prediction.ecologicalSignificance}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h5 className="font-semibold flex items-center gap-2"><Sprout className="text-accent h-4 w-4"/>Potential Species</h5>
                                                        <p className="text-muted-foreground">{item.prediction.potentialSpecies}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h5 className="font-semibold flex items-center gap-2"><PersonStanding className="text-accent h-4 w-4"/>Human Impact</h5>
                                                        <p className="text-muted-foreground">{item.prediction.humanImpact}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {item.type === 'ANALYSIS' && (
                                             <div className="border-t pt-4 mt-2">
                                                <p className="text-sm text-muted-foreground">Viewed climate and vegetation charts for this location.</p>
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
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

    