// src/services/notifications.js
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Como a notificação aparece quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Pede permissão e configura canal no Android
export async function ensurePermissions() {
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return status === "granted";
}

// Agenda para disparar em X segundos
export async function scheduleLocal(title, body, date) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { date},
  });
}

