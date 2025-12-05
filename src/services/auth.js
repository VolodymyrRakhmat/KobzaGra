// src/services/auth.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
  increment,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAjPNUkCM8GrXn081Wbt9T2rLUPcJy2vsY",
  authDomain: "kobzagra-66ba6.firebaseapp.com",
  projectId: "kobzagra-66ba6",
  storageBucket: "kobzagra-66ba6.appspot.com",
  messagingSenderId: "809097570755",
  appId: "1:809097570755:web:a1a3480ada007a1bbcf576",
  measurementId: "G-PVMPLSD7MY",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export const register = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await user.getIdToken(true);

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error("Auth state timeout"));
      }, 5000);

      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser && currentUser.uid === user.uid) {
          clearTimeout(timeout);
          unsubscribe();
          resolve();
        }
      });
    });

    const playerRef = doc(db, "players", user.uid);
    await setDoc(playerRef, {
      email: user.email,
      createdAt: serverTimestamp(),
      coins: 50,
      wins: 0,
      losses: 0,
    }, { merge: true });

    console.log("Firestore: документ створено для", user.uid);
    return user;
  } catch (err) {
    console.error("Register error:", err.code, err.message);
    throw err;
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (err) {
    console.error("Login error:", err.code);
    throw err;
  }
};

export const sendPasswordReset = async (email) => {
  if (!email?.trim()) {
    throw new Error("Email is required");
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: "https://kobzagra-66ba6.firebaseapp.com",
    });
    console.log("Лист для скидання надіслано на:", email);
  } catch (error) {
    console.error("sendPasswordResetEmail error:", error.code, error.message);
    throw error;
  }
};

export const logout = async () => {
  return await signOut(auth);
};

export {
  app,
  auth,
  db,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment,
};