// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { register, login, sendPasswordReset } from "../services/auth";
import Toast from "react-native-toast-message";
import Svg, { Path } from "react-native-svg"; 

const validatePassword = (pwd) => {
  if (pwd.length < 6) return "Пароль ≥ 6 символів";
  if (!/\d/.test(pwd)) return "Додайте хоча б 1 цифру";
  if (!/[a-zA-Z]/.test(pwd)) return "Додайте хоча б 1 букву";
  return null;
};

const EyeIcon = ({ visible, onPress }) => (
  <TouchableOpacity onPress={onPress} style={s.eyeIcon}>
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke="#0ea5e9"
        strokeWidth="2"
      />
      {!visible && (
        <Path
          d="M3 3l18 18"
          stroke="#0ea5e9"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </Svg>
  </TouchableOpacity>
);

const PasswordField = ({ value, onChange, visible, toggle, placeholder }) => (
  <View style={s.field}>
    <TextInput
      style={s.passwordInput}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoComplete="password"
      placeholderTextColor="#aaa"
    />
    <EyeIcon visible={visible} onPress={toggle} />
  </View>
);

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReg, setIsReg] = useState(false);

  const toast = (msg, isError = true) =>
    Toast.show({
      type: isError ? "error" : "success",
      text2: msg,
      position: "top",
      visibilityTime: 2500,
      topOffset: 60,
    });

  const showSuccess = () => {
    toast("Вітаємо! Реєстрація успішна", false);
    setTimeout(() => navigation.replace("GameScreen"), 800);
  };

  const goToGame = () => navigation.replace("GameScreen");

  const auth = async () => {
    if (isReg) {
      try {
        if (!email.trim()) return toast("Введіть email");
        if (!pass) return toast("Введіть пароль");
        if (!confirm) return toast("Повторіть пароль");
        if (pass !== confirm) return toast("Паролі не збігаються");

        const passError = validatePassword(pass);
        if (passError) return toast(passError);

        await register(email.trim(), pass);
        showSuccess();
      } catch (e) {
        const code = e?.code || "";
        if (code === "auth/email-already-in-use") toast("Ця пошта вже зареєстрована");
        else if (code === "auth/invalid-email") toast("Неправильний email");
        else if (code === "auth/network-request-failed") toast("Немає інтернету");
        else if (code === "auth/weak-password") toast("Пароль занадто слабкий");
        else toast("Сталася помилка");
      }
      return;
    }

    try {
      if (!email.trim() || !pass) return toast("Заповніть поля");
      await login(email.trim(), pass);
      goToGame();
    } catch (e) {
      const code = e?.code || "";
      if (code === "auth/invalid-credential") toast("Неправильний email або пароль");
      else if (code === "auth/user-not-found") toast("Користувача не знайдено");
      else if (code === "auth/network-request-failed") toast("Немає інтернету");
      else toast("Сталася помилка");
    }
  };

  const reset = async () => {
    if (!email.trim()) return toast("Введіть email");
    try {
      await sendPasswordReset(email.trim());
      toast(`Посилання надіслано на ${email.trim()}`, false);
    } catch (e) {
      const code = e?.code || "";
      if (code === "auth/invalid-email") toast("Неправильний email");
      else if (code === "auth/user-not-found") toast(`Посилання надіслано на ${email.trim()}`, false);
      else toast("Не вдалося надіслати");
    }
  };

  const toggleMode = () => {
    setIsReg(!isReg);
    setEmail("");
    setPass("");
    setConfirm("");
    setShowPass(false);
    setShowConfirm(false);
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Кобза Гра</Text>
      <Text style={s.subtitle}>{isReg ? "Реєстрація" : "Вхід"}</Text>

      <TextInput
        style={s.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholderTextColor="#aaa"
      />

      <PasswordField
        value={pass}
        onChange={setPass}
        visible={showPass}
        toggle={() => setShowPass(!showPass)}
        placeholder="Пароль"
      />

      {isReg && (
        <PasswordField
          value={confirm}
          onChange={setConfirm}
          visible={showConfirm}
          toggle={() => setShowConfirm(!showConfirm)}
          placeholder="Повторіть пароль"
        />
      )}

      {!isReg && (
        <TouchableOpacity onPress={reset} style={s.forgotBtn}>
          <Text style={s.forgotText}>Забули пароль?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={s.btn} onPress={auth}>
        <Text style={s.btnText}>{isReg ? "Зареєструватися" : "Увійти"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.outline} onPress={toggleMode}>
        <Text style={s.outlineText}>
          {isReg ? "Увійти" : "Немає акаунта? Зареєструватися"}
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

// === СТИЛІ ===
const s = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 22,
    color: "#0ea5e9",
    marginBottom: 28,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    fontSize: 16,
    elevation: 2,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    elevation: 2,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    paddingRight: 60,
    fontSize: 16,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    padding: 10,
  },
  forgotBtn: { marginBottom: 18 },
  forgotText: {
    color: "#0ea5e9",
    fontSize: 15,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  btn: {
    backgroundColor: "#0ea5e9",
    width: "90%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 17,
  },
  outline: {
    borderWidth: 2.5,
    borderColor: "#0ea5e9",
    width: "90%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  outlineText: {
    color: "#0ea5e9",
    fontWeight: "700",
    fontSize: 16,
  },
});