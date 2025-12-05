// AnagramGameScreen.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Platform,
  Animated,
} from "react-native";

import { useSettings } from "./GameScreen"; 
import { words_easy, words_medium, words_hard } from "../services/words";
import {
  auth,
  db,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
  increment,
  onAuthStateChanged,
} from "../services/auth";
import { createStyles, getThemedStyles, styles as staticStyles } from "./GameScreenStyles";

// ✅ КОНСТАНТА
const ANAGRAM_REWARD = 2; 

// ----------------------------------------------------------------------
const ENCRYPTION_OFFSET = 5;

// Функція обфускації: Зміщення символів + Реверс
const obfuscateWord = (word) => {
  // 1. Реверс
  let reversed = word.split("").reverse().join("");

  // 2. Зміщення (шифр Цезаря)
  return reversed.split("").map(char => {
    // Просте зміщення на ENCRYPTION_OFFSET
    return String.fromCharCode(char.charCodeAt(0) + ENCRYPTION_OFFSET);
  }).join("");
};

// Функція деобфускації: Зворотне зміщення + Зворотний реверс
const deobfuscateWord = (obfuscatedWord) => {
  // 1. Зворотне зміщення
  let shifted = obfuscatedWord.split("").map(char => {
    return String.fromCharCode(char.charCodeAt(0) - ENCRYPTION_OFFSET);
  }).join("");

  // 2. Зворотний реверс
  return shifted.split("").reverse().join("");
};
// ----------------------------------------------------------------------

