'use server';

import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/firebase/server-init';

const SignUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type SignUpState = {
  success: boolean;
  message: string;
};

export async function signup(prevState: SignUpState, formData: FormData): Promise<SignUpState> {
  const validatedFields = SignUpSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  const { name, email, password } = validatedFields.data;

  try {
    await initializeFirebaseAdmin();
    const auth = getAuth();
    const firestore = getFirestore();

    const userRecord = await auth.createUser({
        email,
        password,
        displayName: name,
    });

    const userRef = firestore.collection('users').doc(userRecord.uid);
    await userRef.set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: name,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'Your account has been created successfully.',
    };
  } catch (error: any) {
    let message = 'An unexpected error occurred.';
    if (error.code) {
        switch (error.code) {
            case 'auth/email-already-exists':
                message = 'This email address is already in use.';
                break;
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                message = 'The password is too weak. Please choose a stronger password.';
                break;
            default:
                message = 'An error occurred during sign up. Please try again.';
                break;
        }
    }
    return {
      success: false,
      message,
    };
  }
}
