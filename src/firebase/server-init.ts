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

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Cannot initialize Firebase Admin SDK.');
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: firebaseConfig.projectId,
  });

  return adminApp;
}
