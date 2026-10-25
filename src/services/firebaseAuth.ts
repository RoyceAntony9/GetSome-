import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  Auth,
} from 'firebase/auth';
import staticConfig from '../../firebase-applet-config.json';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let initPromise: Promise<Auth> | null = null;

const provider = new GoogleAuthProvider();
// Required Gmail compose scope for draft creation
provider.addScope('https://www.googleapis.com/auth/gmail.compose');

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let currentUser: User | null = null;

export async function getAuthInstance(): Promise<Auth> {
  if (authInstance) return authInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        appInstance = existingApps[0];
        authInstance = getAuth(appInstance);
        return authInstance;
      }

      let config: any = { ...staticConfig };
      try {
        const res = await fetch('/api/firebase-config');
        if (res.ok) {
          const remoteConfig = await res.json();
          config = { ...config, ...remoteConfig };
        }
      } catch (err) {
        console.warn('Could not load dynamic Firebase config, using default:', err);
      }

      // Check if Vite or window environment has the API key
      if (!config.apiKey && typeof window !== 'undefined') {
        const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
        if (envKey) {
          config.apiKey = envKey;
        }
      }

      appInstance = initializeApp(config);
      authInstance = getAuth(appInstance);
      return authInstance;
    })();
  }
  return initPromise;
}

// Eagerly initiate config resolution in browser environment
if (typeof window !== 'undefined') {
  getAuthInstance().catch((err) => {
    console.debug('Firebase Auth background initialization:', err?.message || err);
  });
}

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  let unsubscribe = () => {};
  getAuthInstance().then((auth) => {
    unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      currentUser = user;
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          // Token will be acquired on manual sign-in with popup
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    });
  }).catch(() => {
    if (onAuthFailure) onAuthFailure();
  });

  return () => {
    unsubscribe();
  };
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const auth = await getAuthInstance();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token for Gmail draft operations.');
    }

    cachedAccessToken = credential.accessToken;
    currentUser = result.user;

    // Send token to backend session store securely
    await fetch('/api/gmail/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cachedAccessToken}`,
      },
      body: JSON.stringify({
        email: result.user.email,
        displayName: result.user.displayName,
      }),
    });

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const logout = async () => {
  try {
    const auth = await getAuthInstance();
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase sign out error:', err);
  }
  cachedAccessToken = null;
  currentUser = null;
  await fetch('/api/gmail/disconnect', { method: 'POST' }).catch(() => {});
};
