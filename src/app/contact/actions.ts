'use server';

import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase';
import { useFirestore } from '@/firebase';
import { initializeFirebase } from '@/firebase';


const ContactFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export type ContactFormState = {
  message: string;
  success: boolean;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  if (!validatedFields.success) {
    // This is a server-side validation message.
    // The client-side form validation should catch this first.
    return {
      message: 'Invalid form data provided.',
      success: false,
    };
  }

  try {
    const { firestore } = initializeFirebase();
    const collectionRef = collection(firestore, 'contact_messages');
    await addDoc(collectionRef, {
        ...validatedFields.data,
        sentAt: serverTimestamp(),
    });

    return {
      message: 'Thank you for your message! We will get back to you soon.',
      success: true,
    };
  } catch (error) {
    console.error('Error adding document to Firestore: ', error);
    return {
      message: 'An unexpected error occurred. Please try again later.',
      success: false,
    };
  }
}
