// GameScreen.js

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Platform,
  useWindowDimensions,
  Modal,
  Switch,
  Animated,
  TextInput, 
} from "react-native";

import { Audio } from 'expo-av';

import {
  logout,
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
  increment,
  onAuthStateChanged,
} from "../services/auth";

import GameRulesButton from "../screens/GameRulesButton";
import { words, words_easy, words_medium, words_hard } from "../services/words";

import {
  createStyles,
  getThemedStyles,
  styles,
} from "./GameScreenStyles";

// ----------------------------------------------------------------------
// 0. КОНТЕКСТ НАЛАШТУВАНЬ
// ----------------------------------------------------------------------
const SettingsContext = createContext();
const useSettings = () => useContext(SettingsContext);

const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(true); 
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        setTimeElapsed(Date.now() - timerStartTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerStartTime]);

  const startTimer = useCallback(() => {
    if (isTimerActive && !isTimerRunning) {
      setTimerStartTime(Date.now());
      setIsTimerRunning(true);
    }
  }, [isTimerActive, isTimerRunning]);

  const stopTimer = useCallback(() => setIsTimerRunning(false), []);
  const resetTimer = useCallback(() => {
    setTimeElapsed(0);
    setIsTimerRunning(false);
    setTimerStartTime(null);
  }, []);

  const toggleDarkMode = useCallback((v) => setIsDarkMode(v), []);
  const toggleTimerActive = useCallback(
    (v) => {
      setIsTimerActive(v);
      if (!v) resetTimer();
    },
    [resetTimer]
  );
  const toggleKeyboardVisible = useCallback((v) => setIsKeyboardVisible(v), []); 

  const formattedTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        isTimerActive,
        toggleTimerActive,
        timeElapsed,
        formattedTime: formattedTime(timeElapsed),
        formattedTimeUtil: formattedTime,
        startTimer,
        stopTimer,
        resetTimer,
        isTimerRunning,
        timerStartTime,
        isKeyboardVisible, 
        toggleKeyboardVisible, 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// ----------------------------------------------------------------------
// 1. КОНСТАНТИ ГРИ
// ----------------------------------------------------------------------
const COIN_REWARDS = { easy: 5, medium: 10, hard: 20, random: 15 };
const HINT_COST = 5;
const ANAGRAM_REWARD = 2; 


const selectWord = (level) => {
  let wordList;
  switch (level) {
    case "easy":
      wordList = words_easy;
      break;
    case "medium":
      wordList = words_medium;
      break;
      break;
    case "hard":
      wordList = words_hard;
      break;
    case "random":
      wordList = [...words_easy, ...words_medium, ...words_hard];
      break;
    default:
      wordList = words_easy;
  }
  const randomIndex = Math.floor(Math.random() * wordList.length);
  const selectedItem = wordList[randomIndex];
  const secretWord =
    typeof selectedItem === "object"
      ? selectedItem.word.toLocaleLowerCase("uk").trim()
      : selectedItem.toLocaleLowerCase("uk").trim();
  const potentialHint =
    typeof selectedItem === "object" ? selectedItem.hint : null;
  let finalHint = null;
  if ((level === "hard" || level === "random") && potentialHint) {
    finalHint = potentialHint;
  }
  return { secretWord, wordHint: finalHint, levelWords: wordList };
};

