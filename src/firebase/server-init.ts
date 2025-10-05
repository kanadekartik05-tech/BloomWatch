import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { firebaseConfig } from './config';

// This is a server-only file.
const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8'))
  : undefined;

// Memoize the initialized app
let adminApp: App | null = null;

export async function initializeFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }
  
  // Check if an app is already initialized (e.g., by another function call)
  if (getApps().length > 0) {
    adminApp = getApp();
    return adminApp;
  }

  if (!serviceAccountKey) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set. Admin SDK calls will fail.');
    // We return null and let the calling function handle the absence of the admin app
    return null;
  }
  
  try {
    adminApp = initializeApp({
      credential: cert(serviceAccountKey),
      projectId: firebaseConfig.projectId,
    });
    return adminApp;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // In case of initialization error, we also return null
    return null;
  }
}
