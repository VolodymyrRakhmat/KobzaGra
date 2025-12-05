// GameScreenStyles.js
import { StyleSheet } from "react-native";

/* ----------------------------------------------------------------------
   1. Динамічні стилі (залежать від ширини екрану)
   ---------------------------------------------------------------------- */
export const createStyles = (width, isDesktop, isDarkMode) => {
  const safeAreaPadding = width > 380 ? 10 : 5;
  const tileMargin = isDesktop ? 4 : Math.floor(width * 0.01);
  const tileSize = isDesktop
    ? 56
    : Math.floor((width * 0.9 - 10 * tileMargin) / 5);
  const keyMargin = isDesktop ? 4 : Math.max(2, Math.floor(width * 0.008));

  const keyWidth = isDesktop
    ? 46
    : Math.floor(
        (width - safeAreaPadding * 2 - 26 * keyMargin) / 12
      );
  const keyHeight = isDesktop
    ? Math.round(keyWidth * 1.1)
    : Math.round(keyWidth * 1.4);

  const themeColors = isDarkMode
    ? {
        bgOuter: "#121212",
        bgCard: "#1e1e1e",
        shadow: "#000000",
        border: "#333333",
      }
    : {
        bgOuter: "#eef6fb",
        bgCard: "#fbfeff",
        shadow: "#0b1324",
        border: "#eef6fb",
      };

  return StyleSheet.create({
    outer: {
      flex: 1,
      flexDirection: isDesktop ? "row" : "column",
      backgroundColor: themeColors.bgOuter,
    },
    rightPane: {
      flexGrow: 1,
      padding: isDesktop ? 24 : safeAreaPadding,
      alignItems: "center",
      justifyContent: "flex-start",
    },
    card: {
      width: "100%",
      maxWidth: 900,
      backgroundColor: themeColors.bgCard,
      borderRadius: 16,
      padding: isDesktop ? 22 : 12,
      alignItems: "center",
      shadowColor: themeColors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDarkMode ? 0.3 : 0.06,
      shadowRadius: 18,
      elevation: 8,
      borderWidth: 1,
      borderColor: themeColors.border,
    },
    tileRow: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: tileMargin * 2,
    },
    tile: {
      width: tileSize,
      height: tileSize,
      margin: tileMargin,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
    },
    key: {
      width: keyWidth, // Забезпечення мінімальної ширини
      height: keyHeight,
      margin: keyMargin,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDarkMode ? "#3e474f" : "#d1e0ef",
      flexGrow: 1,
      flexShrink: 1,
      minWidth: keyWidth - 4,
      paddingHorizontal: 2,
    },
    keyText: {
      fontSize: isDesktop
        ? 14
        : Math.min(Math.max(12, Math.floor(keyWidth / 2)), 16),
      fontWeight: "700",
      textAlign: "center",
    },
    actionKey: {
      backgroundColor: "#374151",
      height: keyHeight,
      borderRadius: 8,
      marginHorizontal: keyMargin,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 12,
      flex: 1, 
    },
  });
};

/* ----------------------------------------------------------------------
   2. Тематичні стилі (залежать від dark / light)
   ---------------------------------------------------------------------- */