// ----------------------------------------------------------------------
// Хук для Звукових Ефектів (Виправлено помилку)
// ----------------------------------------------------------------------
const useSoundEffect = () => {
  const [winSound, setWinSound] = useState(null);
  const [failSound1, setFailSound1] = useState(null);
  const [failSound2, setFailSound2] = useState(null);
  
  const INTERRUPTION_MODE_IOS_DO_NOT_MIX = Audio.InterruptionModeIOS ? Audio.InterruptionModeIOS.DoNotMix : 2;
  const INTERRUPTION_MODE_ANDROID_DO_NOT_MIX = Audio.InterruptionModeAndroid ? Audio.InterruptionModeAndroid.DoNotMix : 2;


  useEffect(() => {
    const loadSound = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingSelection: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: INTERRUPTION_MODE_IOS_DO_NOT_MIX, 
          shouldDuckAndroid: true,
          interruptionModeAndroid: INTERRUPTION_MODE_ANDROID_DO_NOT_MIX, 
          playThroughEarpieceAndroid: false,
        });

        if (typeof Audio.Sound?.createAsync !== 'function') {
          console.error('Audio.Sound.createAsync API недоступний. Звукові ефекти вимкнено.');
          return;
        }

        const { sound: win } = await Audio.Sound.createAsync(
          require('./win_sound.mp3') 
        );
        setWinSound(win);

        const { sound: fail1 } = await Audio.Sound.createAsync(
          require('./classic-fail-wah-wah-wah-on-the-pipe.mp3')
        );
        setFailSound1(fail1);

        const { sound: fail2 } = await Audio.Sound.createAsync(
          require('./fail-on-the-pipe.mp3')
        );
        setFailSound2(fail2);

      } catch (error) {
        console.error('Error loading sound:', error);
      }
    };

    loadSound();

    return () => {
      if (winSound) winSound.unloadAsync();
      if (failSound1) failSound1.unloadAsync();
      if (failSound2) failSound2.unloadAsync();
    };
  }, []); 

  const playSound = useCallback(async (type) => {
    if (type === 'win' && winSound) {
      try {
        await winSound.replayAsync();
      } catch (e) {
        console.error('Error playing win sound:', e);
      }
    } else if (type === 'loss') {
      const soundToPlay = Math.random() < 0.5 ? failSound1 : failSound2;
      if (soundToPlay) {
        try {
          await soundToPlay.replayAsync();
        } catch (e) {
          console.error('Error playing loss sound:', e);
        }
      }
    }
  }, [winSound, failSound1, failSound2]);

  return { playSound };
};

