// screens/DashboardScreen.js
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../contexts/ThemeContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { auth, db } from "../services/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { useQuery } from "@tanstack/react-query";
import { ensurePermissions, scheduleAtDate } from "../services/notifications";

/** ========= API externa (TanStack Query) ========= */
async function fetchQuote() {
  const r = await fetch("https://zenquotes.io/api/random");
  const data = await r.json();
  const item = Array.isArray(data) ? data[0] : data;
  return { q: item.q || "Keep going!", a: item.a || "Unknown" };
}

export default function DashboardScreen() {
  const { theme } = useContext(ThemeContext);
  const user = auth.currentUser;
  const { t } = useTranslation();

  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  // NEW: due date para a task + controle do picker
  const [dueDate, setDueDate] = useState(null); // Date | null
  const [pickerVisible, setPickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Frase motivacional (atualiza a cada 30 min; cacheia)
  const { data: quote, refetch: refetchQuote } = useQuery({
    queryKey: ["quote"],
    queryFn: fetchQuote,
    staleTime: 1000 * 60 * 30,
  });

  /** ========= Firestore: users/{uid}/tasks (tempo real) ========= */
  const listenTasks = useCallback(() => {
    if (!user?.uid) return () => {};
    const col = collection(db, "users", user.uid, "tasks");
    const q = query(col, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));
        setTasks(list);
      },
      (err) => {
        console.log("onSnapshot error:", err?.code, err?.message);
      }
    );
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    const unsub = listenTasks();
    return () => unsub && unsub();
  }, [listenTasks]);

  /** ========= Helpers ========= */
  const isFuture = (d) => d instanceof Date && !isNaN(d) && d.getTime() > Date.now();
  const fmtDateTime = (msOrDate) => {
    const d = msOrDate instanceof Date ? msOrDate : new Date(msOrDate);
    if (isNaN(d)) return "";
    return d.toLocaleString();
  };

  /** ========= Actions ========= */
  const addTask = async () => {
    const title = newTitle.trim();
    if (!title || !user?.uid) return;

    // salva dueAt (ms) junto com a task
    const col = collection(db, "users", user.uid, "tasks");
    const dueMs = dueDate ? dueDate.getTime() : null;

    await addDoc(col, {
      title,
      done: false,
      createdAt: serverTimestamp(),
      dueAt: dueMs, // 👈 gravado no Firestore
    });

    // agenda notificação para a data se for futura
    try {
      if (isFuture(dueDate)) {
        const ok = await ensurePermissions();
        if (ok) {
          await scheduleAtDate("Lembrete", `Revisar: “${title}”`, dueDate);
        }
      }
    } catch (e) {
      console.log("Falha ao agendar notificação:", e?.message || e);
    }

    setNewTitle("");
    setDueDate(null);
  };

  const toggleTask = async (task) => {
    if (!user?.uid || !task?.id) return;
    const ref = doc(db, "users", user.uid, "tasks", task.id);
    await updateDoc(ref, { done: !task.done });
  };

  const removeTask = async (task) => {
    if (!user?.uid || !task?.id) return;
    const ref = doc(db, "users", user.uid, "tasks", task.id);
    await deleteDoc(ref);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetchQuote();
    } finally {
      setRefreshing(false);
    }
  };

  /** ========= UI ========= */
  const Header = () => (
    <View style={styles(theme).header}>
      <View style={styles(theme).headerLeft}>
        <Ionicons name="checkmark-done-circle" size={22} color={theme.primary} />
  <Text style={styles(theme).title}>{t("myTasks", "Minhas Tarefas")}</Text>
      </View>
      {quote ? (
        <Text style={styles(theme).subtitle}>
          “{quote.q}” — {quote.a}
        </Text>
      ) : (
        <Text style={styles(theme).subtitle}>Carregando inspiração…</Text>
      )}
    </View>
  );

  const TaskItem = ({ item }) => (
    <View style={styles(theme).taskItem}>
      <TouchableOpacity
        onPress={() => toggleTask(item)}
        style={styles(theme).checkButton}
  accessibilityLabel={item.done ? t("markAsPending", "Marcar como pendente") : t("markAsDone", "Marcar como concluída")}
      >
        {item.done ? (
          <Ionicons name="checkbox" size={22} color={theme.primary} />
        ) : (
          <Ionicons name="square-outline" size={22} color={theme.text + "99"} />
        )}
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles(theme).taskTitle,
            item.done && { textDecorationLine: "line-through", opacity: 0.6 },
          ]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {item.dueAt ? (
          <Text style={styles(theme).dueText}>⏰ {fmtDateTime(item.dueAt)}</Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => removeTask(item)} style={styles(theme).trashButton}>
        <MaterialCommunityIcons name="trash-can-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles(theme).container}>
      <Header />

      {/* Input de nova tarefa + seletor de data */}
      <View style={styles(theme).inputRow}>
        <Ionicons name="add-circle" size={22} color={theme.primary} />
        <TextInput
          style={styles(theme).input}
          placeholder={t("whatToDo", "O que precisa fazer?")}
          placeholderTextColor={theme.text + "66"}
          value={newTitle}
          onChangeText={setNewTitle}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />

        {/* Botão abre o DateTimePicker */}
        <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={styles(theme).dateBtn}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles(theme).dateBtnTxt}>
            {dueDate ? new Date(dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : t("date", "Data")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={addTask} style={styles(theme).addButton}>
          <Text style={styles(theme).addButtonText}>{t("add", "Adicionar")}</Text>
        </TouchableOpacity>
      </View>

      {/* Mostra data escolhida (opcional) */}
      {dueDate ? (
        <Text style={styles(theme).dueInline}>⏰ {fmtDateTime(dueDate)}</Text>
      ) : null}

      {/* DateTimePicker nativo */}
      {pickerVisible && (
        <DateTimePicker
          value={dueDate || new Date(Date.now() + 5 * 60 * 1000)}
          mode="datetime"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event, selected) => {
            if (Platform.OS !== "ios") setPickerVisible(false);
            if (selected) setDueDate(selected);
          }}
          // em iOS você pode manter visível e usar um botão OK externo se preferir
        />
      )}

      {/* Métricas rápidas */}
      <View style={styles(theme).statsRow}>
        <Stat label={t("pending", "Pendentes")} value={tasks.filter((t) => !t.done).length} theme={theme} />
        <Stat label={t("done", "Concluídas")} value={tasks.filter((t) => t.done).length} theme={theme} />
        <Stat label={t("total", "Total")} value={tasks.length} theme={theme} />
      </View>

      {/* Lista em tempo real */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={TaskItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles(theme).emptyBox}>
            <Ionicons name="list-outline" size={22} color={theme.text + "66"} />
            <Text style={styles(theme).emptyText}>{t("noTasksYet", "Sem tarefas ainda. Adicione a primeira!")}</Text>
          </View>
        }
      />
    </View>
  );
}

