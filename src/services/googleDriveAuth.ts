import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Scopes required for Google Drive integration
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Keys for storing access token securely for auto-reconnect
const TOKEN_STORAGE_KEY = 'kmf_gdrive_access_token_v1';
const TOKEN_TIMESTAMP_KEY = 'kmf_gdrive_token_timestamp_v1';
// OAuth tokens are typically valid for 3600 seconds (1 hour). We consider it fresh for 50 minutes.
const TOKEN_TTL_MS = 50 * 60 * 1000;

// Initialize Firebase App singleton safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

// Cache the access token in memory with fallback to valid local storage
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

// Read persisted token
export const getPersistedToken = (): string | null => {
  try {
    const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      return savedToken;
    }
  } catch {}
  return null;
};

// Save token
export const persistToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
    }
  } catch {}
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // Check persisted token on startup
  const existingToken = getPersistedToken();
  if (existingToken) {
    cachedAccessToken = existingToken;
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user) {
      if (user.email) {
        try {
          localStorage.setItem('kmf_gdrive_user_email', user.email);
        } catch {}
      }
      const activeToken = cachedAccessToken || getPersistedToken();
      if (activeToken) {
        cachedAccessToken = activeToken;
        if (onAuthSuccess) onAuthSuccess(user, activeToken);
      } else {
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      const activeToken = getPersistedToken();
      if (activeToken) {
        cachedAccessToken = activeToken;
      } else {
        cachedAccessToken = null;
        persistToken(null);
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

// Must be called from a button click or user interaction
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    persistToken(credential.accessToken);
    if (result.user.email) {
      try {
        localStorage.setItem('kmf_gdrive_user_email', result.user.email);
      } catch {}
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  const token = getPersistedToken();
  if (token) {
    cachedAccessToken = token;
    return token;
  }
  return null;
};

export const getCurrentGoogleUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
  persistToken(null);
  try {
    localStorage.removeItem('kmf_gdrive_user_email');
  } catch {}
};
