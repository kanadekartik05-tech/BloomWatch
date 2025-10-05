import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// This is a server-only file. It is NOT safe to use on the client.

// Memoize the initialized app
let adminApp: App | null = null;

function getServiceAccount() {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
        throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. This is required for server-side operations.');
    }
    try {
        return JSON.parse(Buffer.from(serviceAccountString, 'base64').toString('utf-8'));
    } catch (e) {
        throw new Error('Failed to parse the FIREBASE_SERVICE_ACCOUNT. Make sure it is a base64-encoded JSON string.');
    }
}

export function initializeFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  // Check if an app is already initialized. If not, initialize one.
  if (!getApps().length) {
    const serviceAccount = getServiceAccount();
    adminApp = initializeApp({
      credential: cert(serviceAccount)
    });
  } else {
    // If it is initialized, get the default app.
    adminApp = getApps()[0];
  }

  return adminApp;
}
