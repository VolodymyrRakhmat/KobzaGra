// App.js (Після виправлення)

import React from "react"; 
import AppNavigator from './src/navigation/AppNavigator'; // 🟢 Залишити
import Toast from 'react-native-toast-message';           // 🟢 Залишити
// ❌ ВИДАЛИТИ: import { auth, onAuthStateChanged } from "./src/services/auth";
// ❌ ВИДАЛИТИ: import { useEffect, useState } from "react";

export default function App() {
  // ❌ ВИДАЛИТИ: const [user, setUser] = useState(null);

  // ❌ ВИДАЛИТИ: useEffect із логікою onAuthStateChanged

  return (
    <>
      {/* 🟢 КРИТИЧНЕ ВИПРАВЛЕННЯ: Більше НЕ передаємо пропс user! */}
      <AppNavigator /> 
      <Toast />
    </>
  );
}