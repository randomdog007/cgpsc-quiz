import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(config);
export const auth = getAuth(app);

export function observeAuth(callback) {
  return onIdTokenChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      localStorage.removeItem("firebase_id_token");
      callback(null);
      return;
    }

    const token = await firebaseUser.getIdToken();
    localStorage.setItem("firebase_id_token", token);
    callback({
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      user_metadata: {
        full_name: firebaseUser.displayName || "",
        avatar_url: firebaseUser.photoURL || null,
      },
    });
  });
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function signOutUser() {
  await signOut(auth);
}

export async function getIdToken() {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
