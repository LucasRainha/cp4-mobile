import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

const isWeb = typeof window !== "undefined" && typeof window.document !== "undefined";

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigation = useNavigation();

  // Expo Auth Session para Google (mobile)
  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "757932393161-2v6k1k1v7k1v7k1v7k1v7k1v7k1v7k1v.apps.googleusercontent.com", // Substitua pelo seu clientId Expo
    iosClientId: "", // Se usar iOS
    androidClientId: "", // Se usar Android
    webClientId: "757932393161-2v6k1k1v7k1v7k1v7k1v7k1v7k1v7k1v.apps.googleusercontent.com", // Substitua pelo seu clientId Web
  });
  // Login Google para web
  const handleGoogleLoginWeb = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      onLoginSuccess?.(user);
      Alert.alert("Sucesso", "Login Google realizado!");
    } catch (error) {
      console.error("Erro no login Google:", error);
      Alert.alert("Erro", error.message);
    }
  };

  // Login Google para mobile (Expo)
  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          onLoginSuccess?.(result.user);
          Alert.alert("Sucesso", "Login Google realizado!");
        })
        .catch((error) => {
          console.error("Erro no login Google:", error);
          Alert.alert("Erro", error.message);
        });
    }
  }, [response]);

  const handleLogin = async () => {
    console.log("Tentando login com:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      console.log("Login bem-sucedido:", user.uid);
      onLoginSuccess?.(user);
      Alert.alert("Sucesso", "Login realizado!");
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Botão Login Google */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4285F4", flexDirection: "row", alignItems: "center", justifyContent: "center" }]}
        onPress={isWeb ? handleGoogleLoginWeb : () => promptAsync()}
      >
        <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: "#fff" }]}>Entrar com Google</Text>
      </TouchableOpacity>
      <Text style={[styles.logo, { color: theme.text }]}>
        Agend<Text style={{ color: theme.primary }}>a</Text>
      </Text>

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="mail-outline" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder="Email"
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder="Senha"
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleLogin}>
        <Text style={[styles.buttonText, { color: theme.background }]}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={[styles.forgot, { color: theme.text }]}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={[styles.register, { color: theme.primary }]}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleTheme}>
        <Text style={[styles.alterarTema, { color: theme.text }]}>Alternar Tema</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  logoHighlight: {
    color: "#27C8E3",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: {
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  forgot: {
    textAlign: "center",
    marginTop: 20,
  },
  register: {
    textAlign: "center",
    marginTop: 15,
    fontWeight: "bold",
  },
  alterarTema: {
    
  },
});