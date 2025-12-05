import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const StatsScreen = ({ route, navigation }) => {
  const { stats } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Статистика</Text>
      
      {/* Статистика основної гри */}
      <Text style={styles.subtitle}>Кобза</Text>
      <Text>Монети: {stats.coins}</Text>
      <Text>Перемоги: {stats.wins}</Text>
      <Text>Поразки: {stats.losses}</Text>

      {/* Статистика Анаграми */}
      <Text style={styles.subtitle}>Анаграма</Text>
      <Text>Зіграно ігор: {stats.anagramGamesPlayed || 0}</Text>
      <Text>Перемоги: {stats.anagramWins || 0}</Text>
      <Text>Поразки: {stats.anagramLosses || 0}</Text>

      <Button title="Назад" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  // ✅ НОВИЙ СТИЛЬ
  subtitle: { fontSize: 20, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
});

export default StatsScreen;