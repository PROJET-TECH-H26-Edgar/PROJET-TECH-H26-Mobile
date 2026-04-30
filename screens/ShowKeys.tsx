import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import useStorage from "../composables/useLocalStorage";

const URL = process.env.EXPO_PUBLIC_API_URL;

interface Key {
  idKey: number;
  name: string;
  status: "Libérer" | "Occupée" | "Indisponible" | "locked";
}

const STATUS_STYLE: Record<Key["status"], { label: string; color: string; bg: string }> = {
  "Libérer":      { label: "Libérer",      color: "#2e7d32", bg: "#e8f5e9" },
  "Occupée":      { label: "Occupée",      color: "#e07b00", bg: "#fff3e0" },
  "Indisponible": { label: "Indisponible", color: "#c62828", bg: "#ffebee" },
  "locked":       { label: "🔒",           color: "#999",    bg: "#f5f5f5" },
};

export default function ShowKeys() {
  const { getItem } = useStorage("auth_token");
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getItem();
        if (!token) return;

        const response = await fetch(`${BASE_URL}/key`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data: Key[] = await response.json();
        setKeys(data);
      } catch (error) {
        console.log("FETCH ERROR:", error);
        Alert.alert("Erreur", "Impossible de récupérer les clés");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête du tableau */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.colId]}>#</Text>
        <Text style={[styles.headerCell, styles.colName]}>Nom</Text>
        <Text style={[styles.headerCell, styles.colStatus]}>Statut</Text>
      </View>

      {/* Lignes */}
      <FlatList
        data={keys}
        keyExtractor={(item) => String(item.idKey)}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => {
          const s = STATUS_STYLE[item.status];
          return (
            <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
              <Text style={[styles.cell, styles.colId]}>{item.idKey}</Text>
              <Text style={[styles.cell, styles.colName]}>{item.name}</Text>
              <View style={[styles.colStatus, styles.badgeWrapper]}>
                <View style={[styles.badge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.badgeText, { color: s.color }]}>
                    {s.label}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucune clé disponible</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tableau
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  headerCell: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  rowEven: {
    backgroundColor: "#f9f9f9",
  },
  cell: {
    fontSize: 14,
    color: "#333",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
  },

  // Colonnes
  colId: {
    width: 36,
  },
  colName: {
    flex: 1,
  },
  colStatus: {
    width: 110,
  },

  // Badge statut
  badgeWrapper: {
    alignItems: "flex-start",
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
    fontSize: 15,
  },
});