// Функція для перемішування букв слова
const shuffleWord = (word) => {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Функція вибору слова (5 або 6 букв)
const selectAnagramWord = () => {
  // Об'єднуємо всі списки, фільтруємо слова довжиною 5 або 6
  const allWords = [...words_easy, ...words_medium, ...words_hard]
    .map(item => typeof item === 'object' ? item.word : item)
    .filter(word => word.length === 5 || word.length === 6)
    .map(word => word.toLocaleLowerCase("uk").trim());

  if (allWords.length === 0) return { secretWord: "кобза", shuffledLetters: ["к", "о", "б", "з", "а"] };

  const randomIndex = Math.floor(Math.random() * allWords.length);
  const secretWord = allWords[randomIndex];
  const shuffledLetters = shuffleWord(secretWord);

  return { secretWord, shuffledLetters };
};

const AnagramGameScreen = ({ navigation }) => {
  const { isDarkMode } = useSettings(); 
  const { width } = useWindowDimensions();
  const isDesktop = width > 800;

  const [secretWord, setSecretWord] = useState("");
  const [shuffledLetters, setShuffledLetters] = useState([]);
  const [currentGuess, setCurrentGuess] = useState([]); 
  const [availableLetters, setAvailableLetters] = useState([]); 

  const [message, setMessage] = useState("Складіть слово!");
  const [messageType, setMessageType] = useState("info");
  const [gameOver, setGameOver] = useState(false);
  const [stats, setStats] = useState({ coins: 0, anagramWins: 0, anagramLosses: 0, anagramGamesPlayed: 0 }); 

  const confettiAnimation = useRef(new Animated.Value(0)).current; 

  const dynamicStyles = createStyles(width, isDesktop, isDarkMode);
  const themedStyles = getThemedStyles(isDarkMode);

  const AnagramStyles = useMemo(() => {
    return StyleSheet.create({
        letterTile: {
            width: 40,
            height: 40,
            margin: 5,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: isDarkMode ? '#555' : '#ccc',
            backgroundColor: isDarkMode ? '#333' : '#fff',
        },
        guessTile: {
            width: dynamicStyles.tile.width,
            height: dynamicStyles.tile.height,
            margin: dynamicStyles.tile.margin,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: isDarkMode ? '#888' : '#a0b0c0',
            backgroundColor: isDarkMode ? '#2e2e2e' : '#fff',
        },
        guessTileFilled: {
            borderColor: '#2563eb',
        },
        text: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#0f172a',
        },
        letterButtonAvailable: {
            backgroundColor: isDarkMode ? '#374151' : '#d1e0ef',
            borderColor: isDarkMode ? '#4b5563' : '#93c5fd',
        },
        letterButtonUsed: {
            backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb',
            borderColor: isDarkMode ? '#4b5563' : '#ccc',
            opacity: 0.5,
        },
        confettiContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none', 
          overflow: 'hidden',
          zIndex: 100,
        }
    });
  }, [isDarkMode, dynamicStyles]);


  const initializeGame = useCallback(() => {
    const { secretWord: newSecretWord, shuffledLetters: newShuffledLetters } = selectAnagramWord();
    
    const obfuscatedWord = obfuscateWord(newSecretWord);
    setSecretWord(obfuscatedWord); 

    setShuffledLetters(newShuffledLetters);
    setCurrentGuess([]);
    setAvailableLetters(newShuffledLetters.map((l, i) => ({ letter: l, index: i, used: false }))); 
    setMessage("Складіть слово!");
    setMessageType("info");
    setGameOver(false);
  }, []);
  
  const fetchStats = useCallback(async (user) => {
      if (!user) {
        setStats({ coins: 0, anagramWins: 0, anagramLosses: 0, anagramGamesPlayed: 0 }); 
        return;
      }
      try {
        const ref = doc(db, "players", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setStats({ 
            coins: Number(data.coins) || 0,
            anagramWins: Number(data.anagramWins) || 0, 
            anagramLosses: Number(data.anagramLosses) || 0, 
            anagramGamesPlayed: Number(data.anagramGamesPlayed) || 0, 
          });
        }
      } catch (err) {
        console.error("Firestore error:", err);
      }
  }, []);

  const updateStats = useCallback(async (coinChange, isWin = null) => {
      if (!auth.currentUser) return;
      try {
        const ref = doc(db, "players", auth.currentUser.uid);
        const payload = {
          coins: increment(coinChange),
          lastPlayed: serverTimestamp(),
          anagramGamesPlayed: increment(1), 
        };
        if (isWin !== null) {
            payload.anagramWins = increment(isWin ? 1 : 0);
            payload.anagramLosses = increment(!isWin ? 1 : 0);
        }
        
        await updateDoc(ref, payload);
        fetchStats(auth.currentUser); 
      } catch (err) {
        console.error("updateStats error:", err);
      }
  }, [fetchStats]);

  const runVictoryAnimation = useCallback(() => {
      confettiAnimation.setValue(0);
      Animated.sequence([
          Animated.timing(confettiAnimation, {
              toValue: 1,
              duration: 200, 
              useNativeDriver: false, 
          }),
          Animated.timing(confettiAnimation, {
              toValue: 0,
              duration: 500, 
              useNativeDriver: false,
          })
      ]).start();
  }, [confettiAnimation]);


  useEffect(() => {
    initializeGame();
    const unsubscribe = onAuthStateChanged(auth, fetchStats);
    return () => unsubscribe();
  }, [initializeGame, fetchStats]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Анаграма',
      headerStyle: { backgroundColor: isDarkMode ? "#1f2937" : "#f8fafc" },
      headerTintColor: isDarkMode ? "#f9fafb" : "#1f2937",
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ marginLeft: Platform.OS === 'web' ? 10 : 0, paddingHorizontal: 15 }}
        >
          <Text style={{ fontSize: 24, color: isDarkMode ? "#f9fafb" : "#1f2937" }}>
            {"<"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [isDarkMode, navigation]);


  const handleLetterPress = useCallback((letterData) => {
    if (gameOver) return;
    if (currentGuess.length < deobfuscateWord(secretWord).length && !letterData.used) {
      setCurrentGuess((prev) => [...prev, letterData]);
      setAvailableLetters((prev) => prev.map(l => 
          l.index === letterData.index ? { ...l, used: true } : l
      ));
    }
  }, [gameOver, currentGuess.length, secretWord]);


  const handleDeletePress = useCallback(() => {
    if (gameOver || currentGuess.length === 0) return;

    const lastLetter = currentGuess[currentGuess.length - 1];
    setCurrentGuess((prev) => prev.slice(0, -1));
    
    setAvailableLetters((prev) => prev.map(l => 
        l.index === lastLetter.index ? { ...l, used: false } : l
    ));

  }, [gameOver, currentGuess.length]);

  // ✅ ОНОВЛЕНО: Логіка перевірки слова з затримкою при програші
  const handleCheckPress = useCallback(() => {
    if (gameOver) return;
    if (currentGuess.length !== deobfuscateWord(secretWord).length) {
      setMessage("Використайте всі букви!");
      setMessageType("error");
      return;
    }

    const guessedWord = currentGuess.map(l => l.letter).join('').toLocaleLowerCase("uk").trim();
    const actualSecretWord = deobfuscateWord(secretWord);
    const normalizedSecret = actualSecretWord.toLocaleLowerCase("uk").trim();

    if (guessedWord === normalizedSecret) {
      // ПЕРЕМОГА
      setGameOver(true);
      updateStats(ANAGRAM_REWARD, true); 
      setMessage(`🎉 ВІТАЮ! Слово "${actualSecretWord.toUpperCase()}" вгадано! (+${ANAGRAM_REWARD} монет)`);
      setMessageType("success");
      runVictoryAnimation(); 

    } else {
      // ПРОГРАШ
      setGameOver(true); // Блокуємо введення
      setMessageType("error");
      updateStats(0, false); 
      
      // Показуємо слово та повідомлення про запуск нової гри
      setMessage(`❌ НЕПРАВИЛЬНО! Слово було: "${actualSecretWord.toUpperCase()}". Нова гра розпочнеться через 3 секунди.`);
      
      // Запускаємо нову гру з затримкою
      setTimeout(() => {
          initializeGame();
      }, 3000); 
    }
  }, [gameOver, currentGuess, secretWord, updateStats, initializeGame, runVictoryAnimation]);
  
  
  const scrollStyle =
    Platform.OS === "web"
      ? { flex: 1, overflow: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }
      : { flex: 1 };
  
  const animatedMessageStyle = {
      transform: [
          {
              scale: confettiAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.15, 1],
              }),
          },
      ],
  };

  const animatedConfettiBackground = {
      backgroundColor: confettiAnimation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['rgba(0,0,0,0)', 'rgba(255,215,0,0.2)', 'rgba(0,0,0,0)'], // Золотий фон
      }),
  };

  return (
    <View style={dynamicStyles.outer}>
      {/* Контейнер для анімації "кульок" (фон) */}
      {messageType === 'success' && (
          <Animated.View style={[AnagramStyles.confettiContainer, animatedConfettiBackground]} />
      )}
      <ScrollView 
        contentContainerStyle={dynamicStyles.rightPane}
        style={scrollStyle}
      >
        <View style={dynamicStyles.card}>
          <Text style={themedStyles.header}>Анаграма</Text>
          <Text style={[themedStyles.subHeader, {marginTop: 10}]}>
            Складіть правильне слово з {deobfuscateWord(secretWord).length} букв.
          </Text>
          <Text style={themedStyles.subHeader}>
            Монети: {stats.coins} | Ігор: {stats.anagramGamesPlayed} | Перемог: {stats.anagramWins} | Поразок: {stats.anagramLosses} 
          </Text>

          {/* Відображення поточної спроби */}
          <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20 }}>
            {Array.from({ length: deobfuscateWord(secretWord).length || 0 }).map((_, i) => (
              <View 
                key={i} 
                style={[
                    AnagramStyles.guessTile, 
                    currentGuess[i] && AnagramStyles.guessTileFilled, 
                    gameOver && messageType === 'success' && staticStyles.tileGreen 
                ]}
              >
                <Text style={AnagramStyles.text}>
                  {currentGuess[i] ? currentGuess[i].letter.toUpperCase() : ''}
                </Text>
              </View>
            ))}
          </View>

          {/* Повідомлення */}
          <Animated.Text
            style={[
                staticStyles.message,
                messageType === "success"
                  ? { color: "#166534" }
                  : messageType === "error"
                  ? { color: "#9f1239" }
                  : themedStyles.messageText,
                messageType === "success" && animatedMessageStyle, 
            ]}
          >
            {message}
          </Animated.Text>
          
          {/* Доступні букви для складання */}
          <Text style={{...themedStyles.settingText, marginTop: 20}}>
            Доступні букви:
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 10 }}>
            {availableLetters.map((l) => (
              <TouchableOpacity
                key={l.index}
                style={[
                    AnagramStyles.letterTile,
                    l.used ? AnagramStyles.letterButtonUsed : AnagramStyles.letterButtonAvailable
                ]}
                onPress={() => handleLetterPress(l)}
                disabled={l.used || gameOver}
              >
                <Text style={AnagramStyles.text}>{l.letter.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Кнопки дій */}
          <View style={[staticStyles.controls, {marginTop: 30}]}>
            <TouchableOpacity 
                style={staticStyles.btnDanger} 
                onPress={handleDeletePress}
                disabled={gameOver}
            >
              <Text style={staticStyles.btnText}>Видалити</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={staticStyles.btn} 
                onPress={handleCheckPress}
                disabled={gameOver || currentGuess.length !== deobfuscateWord(secretWord).length} 
            >
              <Text style={staticStyles.btnText}>Перевірити</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={staticStyles.btn} 
                onPress={initializeGame}
            >
              <Text style={staticStyles.btnText}>Нове слово</Text>
            </TouchableOpacity>

          </View>
          
          <TouchableOpacity 
              style={[staticStyles.btn, { marginTop: 20, backgroundColor: themedStyles.leftBtn.backgroundColor }]} 
              onPress={() => navigation.goBack()}
          >
              <Text style={staticStyles.btnText}>Назад до Кобзи</Text>
          </TouchableOpacity>


        </View>
      </ScrollView>
    </View>
  );
};

export default AnagramGameScreen;