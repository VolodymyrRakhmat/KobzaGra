import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export const updateCoins = async (amount) => {
  if (!auth.currentUser) throw new Error('Користувач не автентифікований');
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const currentCoins = userDoc.data()?.coins || 50;
  await setDoc(userRef, { coins: currentCoins + amount }, { merge: true });
};

export const getCoins = async () => {
  if (!auth.currentUser) return 50;
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  return userDoc.data()?.coins || 50;
};

export const updateStats = async (won) => {
  if (!auth.currentUser) throw new Error('Користувач не автентифікований');
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  const stats = userDoc.data()?.stats || { wins: 0, losses: 0 };
  await setDoc(userRef, {
    stats: {
      wins: won ? stats.wins + 1 : stats.wins,
      losses: won ? stats.losses : stats.losses + 1
    }
  }, { merge: true });
};

export const getStats = async () => {
  if (!auth.currentUser) return { wins: 0, losses: 0 };
  const userRef = doc(db, 'users', auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  return userDoc.data()?.stats || { wins: 0, losses: 0 };
};