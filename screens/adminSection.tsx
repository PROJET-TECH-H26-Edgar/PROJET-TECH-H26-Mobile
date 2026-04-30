import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Admin() {
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel Admin</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.sectionTitle}>Gestion des clés</Text>
        <TouchableOpacity style={styles.card}
        onPress={() => navigation.navigate("ShowKeys")}>
          <Text style={styles.cardIcon}>🔑</Text>
          <Text style={styles.cardText}>Voir toutes les clés</Text>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card}
           onPress={() => navigation.navigate("AddKeys")}>
          <Text style={styles.cardIcon}>➕</Text>
          <Text style={styles.cardText}>Ajouter une clé</Text>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Retours</Text>
        <TouchableOpacity style={styles.card}
          onPress={() => navigation.navigate("Return")}>
          <Text style={styles.cardIcon}>🔄</Text>
          <Text style={styles.cardText}>Retours en attente</Text>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Historique</Text>
        <TouchableOpacity style={styles.card}
        onPress={() => navigation.navigate("BorrowHistory")}>
          <Text style={styles.cardIcon}>H</Text>
          <Text style={styles.cardText}>Voir les emprunts</Text>
          <Text style={styles.cardArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    padding: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  backIcon: {
    fontSize: 22,
    color: "#333",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "bold",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    gap: 12,
  },
  cardIcon: {
    fontSize: 20,
  },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  cardArrow: {
    fontSize: 20,
    color: "#aaa",
  },
});