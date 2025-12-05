import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAjPNUkCM8GrXn081Wbt9T2rLUPcJy2vsY",
  authDomain: "kobzagra-66ba6.firebaseapp.com",
  projectId: "kobzagra-66ba6",
  storageBucket: "kobzagra-66ba6.firebasestorage.app",
  messagingSenderId: "809097570755",
  appId: "1:809097570755:web:a1a3480ada007a1bbcf576"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);