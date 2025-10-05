'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof LoginFormSchema>) => {
    // Non-blocking sign-in attempt
    signInWithEmailAndPassword(auth, data.email, data.password)
        .catch((error) => {
            let message = "An unexpected error occurred during login.";
            switch(error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    message = "Invalid email or password.";
                    break;
                case 'auth/invalid-email':
                    message = 'Please enter a valid email address.';
                    break;
                default:
                    console.error("Login Error:", error);
                    break;
            }
            toast({
                title: "Login Failed",
                description: message,
                variant: "destructive",
            });
        });
  };

  useEffect(() => {
    if (!isUserLoading && user) {
        toast({
            title: "Logged In!",
            description: "You have been successfully logged in.",
        });
        router.push('/dashboard');
    }
  }, [user, isUserLoading, router, toast]);


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" {...field} type="password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </form>
    </Form>
  );
}
