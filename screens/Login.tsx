    import React, { useState } from "react";
    import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
    import AsyncStorage from "@react-native-async-storage/async-storage";
    import { useNavigation } from "@react-navigation/native";
    import useStorage  from "../composables/useLocalStorage";

    const URL = "https://distributeurcle.edwrdledgar.me/api";

    export default function Login({ setIsLogged }) {
      const navigation = useNavigation();
      const [mail, setmail] = useState("");
      const [password, setPassword] = useState("");
     const { setItem, getItem } = useStorage<string>("auth_token");


      const handleLogin = async () => {


        if (!mail || !password) {
          Alert.alert("Error", "Please enter mail and password");
          return;
        }

       try {
         const response = await fetch(`${URL}/auth/login`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ mail, password }),
         });

         const data = await response.json();
         console.log("DATA LOGIN:", data);

         if (response.ok && data.token) {
           await setItem(data.token);
           await AsyncStorage.setItem("mail", mail);
           navigation.navigate("Main");
         } else {
           Alert.alert("Error", data.message || "Wrong mail or password");
         }
       } catch (error) {
         console.log("LOGIN FETCH ERROR:", error);
         Alert.alert("Erreur", "Server not accessible.");
       }
      };

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Connexion</Text>

          <TextInput
            placeholder="Adresse mail"
            value={mail}
            onChangeText={setmail}
            accessibilityLabel="mailInput"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="passwordInput"
            secureTextEntry
            style={styles.input}
          />

           <View style={{ width: "80%", marginBottom: 20 }}>
                   <Button
                     title="Se connecter"
                     onPress={handleLogin}
                     accessibilityLabel="loginButton"
                   />
                 </View>

        </View>
      );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      },
      title: {
        fontSize: 24,
        marginBottom: 20,
      },
      input: {
        width: "80%",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
      },
    });

