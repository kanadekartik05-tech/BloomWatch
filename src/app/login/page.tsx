
import { Suspense } from 'react';
import { LoginForm } from './components/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from 'lucide-react';

function LoginFormLoading() {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
    );
}

export default function LoginPage() {
  return (
    <div className="container mx-auto flex max-w-md flex-col items-center justify-center py-12 px-4">
      <Card className="w-full shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your personalized dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<LoginFormLoading />}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
