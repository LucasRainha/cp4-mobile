// src/services/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
// Detecta ambiente web
const isWeb = typeof window !== "undefined" && typeof window.document !== "undefined";

// Só importa AsyncStorage se não for web
let AsyncStorage;
if (!isWeb) {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
}

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

// Inicializa Auth corretamente para cada ambiente
export const auth = isWeb
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

export const db = getFirestore(app);
