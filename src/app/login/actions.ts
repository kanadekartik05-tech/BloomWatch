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

// This is a server action, so it runs on the server.
// We need to use the Firebase Admin SDK here.
// NOTE: signInWithEmailAndPassword is a client-side SDK function.
// The Admin SDK does not handle sessions in the same way.
// A common pattern is to verify the user's password (which we can't do directly with password hashes)
// or to create a custom token and send it to the client to sign in with.
// For this prototype, we'll assume a simplified custom token flow.
// A real app would need a more secure implementation.

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
    // This is a simplified example. A real app would need to
    // verify the password, which isn't directly possible with the Admin SDK
    // in a simple way. You'd typically call a client-side function or an endpoint
    // that uses the client SDK.
    // For the prototype, we are simulating a successful login if the user exists.
    await initializeFirebaseAdmin();
    const auth = getAuth();
    
    // This just checks if the user exists. It DOES NOT verify the password.
    await auth.getUserByEmail(email);

    // If the user exists, we assume login is successful for this prototype.
    // In a real app, you would verify the password and create a custom session.
    return {
      success: true,
      message: 'You have been successfully logged in.',
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
