'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';

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
import { signup } from '../actions';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';

const SignUpFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export function SignUpForm() {
  const [state, formAction] = useActionState(signup, { success: false, message: '' });
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Account Created!",
          description: state.message,
        });

        // After the server action successfully creates the user,
        // we sign them in on the client.
        const { email, password } = form.getValues();
        signInWithEmailAndPassword(auth, email, password).catch((error) => {
            // This sign-in should not fail if creation succeeded, but we'll handle it.
            console.error("Client sign-in after signup failed:", error);
            toast({
                title: "Auto Login Failed",
                description: "Your account was created, but you need to log in manually.",
                variant: "destructive"
            })
            router.push('/login');
        })
        
      } else {
        toast({
          title: "Sign Up Failed",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, toast, router, auth]);

  useEffect(() => {
    // If the user is logged in (either by the effect above or already), redirect.
    if (!isUserLoading && user) {
        router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  return (
    <Form {...form}>
      <form
        action={formAction}
        className="space-y-6"
      >
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                    <Input placeholder="Your Name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
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
          <UserPlus className="mr-2 h-4 w-4" />
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