export const getThemedStyles = (isDarkMode) => {
  return StyleSheet.create({
    leftPane: {
      width: 260,
      padding: 16,
      justifyContent: "center",
      alignItems: "center",
      borderRightWidth: 1,
      borderRightColor: isDarkMode ? "#333333" : "#e6eef6",
      backgroundColor: isDarkMode ? "#121212" : "#ffffff",
    },
    welcomeText: {
      fontSize: 14,
      color: isDarkMode ? "#e0e0e0" : "#0f172a",
      marginBottom: 10,
      textAlign: "center",
    },
    leftBtnTextThemed: { color: "#fff", fontWeight: "700" },
    header: {
      fontSize: 28,
      fontWeight: "900",
      marginBottom: 6,
      color: isDarkMode ? "#ffffff" : "#082032",
    },
    subHeader: {
      fontSize: 16, 
      color: isDarkMode ? "#a0a0a0" : "#475569",
      textAlign: "center",
      marginVertical: 4,
    },
    hintText: {
      fontSize: 14,
      color: isDarkMode ? "#cccccc" : "#0f172a",
      marginTop: 5,
      marginBottom: 10,
      fontWeight: "500",
      textAlign: "center",
    },
    tileText: {
      color: isDarkMode ? "#fff" : "#0f172a",
      fontWeight: "800",
      fontSize: 20,
    },
    tileEmpty: {
      backgroundColor: isDarkMode ? "#252525" : "#ffffff",
      borderColor: isDarkMode ? "#444444" : "#d6e0eb",
    },
    tileCurrent: {
      backgroundColor: isDarkMode ? "#2e2e2e" : "#fff",
      borderColor: isDarkMode ? "#555555" : "#a0b0c0",
    },
    tileGray: {
      backgroundColor: isDarkMode ? "#5a5a5c" : "#b4b4b4", 
      borderColor: isDarkMode ? "#5a5a5c" : "#b4b4b4",
    },
    keyDefault: {
      backgroundColor: isDarkMode ? "#2d2d2d" : "#fff",
      borderColor: isDarkMode ? "#404040" : "#d1e0ef",
      borderWidth: 1,
    },
    keyTextDefault: {
      color: isDarkMode ? "#aaaaaa" : "#0f172a",
    },
    keyDark: {
      backgroundColor: isDarkMode ? "#6b7280" : "#6b7280", 
      borderColor: isDarkMode ? "#6b7280" : "#6b7280",
    },
    messageText: { color: isDarkMode ? "#9ca3af" : "#1e293b" },
    timerText: {
      fontSize: 16,
      fontWeight: "700",
      color: isDarkMode ? "#10b981" : "#047857",
      marginVertical: 8,
    },
    modalContent: { backgroundColor: isDarkMode ? "#2c2c2c" : "#ffffff" },
    settingsHeader: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 20,
      color: isDarkMode ? "#ffffff" : "#0f172a",
    },
    settingText: {
      fontSize: 16,
      color: isDarkMode ? "#e0e0e0" : "#0f172a",
    },
    leftBtn: { backgroundColor: isDarkMode ? "#1e40af" : "#0ea5e9" },

    levelButtonThemed: {
      backgroundColor: isDarkMode ? "#374151" : "#dbeafe",
      borderColor: isDarkMode ? "#4b5563" : "#93c5fd",
    },
    levelButtonTextThemed: {
      color: isDarkMode ? "#e5e7eb" : "#1e3a8a",
    },

    settingRowBorder: {
      borderBottomColor: isDarkMode ? "#444444" : "#ccc",
    },
  });
};

/* ----------------------------------------------------------------------
   3. Статичні стилі (не залежать від режиму)
   ---------------------------------------------------------------------- */
export const staticStyles = StyleSheet.create({
  leftBtn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  
  // ✅ ДОДАНО: Стилі для прихованого TextInput для виклику рідної клавіатури
  hiddenTextInput: {
    position: 'absolute', 
    top: -9999, 
    left: -9999, 
    height: 0, 
    width: 0, 
    opacity: 0,
  },

  headerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  
  // ✅ ОНОВЛЕНО: Стилі для кнопки "Скласти Слово" (зменшено розмір)
  anagramHeaderButton: {
    backgroundColor: '#f59e0b', 
    paddingVertical: 6, 
    paddingHorizontal: 8, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d97706',
  },
  anagramHeaderButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11, 
  },
  
  levelContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 6,
  },

  levelButtonStatic: {
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
  },
  levelButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#1e40af",
  },
  levelButtonTextStatic: {
    fontWeight: "600",
    fontSize: 12,
  },
  levelButtonSelectedText: { color: "#fff" },

  settingsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButtonText: { fontSize: 18, color: "#fff" },

  tileText: { fontWeight: "800", fontSize: 20 },
  tileGreen: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  // ✅ ОНОВЛЕНО: Світліший жовтий колір
  tileYellow: { backgroundColor: "#DDCF43", borderColor: "#DDCF43" }, 
  message: {
    marginTop: 6,
    minHeight: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  keyboard: { width: "100%", marginTop: 12, alignItems: "center" },
  kbRow: { width: "100%", flexDirection: "row", justifyContent: "center" },
  keyTextUsed: { color: "#fff", fontWeight: "700" },
  actionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
  },

  hintKey: {
    flex: 1.5,
    paddingHorizontal: 4,
  },
  enterKey: {
    flex: 1.2,
  },

  controls: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  btn: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnDanger: {
    backgroundColor: "#ef4444",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    maxWidth: 400,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
    paddingVertical: 5,
    // ✅ ВИПРАВЛЕНО: Тут лише встановлюємо товщину, а колір беремо з тематичних стилів
    borderBottomWidth: 1, 
  },
  
  // ✅ НОВЕ: Стиль для кнопки "Вийти" у модальному вікні
  logoutSettingButton: {
    marginTop: 15,
    marginBottom: 5,
    backgroundColor: '#dc2626', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutSettingButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: "#0ea5e9",
    padding: 10,
    borderRadius: 8,
  },
  modalCloseButtonText: { color: "#fff", fontWeight: "700" },

  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    pointerEvents: "none",
  },
});

export const styles = staticStyles;