// ----------------------------------------------------------------------
// 2. ГОЛОВНИЙ КОМПОНЕНТ
// ----------------------------------------------------------------------
const GameScreen = ({ navigation }) => {
  const {
    isDarkMode,
    toggleDarkMode,
    isTimerActive,
    toggleTimerActive,
    formattedTime,
    formattedTimeUtil,
    startTimer,
    stopTimer,
    resetTimer,
    isTimerRunning,
    timerStartTime,
    isKeyboardVisible, 
    toggleKeyboardVisible, 
  } = useSettings();

  const textInputRef = useRef(null);
  const isMobileOrTablet = Platform.OS !== 'web'; 

  // ПІДКЛЮЧЕННЯ ЗВУКОВОГО ХУКА 
  const { playSound } = useSoundEffect();

  const { width } = useWindowDimensions();
  const isDesktop = width > 800;

  const [selectedLevel, setSelectedLevel] = useState("easy");
  const [word, setWord] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [stats, setStats] = useState({ coins: 0, wins: 0, losses: 0, anagramWins: 0, anagramLosses: 0 });
  const [guesses, setGuesses] = useState([]);
  const secretWordRef = useRef("");
  const [gameOver, setGameOver] = useState(false);
  const [letterStates, setLetterStates] = useState({});
  const [wordHint, setWordHint] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintPositions, setHintPositions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const keyboardRows = useMemo(() => [
    ["й", "ц", "у", "к", "е", "н", "г", "ш", "щ", "з", "х"],
    ["ф", "і", "в", "а", "п", "р", "о", "л", "д", "ж", "є", "ї"],
    ["я", "ч", "с", "м", "и", "т", "ь", "б", "ю", "ґ"], 
  ], []);

  const dynamicStyles = createStyles(width, isDesktop, isDarkMode);
  const themedStyles = getThemedStyles(isDarkMode);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace("Login");
    } catch (err) {
      console.error(err);
    }
  };

  const updateStats = useCallback(
    async (coinChange, isWin = null) => {
      if (!auth.currentUser) return;
      try {
        const ref = doc(db, "players", auth.currentUser.uid);
        const payload = {
          coins: increment(coinChange),
          lastPlayed: serverTimestamp(),
        };
        if (isWin !== null) {
          payload.wins = increment(isWin ? 1 : 0);
          payload.losses = increment(!isWin ? 1 : 0);
        }
        await updateDoc(ref, payload);
        const snap = await getDoc(ref);
        if (snap.exists()) setStats(snap.data());
      } catch (err) {
        console.error("updateStats error:", err);
      }
    },
    []
  );

  const handleGoToStats = useCallback(async () => {
      const user = auth.currentUser;
      if (!user) {
          navigation.navigate("Stats", { stats: stats }); 
          return;
      }

      try {
          const ref = doc(db, "players", user.uid);
          const snap = await getDoc(ref);
          
          if (snap.exists()) {
              const currentStats = snap.data();
              navigation.navigate("Stats", { stats: currentStats }); 
          } else {
              navigation.navigate("Stats", { stats: stats }); 
          }

      } catch (err) {
          console.error("Помилка завантаження статистики перед навігацією:", err);
          navigation.navigate("Stats", { stats: stats }); 
      }
  }, [stats, navigation]); 
  
  const initializeGame = useCallback(
    (level) => {
      const { secretWord, wordHint: newWordHint } = selectWord(level);
      setGuesses([]);
      setMessage("Введіть своє перше слово!");
      setMessageType("info");
      setGameOver(false);
      setLetterStates({});
      setWord("");
      secretWordRef.current = secretWord;
      setWordHint(newWordHint);
      setHintsUsed(0);
      setHintPositions([]);
      resetTimer();
      setShowConfetti(false);
      
      if (isMobileOrTablet && !isKeyboardVisible) {
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }, 100); 
      }
    },
    [resetTimer, isMobileOrTablet, isKeyboardVisible]
  );

  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    confettiAnim.setValue(0);
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => setShowConfetti(false));
  }, [confettiAnim]);

  const getColorResult = (guess, secret) => {
    const result = Array(5).fill("gray");
    const secretLetters = secret.split("");
    const guessLetters = guess.split("");
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === secretLetters[i]) {
        result[i] = "green";
        secretLetters[i] = null;
      }
    }
    for (let i = 0; i < 5; i++) {
      if (result[i] === "green") continue;
      const idx = secretLetters.indexOf(guessLetters[i]);
      if (idx !== -1) {
        result[i] = "yellow";
        secretLetters[idx] = null;
      }
    }
    return result;
  };

  const updateLetterStates = (guess, colors) => {
    const colorPriority = (c) => (c === "green" ? 3 : c === "yellow" ? 2 : 1);
    setLetterStates((prev) => {
      const next = { ...prev };
      guess.split("").forEach((ch, i) => {
        const newColor = colors[i];
        if (!next[ch] || colorPriority(newColor) > colorPriority(next[ch])) {
          next[ch] = newColor;
        }
      });
      return next;
    });
  };

  const handleCheck = useCallback(() => {
    setWord((currentWord) => {
      if (gameOver) return currentWord;
      const currentSecretWord = secretWordRef.current;
      if (!currentSecretWord) return currentWord;

      if (isTimerActive && guesses.length === 0 && !isTimerRunning) {
        startTimer();
      }

      const normalizedWord = currentWord.toLocaleLowerCase("uk").trim();
      if (normalizedWord.length !== 5) {
        setMessage("Введіть 5 букв!");
        setMessageType("error");
        return currentWord;
      }

      const colors = getColorResult(normalizedWord, currentSecretWord);
      const newGuess = { word: normalizedWord.toUpperCase(), colors };

      setGuesses((prev) => {
        const updatedGuesses = [...prev, newGuess];
        updateLetterStates(normalizedWord, colors);

        if (normalizedWord === currentSecretWord) {
          stopTimer();

          const finalTimeMs = isTimerActive && timerStartTime
            ? Date.now() - timerStartTime
            : 0;
          const finalFormattedTime = formattedTimeUtil(finalTimeMs);
          const reward = COIN_REWARDS[selectedLevel];

          setMessage(
            `🎉 ВІТАЮ! 🎉 Ви вгадали слово! (+${reward} монет) ${
              isTimerActive ? `Час: ${finalFormattedTime}` : ""
            }`
          );
          setMessageType("success");
          updateStats(reward, true);
          setGameOver(true);
          triggerConfetti();
          playSound('win');
          
          if (isMobileOrTablet && !isKeyboardVisible && textInputRef.current) {
            textInputRef.current.blur();
          }

        } else if (updatedGuesses.length >= 6) {
          stopTimer();

          const finalTimeMs = isTimerActive && timerStartTime
            ? Date.now() - timerStartTime
            : 0;
          const finalFormattedTime = formattedTimeUtil(finalTimeMs);

          const lossReward = 0;

          setMessage(
            `Гра закінчилася! Слово було: ${currentSecretWord.toUpperCase()}. ${
              isTimerActive ? `Час: ${finalFormattedTime}` : ""
            }`
          );
          setMessageType("error");
          updateStats(lossReward, false);
          setGameOver(true);
          playSound('loss');
          
          if (isMobileOrTablet && !isKeyboardVisible && textInputRef.current) {
            textInputRef.current.blur();
          }
          
        } else {
          setMessage("Спробуйте ще!");
          setMessageType("info");
        }
        return updatedGuesses;
      });

      return "";
    });
  }, [
    gameOver,
    selectedLevel,
    updateStats,
    isTimerActive,
    startTimer,
    stopTimer,
    guesses.length,
    formattedTimeUtil,
    timerStartTime,
    isTimerRunning,
    triggerConfetti,
    playSound, 
    isMobileOrTablet, 
    isKeyboardVisible,
  ]);

  const provideHint = useCallback(async () => {
    if (gameOver) return;
    if (hintsUsed >= 5) {
      setMessage("Ви використали максимальну кількість підказок (5).");
      setMessageType("error");
      return;
    }
    if (stats.coins < HINT_COST) {
      setMessage(`Недостатньо монет (потрібно ${HINT_COST})`);
      setMessageType("error");
      return;
    }

    const currentSecretWord = secretWordRef.current;
    const secretLetters = currentSecretWord.split("");
    let availableIndices = [];

    for (let i = 0; i < secretLetters.length; i++) {
      const isGreen = guesses.some((g) => g.colors[i] === "green");
      const isHinted = hintPositions.includes(i);
      if (!isGreen && !isHinted) availableIndices.push(i);
    }

    if (availableIndices.length === 0) {
      setMessage("Усі позиції вже розкриті!");
      setMessageType("info");
      return;
    }

    await updateStats(-HINT_COST, null);
    const randomIndex =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const hintLetter = secretLetters[randomIndex];

    setLetterStates((prev) => {
      if (prev[hintLetter] !== "green") {
        return { ...prev, [hintLetter]: "green" };
      }
      return prev;
    });

    setHintPositions((prev) => [...prev, randomIndex]);
    setHintsUsed((prev) => prev + 1);

    const remaining = 5 - (hintsUsed + 1);
    setMessage(
      `Підказка: "${hintLetter.toUpperCase()}" на позиції №${
        randomIndex + 1
      }. (-${HINT_COST} монет). Залишилось: ${remaining}`
    );
    setMessageType("info");
  }, [
    gameOver,
    hintsUsed,
    stats.coins,
    updateStats,
    guesses,
    hintPositions,
  ]);

  const onKeyPress = useCallback(
    (ch) => {
      if (gameOver) return;
      
      if (ch === "ENTER") return handleCheck();
      if (ch === "DEL") return setWord((w) => w.slice(0, -1));
      if (ch === "HINT") return provideHint();

      setWord((prev) => {
        if (prev.length < 5) return (prev + ch).toLocaleLowerCase("uk");
        return prev;
      });
    },
    [gameOver, handleCheck, provideHint]
  );
  
  const handleNativeInputChange = (text) => {
    if (gameOver) return;
    const normalizedText = text.toLocaleLowerCase('uk').trim();
    
    const filteredText = normalizedText
        .split('')
        .filter(ch => keyboardRows.flat().includes(ch))
        .slice(0, 5)
        .join('');
        
    setWord(filteredText);
  };
  
  const handleNativeInputSubmit = () => {
      if (word.length === 5) {
          handleCheck();
      }
  };


  useEffect(() => {
    initializeGame(selectedLevel);
    const fetchStats = async (user) => {
      if (!user) {
        setStats({ coins: 0, wins: 0, losses: 0, anagramWins: 0, anagramLosses: 0 });
        return;
      }
      try {
        const ref = doc(db, "players", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setStats({
            coins: Number(data.coins) || 0,
            wins: Number(data.wins) || 0,
            losses: Number(data.losses) || 0,
            anagramWins: Number(data.anagramWins) || 0,
            anagramLosses: Number(data.anagramLosses) || 0,
          });
        } else {
          const initial = { email: user.email, coins: 50, wins: 0, losses: 0, anagramWins: 0, anagramLosses: 0, createdAt: serverTimestamp() };
          await setDoc(ref, initial);
          setStats(initial);
        }
      } catch (err) {
        console.error("Firestore error:", err);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, fetchStats);
    return () => unsubscribe();
  }, [initializeGame, selectedLevel]);

  useEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: isDarkMode ? "#1f2937" : "#f8fafc" },
      headerTintColor: isDarkMode ? "#f9fafb" : "#1f2937",
      headerTitleStyle: { fontWeight: "bold" },
    });
  }, [isDarkMode, navigation]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (key === "enter") onKeyPress("ENTER");
      else if (key === "backspace") onKeyPress("DEL");
      else if (keyboardRows.flat().includes(key)) onKeyPress(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress, keyboardRows]);

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    initializeGame(level);
  };

  const startNewGame = () => initializeGame(selectedLevel);

  // Компонент для "салюту"
  const Confetti = () => {
    const particles = Array.from({ length: 150 });
    const colors = ["#ff0054", "#ffbd00", "#00ff7f", "#00baff", "#a200ff", "#ffffff", "#cccccc"];
    const ConfettiParticle = ({ index }) => {
      const startX = Math.random() * width;
      const startY = -50;
      const size = 10 + Math.random() * 10;
      const rotate = Math.random() * 360;

      const translateX = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, (Math.random() - 0.5) * 800],
      });

      const translateY = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1000 + Math.random() * 500],
      });

      const opacity = confettiAnim.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: [1, 1, 0],
      });

      const rotation = confettiAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [`${rotate}deg`, `${rotate + 1080}deg`],
      });

      return (
        <Animated.View
          style={{
            position: "absolute",
            top: startY,
            left: startX,
            width: size,
            height: size,
            backgroundColor: colors[index % colors.length],
            opacity,
            transform: [{ translateY }, { translateX }, { rotate: rotation }],
            borderRadius: size / 2,
            zIndex: 100,
          }}
        />
      );
    };

    return (
      <View style={styles.confettiContainer}>
        {particles.map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </View>
    );
  };
  
  const handleGuessAreaPress = () => {
    if (isMobileOrTablet && !isKeyboardVisible && textInputRef.current) {
        textInputRef.current.focus();
    }
  };


  const renderTile = ({ item }) => (
    <View style={dynamicStyles.tileRow}>
      {item.word.split("").map((letter, i) => (
        <View
          key={i}
          style={[
            dynamicStyles.tile,
            item.colors[i] === "green"
              ? styles.tileGreen
              : item.colors[i] === "yellow"
              ? styles.tileYellow
              : themedStyles.tileGray,
          ]}
        >
          <Text style={[styles.tileText, { color: themedStyles.tileText.color }]}>
            {letter}
          </Text>
        </View>
      ))}
    </View>
  );

  const LevelButton = ({ levelKey, title }) => (
    <TouchableOpacity
      style={[
        styles.levelButtonStatic,
        themedStyles.levelButtonThemed,
        selectedLevel === levelKey && styles.levelButtonSelected,
      ]}
      onPress={() => handleLevelChange(levelKey)}
    >
      <Text
        style={[
          styles.levelButtonTextStatic,
          themedStyles.levelButtonTextThemed,
          selectedLevel === levelKey && styles.levelButtonSelectedText,
        ]}
      >
        {title} {levelKey !== "random" && `(+${COIN_REWARDS[levelKey]})`}
      </Text>
    </TouchableOpacity>
  );

  const scrollStyle =
    Platform.OS === "web"
      ? { flex: 1, overflow: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }
      : { flex: 1 };

  return (
    <View style={dynamicStyles.outer}>
      <SettingsModal
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        isTimerActive={isTimerActive}
        toggleTimerActive={toggleTimerActive}
        isKeyboardVisible={isKeyboardVisible} 
        toggleKeyboardVisible={toggleKeyboardVisible} 
        isMobileOrTablet={isMobileOrTablet} 
        handleLogout={handleLogout} 
        themedStyles={themedStyles}
      />

      {showConfetti && <Confetti />}

      {isDesktop && (
        <View style={themedStyles.leftPane}>
          <Text style={themedStyles.welcomeText}>
            {auth.currentUser ? `Вітаю, ${auth.currentUser.email}` : "Гість"}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={dynamicStyles.rightPane}
        keyboardShouldPersistTaps="handled"
        style={scrollStyle}
      >
        <View style={dynamicStyles.card}>
          <Text style={themedStyles.header}>Кобза Гра</Text>

          <View style={styles.headerControls}>
            
            <GameRulesButton />
            <TouchableOpacity
              style={styles.anagramHeaderButton}
              onPress={() => navigation.navigate("AnagramGame")}
            >
              <Text style={styles.anagramHeaderButtonText}>Анаграма (+{ANAGRAM_REWARD})</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.settingsButton,
                { backgroundColor: themedStyles.leftBtn.backgroundColor, marginLeft: 8 },
              ]}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <Text style={themedStyles.subHeader}>
            Монети: {stats.coins} | Перемоги: {stats.wins} | Поразки: {stats.losses}
          </Text>

          {isTimerActive && (
            <Text style={themedStyles.timerText}>Час: {formattedTime}</Text>
          )}

          <View style={styles.levelContainer}>
            <LevelButton levelKey="easy" title="Легкий" />
            <LevelButton levelKey="medium" title="Середній" />
            <LevelButton levelKey="hard" title="Складний" />
            <LevelButton levelKey="random" title="Рандом" />
          </View>

          {wordHint && typeof wordHint === "string" && (
            <Text style={themedStyles.hintText}>
              Підказка (Інформаційна): **{wordHint}**
            </Text>
          )}

          <View style={{ width: "100%", alignItems: "center", marginTop: 10 }}>
            <FlatList
              data={guesses}
              renderItem={renderTile}
              keyExtractor={(_, idx) => idx.toString()}
              style={{ width: "100%" }}
              contentContainerStyle={{ alignItems: "center" }}
            />
            
            {isMobileOrTablet && (
                <TextInput
                    ref={textInputRef}
                    style={styles.hiddenTextInput}
                    value={word}
                    onChangeText={handleNativeInputChange}
                    keyboardType="default"
                    maxLength={5}
                    multiline={false} 
                    autoFocus={false} 
                    onSubmitEditing={handleNativeInputSubmit}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                />
            )}

            {!gameOver && (
                <TouchableOpacity 
                    style={{ width: '100%', alignItems: 'center' }} 
                    onPress={handleGuessAreaPress} 
                    // Відключаємо натискання, якщо використовується екранна клавіатура
                    disabled={isKeyboardVisible} 
                >
                  <View style={dynamicStyles.tileRow}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          dynamicStyles.tile,
                          word[i] ? themedStyles.tileCurrent : themedStyles.tileEmpty,
                        ]}
                      >
                        <Text
                          style={[styles.tileText, { color: themedStyles.tileText.color }]}
                        >
                          {word[i] ? word[i].toUpperCase() : ""}
                        </Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
            )}


            <Text
              style={[
                styles.message,
                messageType === "success"
                  ? { color: "#166534" }
                  : messageType === "error"
                  ? { color: "#9f1239" }
                  : themedStyles.messageText,
              ]}
            >
              {message}
            </Text>

            {gameOver && messageType === "error" && (
              <Text
                style={[
                  themedStyles.hintText,
                  { marginTop: 10, color: themedStyles.settingsHeader.color },
                ]}
              >
                Слово було: {secretWordRef.current.toUpperCase()}
              </Text>
            )}
          </View>
          
          {isKeyboardVisible && (
            <View style={styles.keyboard}>
              {keyboardRows.map((row, rIdx) => (
                <View key={rIdx} style={styles.kbRow}>
                  {row.map((ch) => {
                    const st = letterStates[ch];
                    const bgStyle =
                      st === "green"
                        ? styles.tileGreen
                        : st === "yellow"
                        ? styles.tileYellow
                        : st
                        ? themedStyles.keyDark
                        : themedStyles.keyDefault;
                    return (
                      <TouchableOpacity
                        key={ch}
                        style={[dynamicStyles.key, bgStyle]}
                        onPress={() => onKeyPress(ch)}
                        disabled={gameOver} 
                      >
                        <Text
                          style={[
                            dynamicStyles.keyText,
                            st ? styles.keyTextUsed : themedStyles.keyTextDefault,
                          ]}
                        >
                          {ch.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              <View style={[styles.kbRow, { justifyContent: "center", marginTop: 12 }]}>
                <TouchableOpacity style={[dynamicStyles.actionKey]} onPress={() => onKeyPress("DEL")} disabled={gameOver}>
                  <Text style={styles.actionText}>DEL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.actionKey, styles.hintKey]}
                  onPress={() => onKeyPress("HINT")}
                  disabled={gameOver}
                >
                  <Text style={styles.actionText}>ПІДКАЗКА (-{HINT_COST})</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[dynamicStyles.actionKey, styles.enterKey]}
                  onPress={() => onKeyPress("ENTER")}
                  disabled={gameOver}
                >
                  <Text style={styles.actionText}>ENTER</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.controls}>
            <TouchableOpacity style={styles.btn} onPress={startNewGame}>
              <Text style={styles.btnText}>Нова гра</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={handleGoToStats} 
            >
              <Text style={styles.btnText}>Статистика</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const SettingsModal = ({
  isVisible,
  onClose,
  isDarkMode,
  toggleDarkMode,
  isTimerActive,
  toggleTimerActive,
  isKeyboardVisible, 
  toggleKeyboardVisible,
  isMobileOrTablet, 
  handleLogout,
  themedStyles,
}) => { 
  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, themedStyles.modalContent]}>
          <Text style={themedStyles.settingsHeader}>Налаштування</Text>

          <View style={[styles.settingRow, themedStyles.settingRowBorder]}>
            <Text style={themedStyles.settingText}>Темний режим</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDarkMode ? "#2563eb" : "#f4f3f4"}
              onValueChange={toggleDarkMode}
              value={isDarkMode}
            />
          </View>

          <View style={[styles.settingRow, themedStyles.settingRowBorder]}>
            <Text style={themedStyles.settingText}>Секундомір</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isTimerActive ? "#2563eb" : "#f4f3f4"}
              onValueChange={toggleTimerActive}
              value={isTimerActive}
            />
          </View>
          
          {isMobileOrTablet && (
            <View style={[styles.settingRow, themedStyles.settingRowBorder]}>
              <Text style={themedStyles.settingText}>Екранна клавіатура</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isKeyboardVisible ? "#2563eb" : "#f4f3f4"}
                onValueChange={toggleKeyboardVisible}
                value={isKeyboardVisible}
              />
            </View>
          )}
          {/* --------------------------------- */}
          
          {auth.currentUser && (
              <TouchableOpacity 
                  style={styles.logoutSettingButton} 
                  onPress={() => { onClose(); handleLogout(); }}
              >
                  <Text style={styles.logoutSettingButtonText}>Вийти з облікового запису</Text>
              </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Закрити</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}; 

export { useSettings, SettingsProvider };
export default GameScreen;