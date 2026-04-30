import React, { useState, useEffect  } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MqttService from "../services/mqtt";
import { Picker } from "@react-native-picker/picker";
import useStorage from "../composables/useLocalStorage";
const URL = process.env.EXPO_PUBLIC_API_URL;

export default function AddKeys() {
  const [name, setName] = useState("");
  const { getItem } = useStorage("auth_token");
  const [idRole, setIdRole] = useState("");
  const [rfidUid, setRfidUid] = useState("");
  const [scanning, setScanning] = useState(false);
  const [mqttClient, setMqttClient] = useState(null);
  const [roles, setRoles] = useState([]);

    //Modifier avec l'ia pour faire en sorte qu'un bouton soit appuyer et que cela cherche le rfid
    //quand le bouton est préssé
   const startScan = () => {
       setRfidUid("");
       setScanning(true);

       const client = new MqttService((message) => {
           setRfidUid(message);
           setScanning(false);
           client.disconnect();
       }, "distributeur/rfid");

       setMqttClient(client);
       client.connect();
   };

   useEffect(() => {
       return () => mqttClient?.disconnect();
   }, [mqttClient]);
   useEffect(() => {
     const loadRoles = async () => {
       try {
         const token = await getItem();

         const res = await fetch(`${URL}/roles`, {
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,
           },
         });

         const data = await res.json();

         console.log("ROLES API:", data);

         setRoles(Array.isArray(data) ? data : []);
         setRoles(data);
       } catch (error) {
         console.log("ERROR ROLES:", error);
         Alert.alert("Erreur", "Impossible de charger les rôles");
       }
     };

     loadRoles();
   }, []);

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

     console.log("STATUS:", response.status);
     const data = await response.json();
     console.log("RESPONSE:", JSON.stringify(data)); // ← ajoute ça

     if (!response.ok) throw new Error("Erreur lors de la création");

     Alert.alert("Succès", "Clé ajoutée avec succès");
   } catch (error) {
     console.log("ERROR:", error);
     Alert.alert("Erreur", "Impossible d'ajouter la clé");
   }
 };
//Aide de l'ia pour faire un selecteur
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

      <Text style={styles.label}>Rôle</Text>
      <Picker
        selectedValue={idRole}
        onValueChange={(value) => setIdRole(value)}
        style={styles.picker}
      >
        <Picker.Item label="Sélectionner un rôle" value="" />

        {Array.isArray(roles) &&
          roles.map((role: any) => (
            <Picker.Item
              key={role.idRole}
              label={role.roleName}
              value={role.idRole.toString()}
            />
          ))}
      </Picker>
       <TouchableOpacity
        style={[styles.button,{ marginBottom: 16 }]}
        onPress={startScan}
        disabled={scanning}>
        <Text style={styles.buttonText}>{scanning ? "Scanne en cours" : "Scanner le rfid"}</Text>
       </TouchableOpacity>

      <Text style={styles.label}>RFID UID</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 8C:76:0B:30"
        editable={false}
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
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
  }
});