import React, { useEffect, useState, useRef } from "react";
import { View, Button, Text, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import useStorage from "../composables/useLocalStorage";
import MqttService from "../services/mqtt";

export default function Main() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const { getItem } = useStorage("auth_token");
  const [role, setRole] = useState("User");
  const [lastMessage, setLastMessage] = useState("Aucun message");
  const mqttRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const savedUsername = await AsyncStorage.getItem("username");
      if (savedUsername) setUsername(savedUsername);

      const token = await getItem();
      console.log("TOKEN RECU >>> ", token);
      if (!token) return;

      try {
        const payload = jwtDecode(token);
        setRole(payload.isAdmin === true ? "Admin" : "User");
      } catch (error) {
        Alert.alert("Erreur", "Impossible de décoder le token");
      }
    };

    loadData();

        // ← ajouté : instanciation et connexion MQTT
        const mqtt = new MqttService((message: string) => {
          setLastMessage(message);
        });
        mqtt.connect();
        mqttRef.current = mqtt;

        return () => {
          mqtt.disconnect(); // ← nettoyage à la déconnexion
        };
  }, []);

  const sendMqttMessage1 = () => {
    if (!mqttRef.current) {
      Alert.alert("Erreur", "Non connecté au broker MQTT");
      return;
    }
    mqttRef.current.publish("1;ouvrir");
  };

    const sendMqttMessage2 = () => {
      if (!mqttRef.current) {
        Alert.alert("Erreur", "Non connecté au broker MQTT");
        return;
      }
      mqttRef.current.publish("1;ouvrir");
    };

    const sendMqttMessage3 = () => {
    if (!mqttRef.current) {
      Alert.alert("Erreur", "Non connecté au broker MQTT");
      return;
    }
    mqttRef.current.publish("1;ouvrir");
  };

    const sendMqttMessage4 = () => {
      if (!mqttRef.current) {
        Alert.alert("Erreur", "Non connecté au broker MQTT");
        return;
      }
      mqttRef.current.publish("1;ouvrir");
    };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("username");

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Utilisateur connecté : {username}</Text>
        <Button
          title="Déconnexion"
          onPress={handleLogout}
          accessibilityLabel="logoutButton"
        />
      </View>

      <Text style={styles.title}>Rôle : {role}</Text>

      <Text style={styles.centerText}>Distributeur Cle</Text>

      <Text style={styles.messageLabel}>Dernier message :</Text>
      <Text style={styles.messageValue}>{lastMessage}</Text>

      <Button title="Ouvrir 1" onPress={sendMqttMessage1} />
      <Button title="Ouvrir 2" onPress={sendMqttMessage2} />
      <Button title="Ouvrir 3" onPress={sendMqttMessage3} />
      <Button title="Ouvrir 4" onPress={sendMqttMessage4} />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  centerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  messageLabel: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
    marginBottom: 5,
  },
  messageValue: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
});