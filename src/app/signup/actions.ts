
'use server';

import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/firebase/server-init';


const CreateUserProfileSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(2),
});

type CreateUserProfileState = {
  success: boolean;
  message: string;
};

// This is now a dedicated server action to create a user's profile
// in Firestore after they have been created on the client.
export async function createUserProfile(userData: z.infer<typeof CreateUserProfileSchema>): Promise<CreateUserProfileState> {
  const validatedFields = CreateUserProfileSchema.safeParse(userData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid user data provided.',
    };
  }
  
  const { uid, email, displayName } = validatedFields.data;

  try {
    await initializeFirebaseAdmin();
    const firestore = getFirestore();

    const userRef = firestore.collection('users').doc(uid);
    await userRef.set({
      uid: uid,
      email: email,
      displayName: displayName,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'User profile created successfully.',
    };
  } catch (error: any) {
    console.error("Error creating user profile:", error);
    return {
      success: false,
      message: 'An unexpected error occurred while creating user profile.',
    };
  }
}
