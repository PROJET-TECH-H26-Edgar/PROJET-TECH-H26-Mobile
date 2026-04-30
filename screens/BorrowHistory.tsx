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

interface Borrow {
  idHBorrow: number;
  keyName: string;
  userName: string;
  borrowTime: string;
  returnTime: string;
}

export default function BorrowHistory() {
  const { getItem } = useStorage("auth_token");
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getItem();
        if (!token) return;

        const response = await fetch(`${BASE_URL}/borrows`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data: Borrow[] = await response.json();
        setBorrows(data);
      } catch (error) {
        console.log("FETCH ERROR:", error);
        Alert.alert("Erreur", "Impossible de récupérer les emprunts");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("fr-CA")} ${d.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" })}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.colId]}>#</Text>
        <Text style={[styles.headerCell, styles.colKey]}>Clé</Text>
        <Text style={[styles.headerCell, styles.colUser]}>Utilisateur</Text>
        <Text style={[styles.headerCell, styles.colDate]}>Emprunt</Text>
        <Text style={[styles.headerCell, styles.colDate]}>Retour</Text>
      </View>

      <FlatList
        data={borrows}
        keyExtractor={(item) => String(item.idHBorrow)}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
            <Text style={[styles.cell, styles.colId]}>{item.idHBorrow}</Text>
            <Text style={[styles.cell, styles.colKey]}>{item.keyName}</Text>
            <Text style={[styles.cell, styles.colUser]}>{item.userName}</Text>
            <Text style={[styles.cell, styles.colDate]}>{formatDate(item.borrowTime)}</Text>
            <Text style={[styles.cell, styles.colDate]}>{formatDate(item.returnTime)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Aucun emprunt disponible</Text>
        }
      />
    </View>
  );
}
//style du tableau par l'ia
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#fff", paddingTop: 50, paddingHorizontal: 16 },
  centered:    { flex: 1, justifyContent: "center", alignItems: "center" },
  tableHeader: { flexDirection: "row", backgroundColor: "#333", borderRadius: 6, paddingVertical: 10, paddingHorizontal: 8, marginBottom: 4 },
  headerCell:  { color: "#fff", fontWeight: "700", fontSize: 13 },
  row:         { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8, backgroundColor: "#fff" },
  rowEven:     { backgroundColor: "#f9f9f9" },
  cell:        { fontSize: 12, color: "#333" },
  separator:   { height: 1, backgroundColor: "#eee" },
  colId:       { width: 28 },
  colKey:      { width: 60 },
  colUser:     { flex: 1 },
  colDate:     { width: 80 },
  empty:       { textAlign: "center", color: "#999", marginTop: 40, fontSize: 15 },
});