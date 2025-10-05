
import { Suspense } from 'react';
import { SignUpForm } from './components/signup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

function SignUpFormLoading() {
    return (
        <div className="flex justify-center items-center h-72">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex max-w-md flex-col items-center justify-center py-12 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Create an Account</CardTitle>
          <CardDescription>
            Join BloomWatch to start tracking flowering phenology.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SignUpFormLoading />}>
            <SignUpForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
