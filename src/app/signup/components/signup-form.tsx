'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

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
import { UserPlus, Loader } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { createUserProfile } from '../actions';


const SignUpFormSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type SignUpFormValues = z.infer<typeof SignUpFormSchema>;

export function SignUpForm() {
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

  const onSubmit = async (data: SignUpFormValues) => {
    if (!auth) {
        toast({
            title: "Authentication service not available",
            description: "Please try again later.",
            variant: "destructive"
        });
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        // Update profile on the client
        await updateProfile(userCredential.user, { displayName: data.name });

        // Call server action to create Firestore document
        // We need to construct a UserRecord-like object for the server action
        const userForServer = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: data.name,
            providerData: userCredential.user.providerData,
            emailVerified: userCredential.user.emailVerified,
            phoneNumber: userCredential.user.phoneNumber,
            photoURL: userCredential.user.photoURL,
            disabled: userCredential.user.disabled,
            metadata: userCredential.user.metadata,
            tenantId: userCredential.user.tenantId,
            customClaims: {}, // Not available on client
            tokensValidAfterTime: undefined, // Not available on client
            toJSON: () => ({...userCredential.user})
        }
        
        // This is a type assertion because the client User object is slightly different
        // from the admin SDK's UserRecord. This is safe for our use case.
        await createUserProfile(userForServer as any);

    } catch(error: any) {
        let message = 'An unexpected error occurred.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email address is already in use.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                message = 'The password is too weak. Please choose a stronger password.';
                break;
            default:
                console.error("Signup error:", error);
                break;
        }
         toast({
          title: "Sign Up Failed",
          description: message,
          variant: "destructive",
        });
    }
  }


  useEffect(() => {
    // If the user is logged in (either by the effect above or already), redirect.
    if (!isUserLoading && user) {
        toast({
            title: "Sign Up Successful!",
            description: "Welcome to BloomWatch.",
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
        <Button type="submit" disabled={form.formState.isSubmitting || isUserLoading} className="w-full">
            {form.formState.isSubmitting || isUserLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Sign Up
        </Button>
      </form>
    </Form>
  );
}
