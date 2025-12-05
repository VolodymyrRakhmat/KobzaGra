// navigation/AppNavigator.js

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, Platform } from "react-native";

import LoginScreen from "../screens/LoginScreen";
import GameScreen from "../screens/GameScreen";
import StatsScreen from "../screens/StatsScreen";
import AnagramGameScreen from "../screens/AnagramGameScreen";
import { auth, onAuthStateChanged } from "../services/auth";

// ✅ ІМПОРТ: Імпортуємо SettingsProvider з GameScreen
import { SettingsProvider } from "../screens/GameScreen"; 

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    // ✅ ОБГОРТКА: Навігація обгорнута SettingsProvider
    <SettingsProvider> 
      <NavigationContainer
        documentTitle={{
          formatter: (options, route) => {
            if (Platform.OS === 'web') {
              return ''; 
            }
            return 'Кобза Гра'; 
          },
        }}
      >
        <Stack.Navigator>
          {user ? (
            // ✅ ГРУПА ЕКРАНІВ ДЛЯ АВТОРИЗОВАНИХ
            <Stack.Group>
              <Stack.Screen 
                  name="Game" 
                  component={GameScreen} 
                  options={{}} 
              />
              <Stack.Screen name="Stats" component={StatsScreen} />
              
              {/* ✅ РЕЄСТРАЦІЯ ANAGRAMGAMSCREEN (виправлення помилки навігації) */}
              <Stack.Screen 
                  name="AnagramGame" 
                  component={AnagramGameScreen} 
                  options={{ title: 'Склади Слово' }} 
              />
            </Stack.Group>
          ) : (
            // Екран входу для неавторизованих
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
};

export default AppNavigator;