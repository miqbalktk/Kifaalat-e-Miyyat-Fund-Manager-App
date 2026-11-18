import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Member, Contribution, Donation, BereavementClaim, MemberCredential, AuditLog } from '../types';

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

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
// CRITICAL: Custom database ID specified in firebase-applet-config.json
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connectivity test
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or unreachable.');
    }
    return false;
  }
}

// Generic collection fetcher
export async function fetchCollectionDocs<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const list: T[] = [];
    snap.forEach(d => {
      list.push(d.data() as T);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionName);
    return [];
  }
}

// Single document saver
export async function saveDocument<T extends Record<string, any>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

// Single document deleter
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
  }
}

// Bulk seed documents if collection is empty
export async function batchSeedIfEmpty<T extends { id?: string; username?: string }>(
  collectionName: string,
  items: T[],
  idKey: 'id' | 'username' = 'id'
): Promise<boolean> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    if (snap.empty && items.length > 0) {
      // Seed up to batch size 400
      const batch = writeBatch(db);
      for (const item of items) {
        const id = (item as any)[idKey];
        if (id) {
          const docRef = doc(db, collectionName, String(id));
          batch.set(docRef, item);
        }
      }
      await batch.commit();
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`Seed check failed for ${collectionName}:`, err);
    return false;
  }
}
