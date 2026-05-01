import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect  } from "@react-navigation/native";
import { jwtDecode } from "jwt-decode";
import useStorage from "../composables/useLocalStorage";
import MqttService from "../services/mqtt";
import AsyncStorage from "@react-native-async-storage/async-storage";

const URL = process.env.EXPO_PUBLIC_API_URL;

interface JwtPayload {
  idUser: number;
  mail: string;
  idRole: number;
}

interface Key {
  idKey: number;
  name: string;
  status: "Libérer" | "Occupée" | "Indisponible" | "locked";
}

const STATUS_STYLE: Record<Key["status"], { label: string; color: string; bg: string }> = {
  "Libérer":      { label: "Libérer",      color: "#333",    bg: "#eee" },
  "Occupée":      { label: "Occupée",      color: "#e07b00", bg: "#fff3e0" },
  "Indisponible": { label: "Indisponible", color: "#e07b00", bg: "#fff3e0" },
  "locked":       { label: "🔒",           color: "#999",    bg: "#f5f5f5" },
};

export default function Main() {
  const navigation = useNavigation();
  const { getItem } = useStorage("auth_token");
  const [mail, setMail] = useState("");
  const [keys, setKeys] = useState<Key[]>([]);
  const [loading, setLoading] = useState(true);
  const [idRole, setIdRole] = useState<number | null>(null);
  const mqttRef = useRef(null);
  const idRoleRef = useRef<number | null>(null);
  const [idUser, setIdUser] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const savedMail = await AsyncStorage.getItem("mail");
    if (savedMail) setMail(savedMail);

    const token = await getItem();
    if (!token) return;
    let userRole: number = 0;

    try {
      const payload = jwtDecode<JwtPayload>(token);
      userRole = payload.idRole ?? 0;
      setIdRole(payload.idRole);
      setIdUser(payload.idUser);
      idRoleRef.current = payload.idRole;
    } catch {
      Alert.alert("Erreur", "Token invalide");
      return;
    }

    try {
      const response = await fetch(`${URL}/key`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      const filteredKeys = data.map((key: any) => {
        if (userRole > key.idRole) {
          return { ...key, status: "locked" };
        }
        return key;
      });

      setKeys(filteredKeys);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les clés");
    } finally {
      setLoading(false);
    }
  }, []);
   useFocusEffect(
      useCallback(() => {
        loadData();
      }, [loadData])
    );

 useEffect(() => {

    const mqtt = new MqttService((topic: string, message: string) => {
      console.log("MQTT:", topic, message);
      if (topic === "distributeur/rfid") {
        loadData();
        if (idRoleRef.current === 1) {
          Alert.alert("Clé retournée 🔑", "Une clé a été détectée au distributeur, veuillez la replacer.");
        }
      }
    }, ["distributeur/cle", "distributeur/rfid"]);

    mqtt.connect();
    mqttRef.current = mqtt;
    return () => mqtt.disconnect();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("mail");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const handleKeyPress = async (key: Key) => {
    if (key.status === "locked" || key.status === "Indisponible" || key.status === "Occupée") return;
    if (!mqttRef.current) {
      Alert.alert("Erreur", "Non connecté au broker MQTT");
      return;
    }

    try {
      const token = await getItem();
      const response = await fetch(`${URL}/borrows`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type":    "application/json",
        },
        body: JSON.stringify({ idKey: key.idKey }),
      });
console.log("STATUS:", response.status);
const data = await response.json();
console.log("RESPONSE:", JSON.stringify(data));
      if (!response.ok) {
        Alert.alert("Erreur", "Impossible de créer l'emprunt");
        return;
      }

      mqttRef.current.publish(`${key.slot};ouvrir`);
      loadData();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer l'emprunt");
    }
  };

  const roleLabel = idRole === 1 ? "Admin" : idRole === 2 ? "Technicien" : idRole === 3 ? "Utilisateur" : "";

  const pairs = [];
  for (let i = 0; i < keys.length; i += 2) {
    pairs.push(keys.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des clés</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerUser}>{roleLabel}</Text>
          {idRole === 1 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("adminSection")}
              style={styles.adminBtn}
            >
              <Text style={styles.adminIcon}>⚙️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutIcon}>↪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.listTitle}>Liste des clés :</Text>

        {pairs.map((pair, i) => (
          <View key={i} style={styles.row}>
            {pair.map((key) => {
              const s = STATUS_STYLE[key.status];
              const isDisabled = key.status === "locked" || key.status === "Indisponible" || key.status === "Occupée";
              return (
                <TouchableOpacity
                  key={key.idKey}
                  style={styles.keyCard}
                  onPress={() => handleKeyPress(key)}
                  disabled={isDisabled}
                  activeOpacity={isDisabled ? 1 : 0.7}
                >
                  <Text style={styles.keyIcon}>🔑</Text>
                  <Text style={styles.keyName}>{key.name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>
                      {s.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
            {pair.length === 1 && <View style={styles.keyCard} />}
          </View>
        ))}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerUser: {
    fontSize: 16,
    color: "#555",
  },
  logoutBtn: {
    padding: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  logoutIcon: {
    fontSize: 22,
    color: "#333",
    fontWeight: "bold",
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  keyCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 6,
    backgroundColor: "#fff",
  },
  keyIcon: {
    fontSize: 22,
  },
  keyName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  adminBtn: {
    padding: 6,
    backgroundColor: "#eee",
    borderRadius: 6,
  },
  adminIcon: {
    fontSize: 20,
  },
});