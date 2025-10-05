import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { firebaseConfig } from './config';

// This is a server-only file.

// Decode the service account from the environment variable.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf-8'))
  : undefined;

let adminApp: App;

export async function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // When running in a server action, the service account might not be available
  // if the app is not deployed with it. For client-side Firestore operations triggered
  // by server actions, we rely on the client's initialized app.
  if (!serviceAccount) {
    console.warn('FIREBASE_SERVICE_ACCOUNT not set. Admin SDK calls may fail if not running in a deployed environment.');
    // We don't throw an error here to allow client-side initiated server actions
    // to still work with Firestore via the client SDK passed through.
    return null;
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: firebaseConfig.projectId,
  });

  return adminApp;
}
