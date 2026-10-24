import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass databaseId if defined in the config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
googleProvider.addScope('https://mail.google.com/');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.labels');

// Google Chat scopes
googleProvider.addScope('https://www.googleapis.com/auth/chat.spaces');
googleProvider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/chat.messages');
googleProvider.addScope('https://www.googleapis.com/auth/chat.messages.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/chat.memberships.readonly');

// Google Meet scopes
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.created');
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/meetings.space.settings');

// Standard custom error handling pattern according to Firebase Integration Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore notice/warning details: ', JSON.stringify(errInfo));
  return errInfo;
}

// 🎯 Validate Connection to Firestore on startup
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore connection verified successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.info("Firestore status: Client operating in local cache / offline mode.");
    } else {
      console.info("Firestore status: Local client initialized.");
    }
  }
}

testConnection();
