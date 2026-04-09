import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
const URL = "https://distributeurcle.edwrdledgar.me/api";
export default function AddKeys() {
  const [name, setName] = useState("");
  const [idRole, setIdRole] = useState("");
  const [rfidUid, setRfidUid] = useState("");

  const handleSubmit = async () => {
    if (!name || !idRole || !rfidUid) {
      Alert.alert("Erreur", "Tous les champs sont obligatoires");
      return;
    }

    try {
      const response = await fetch(`${URL}/key/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, idRole: parseInt(idRole), rfidUid }),
      });

      if (!response.ok) throw new Error("Erreur lors de la création");

      Alert.alert("Succès", "Clé ajoutée avec succès");
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter la clé");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter une clé</Text>

      <Text style={styles.label}>Nom</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Salle Serveur"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Rôle (ID)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 1"
        value={idRole}
        onChangeText={setIdRole}
        keyboardType="numeric"
      />

      <Text style={styles.label}>RFID UID</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 8C:76:0B:30"
        value={rfidUid}
        onChangeText={setRfidUid}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});