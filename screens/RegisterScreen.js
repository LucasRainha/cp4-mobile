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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

export default function RegisterScreen({ onRegisterSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmSenha, setConfirmSenha] = useState("");
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  const handleRegister = async () => {
    console.log("Botão pressionado!");
    console.log("Tentando cadastro com:", email);

    if (senha !== confirmSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha
      );
      const user = userCredential.user;
      console.log("Cadastro bem-sucedido:", user.uid);

      // ✅ Deixa o Root (App.js) alternar de AuthStack -> Drawer automaticamente
      onRegisterSuccess && onRegisterSuccess({
        uid: user.uid,
        email: user.email,
      });

      // ❌ NÃO navegue manualmente daqui (essa tela está no AuthStack)
      // navigation.navigate("Dashboard");
      // navigation.replace("Dashboard");

      // (Opcional) feedback:
      // Alert.alert("Sucesso", "Conta criada! Abrindo o app...");

    } catch (error) {
      console.error("Erro no cadastro:", error);
      Alert.alert("Erro", error?.message || "Não foi possível cadastrar.");
    }
  };
  
  const goToLogin = () => navigation.navigate("Login");

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Botão para voltar ao Login */}
      <TouchableOpacity style={styles.backBtn} onPress={goToLogin}>
        <Ionicons name="arrow-back" size={22} color={theme.text} />
        <Text style={[styles.backText, { color: theme.text }]}>Voltar</Text>
      </TouchableOpacity>

      <Text style={[styles.logo, { color: theme.primary }]}>
        A<Text style={{ color:  theme.text }}>genda</Text> - Cadastro
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

      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="lock-closed-outline" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder="Confirmar Senha"
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          secureTextEntry
          value={confirmSenha}
          onChangeText={setConfirmSenha}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleRegister}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 30 },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
  },
  backText: { marginLeft: 6, fontSize: 16 },
  logo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  icon: { marginRight: 5 },
  input: { flex: 1, height: 50 },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: { textAlign: "center", fontWeight: "bold", fontSize: 16 },
});