/** ========= Pequeno card de estatística ========= */
function Stat({ label, value, theme }) {
  return (
    <View style={styles(theme).statCard}>
      <Text style={styles(theme).statLabel}>{label}</Text>
      <Text style={styles(theme).statValue}>{value}</Text>
    </View>
  );
}

/** ========= styles ========= */
const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background, padding: 16 },
    header: { marginBottom: 12 },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    title: { fontSize: 22, fontWeight: "800", color: theme.text },
    subtitle: { color: theme.text + "99" },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.text + "10",
      marginBottom: 6,
    },
    input: { flex: 1, color: theme.text, paddingVertical: 6 },

    dateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.primary,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
    },
    dateBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 12 },

    addButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    addButtonText: { color: "#fff", fontWeight: "700", fontSize: 12, letterSpacing: 0.3 },

    dueInline: { color: theme.text + "99", marginBottom: 10 },

    statsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
    statCard: {
      flex: 1,
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.text + "10",
    },
    statLabel: { color: theme.text + "88", fontSize: 12, marginBottom: 2 },
    statValue: { color: theme.text, fontSize: 18, fontWeight: "900" },

    taskItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: theme.text + "10",
      marginBottom: 8,
      gap: 10,
    },
    checkButton: { padding: 2 },
    taskTitle: { color: theme.text, fontSize: 15, fontWeight: "600" },
    dueText: { color: theme.text + "88", fontSize: 12, marginTop: 2 },
    trashButton: { padding: 4 },

    emptyBox: { alignItems: "center", gap: 6, paddingVertical: 24 },
    emptyText: { color: theme.text + "88" },
  });
