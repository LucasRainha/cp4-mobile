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
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigation = useNavigation();

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