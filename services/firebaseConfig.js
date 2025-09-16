// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 👈 importar firestore
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCoIqo1CPjTBHmwgK2RlPmD6Lhy3RpNWsw",
  authDomain: "motix-e1d90.firebaseapp.com",
  projectId: "motix-e1d90",
  storageBucket: "motix-e1d90.firebasestorage.app",
  messagingSenderId: "757932393161",
  appId: "1:757932393161:web:d6bcaec4cf1bfa510c4318",
  measurementId: "G-8DDYQT1YFV",
};

export const app = initializeApp(firebaseConfig);

// ✅ Auth com persistência nativa
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// ✅ Firestore (para salvar/ler tarefas em tempo real)
export const db = getFirestore(app);

// ❌ Não use getAnalytics no mobile
