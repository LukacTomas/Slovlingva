/**
 * Firebase SDK initialisation.
 *
 * Reads config from VITE_FIREBASE_* environment variables.
 * Exports the shared `auth` and `db` instances used by all Firebase-related code.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

/**
 * Returns true when all required Firebase env vars are set.
 * When false, the app runs in local-only mode.
 */
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId)
}

/** Lazy-initialise Firebase and return the app instance. */
function getApp(): FirebaseApp {
  if (!app) {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not configured. Set VITE_FIREBASE_* environment variables.')
    }
    app = initializeApp(firebaseConfig)
  }
  return app
}

/** Firebase Auth instance (lazy). */
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getApp())
  }
  return auth
}

/** Firestore instance with offline persistence (lazy). */
export function getFirebaseDb(): Firestore {
  if (!db) {
    db = initializeFirestore(getApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  }
  return db
}
