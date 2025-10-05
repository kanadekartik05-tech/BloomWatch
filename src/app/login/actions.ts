'use server';

import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginState = {
  success: boolean;
  message: string;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  const { email, password } = validatedFields.data;

  try {
    const { auth } = initializeFirebase();
    await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      message: 'You have been successfully logged in.',
    };
  } catch (error: any) {
    let message = 'An unexpected error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                message = 'Invalid email or password.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            default:
                message = 'An error occurred during login. Please try again.';
                break;
        }
    }
    return {
      success: false,
      message,
    };
  }
}
