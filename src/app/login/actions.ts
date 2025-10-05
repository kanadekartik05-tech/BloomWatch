'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/firebase/server-init';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginState = {
  success: boolean;
  message: string;
};

// This server action now only verifies if a user exists.
// It DOES NOT and CANNOT log the user in from the server.
// The client will use the client-side SDK to sign in, and this
// action's success is a signal to the client to proceed.
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  const { email } = validatedFields.data;

  try {
    await initializeFirebaseAdmin();
    const auth = getAuth();
    
    // This just checks if the user exists. It DOES NOT verify the password.
    await auth.getUserByEmail(email);

    // If we get here, the user exists. The client can now attempt to sign in.
    return {
      success: true,
      message: 'User exists. Client can now attempt sign-in.',
    };

  } catch (error: any) {
    let message = 'An unexpected error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
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
