import React, { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import useStorage from "../composables/useLocalStorage";

const URL = "https://distributeurcle.edwrdledgar.me/api";

interface Key {
  idKey: number;
  name: string;
  status: string;
}

export default function Return() {
  const navigation = useNavigation();
  const { getItem } = useStorage("auth_token");
  const [pendingKeys, setPendingKeys] = useState<Key[]>([]);

  const loadPending = useCallback(async () => {
    try {
      const token = await getItem();
      const response = await fetch(`${URL}/key`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPendingKeys(data.filter((k: Key) => k.status === "Indisponible"));
    } catch {
      Alert.alert("Erreur", "Impossible de charger les retours");
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, []);

  const handleComplete = async (idKey: number) => {
    try {
      const token = await getItem();
      const response = await fetch(`${URL}/borrows/${idKey}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        Alert.alert("Erreur", "Impossible de compléter le retour");
        return;
      }

      Alert.alert("Succès", "Clé replacée avec succès");
      loadPending();
    } catch {
      Alert.alert("Erreur", "Impossible de compléter le retour");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Retours en attente</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {pendingKeys.length === 0 ? (
          <Text style={styles.empty}>Aucun retour en attente</Text>
        ) : (
          pendingKeys.map((key) => (
            <View key={key.idKey} style={styles.card}>
              <Text style={styles.cardIcon}>🔑</Text>
              <Text style={styles.cardName}>{key.name}</Text>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={() => handleComplete(key.idKey)}
              >
                <Text style={styles.completeBtnText}>Compléter</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
  backBtn:         { padding: 6, backgroundColor: "#eee", borderRadius: 6 },
  backIcon:        { fontSize: 22, color: "#333", fontWeight: "bold" },
  headerTitle:     { fontSize: 23, fontWeight: "bold" },
  scroll:          { paddingHorizontal: 16, paddingBottom: 30 },
  empty:           { textAlign: "center", color: "#aaa", marginTop: 40, fontSize: 16 },
  card:            { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 14, marginBottom: 10, gap: 12 },
  cardIcon:        { fontSize: 20 },
  cardName:        { flex: 1, fontSize: 15, fontWeight: "500" },
  completeBtn:     { backgroundColor: "#4CAF50", borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  completeBtnText: { color: "#fff", fontWeight: "600" },
});