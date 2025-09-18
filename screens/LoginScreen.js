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
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { useTranslation } from "react-i18next";
import i18n from "../services/i18n";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../contexts/ThemeContext";

const isWeb =
  typeof window !== "undefined" && typeof window.document !== "undefined";

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { t } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const navigation = useNavigation();

  const toggleLang = () => {
    const newLang = lang === "pt" ? "en" : "pt";
    i18n.changeLanguage(newLang);
    setLang(newLang);
  };

  // Google Auth
  WebBrowser.maybeCompleteAuthSession();
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "757932393161-xxxx.apps.googleusercontent.com",
    webClientId: "757932393161-xxxx.apps.googleusercontent.com",
  });

  const handleGoogleLoginWeb = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onLoginSuccess?.(result.user);
      Alert.alert("Sucesso", "Login Google realizado!");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  React.useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          onLoginSuccess?.(result.user);
          Alert.alert("Sucesso", "Login Google realizado!");
        })
        .catch((error) => Alert.alert("Erro", error.message));
    }
  }, [response]);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        senha
      );
      onLoginSuccess?.(userCredential.user);
      Alert.alert("Sucesso", "Login realizado!");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Logo */}
      <Text style={[styles.logo, { color: theme.text }]}>
        {t("appName", "Agenda")}
        <Text style={{ color: theme.primary }}>
          {t("appNameHighlight", "a")}
        </Text>
      </Text>

      {/* Inputs */}
      <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="mail-outline" size={20} color={theme.text} style={styles.icon} />
        <TextInput
          placeholder={t("email", "Email")}
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
          placeholder={t("password", "Senha")}
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.text}
          secureTextEntry
          value={senha}
          onChangeText={setSenha}
        />
      </View>

      {/* Botão principal */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={handleLogin}
      >
        <Ionicons name="log-in-outline" size={20} color={theme.background} style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: theme.background }]}>
          {t("login", "Entrar")}
        </Text>
      </TouchableOpacity>

      {/* Esqueceu senha */}
      <TouchableOpacity>
        <Text style={[styles.forgot, { color: theme.primary }]}>
          {t("forgotPassword", "Esqueceu sua senha?")}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: theme.text }]} />
        <Text style={[styles.dividerText, { color: theme.text }]}>ou</Text>
        <View style={[styles.divider, { backgroundColor: theme.text }]} />
      </View>

      {/* Botão Google */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#4285F4" }]}
        onPress={isWeb ? handleGoogleLoginWeb : () => promptAsync()}
      >
        <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={[styles.buttonText, { color: "#fff" }]}>
          {t("loginWithGoogle", "Entrar com Google")}
        </Text>
      </TouchableOpacity>

      {/* Criar conta */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={[styles.register, { color: theme.primary }]}>
          {t("createAccount", "Criar conta")}
        </Text>
      </TouchableOpacity>

      {/* Rodapé - tema e idioma */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={toggleTheme} style={styles.footerItem}>
          <Ionicons name="contrast-outline" size={18} color={theme.text} />
          <Text style={[styles.footerText, { color: theme.text }]}>
            {t("toggleTheme", "Tema")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleLang} style={styles.footerItem}>
          <Ionicons name="language-outline" size={18} color={theme.text} />
          <Text style={[styles.footerText, { color: theme.text }]}>
            {lang === "pt" ? "Português" : "English"}
          </Text>
        </TouchableOpacity>
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  forgot: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  register: {
    textAlign: "center",
    marginTop: 15,
    fontWeight: "bold",
    fontSize: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
  },
  footerText: {
    marginLeft: 6,
    fontSize: 14,
  },
});
