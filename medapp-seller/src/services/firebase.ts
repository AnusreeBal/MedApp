import { initializeApp, getApps } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, ref } from 'firebase/storage';


// Initialize Firebase only if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistent auth state
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Auth persistence error:', error);
  });

// For local development, connect to emulators if needed
if (process.env.NODE_ENV === 'development') {
  if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
}

// Optional: Configure Firebase Storage settings
storage.maxOperationRetryTime = 20000;  // 20 seconds
storage.maxUploadRetryTime = 20000;     // 20 seconds

// Storage reference
const storageRef = ref(storage);

export { app, auth, db };
