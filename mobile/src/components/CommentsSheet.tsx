import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import { addComment, getComments } from "../api/client";
import { useSession } from "../lib/session";
import type { Comment } from "../types";

export default function CommentsSheet({
  cocktailId,
  visible,
  onClose,
  onAdded,
}: {
  cocktailId: string | null;
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { user } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (cocktailId && visible) setComments(getComments(cocktailId));
  }, [cocktailId, visible]);

  function submit() {
    if (!cocktailId || !body.trim()) return;
    const c = addComment(cocktailId, user?.username ?? "guest", body.trim());
    setComments((prev) => [...prev, c]);
    setBody("");
    onAdded();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheet}
        >
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Comments ({comments.length})</Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingVertical: 8, gap: 12 }}
            ListEmptyComponent={
              <Text style={styles.empty}>No comments yet — say cheers! 🥂</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.comment}>
                <Text style={styles.user}>@{item.username}</Text>
                <Text style={styles.commentBody}>{item.body}</Text>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment…"
              placeholderTextColor="rgba(0,0,0,0.4)"
              value={body}
              onChangeText={setBody}
              multiline
            />
            <Pressable
              onPress={submit}
              disabled={!body.trim()}
              style={[styles.send, { opacity: body.trim() ? 1 : 0.4 }]}
            >
              <Text style={styles.sendText}>Post</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: 10,
    height: "75%",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginBottom: 8,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.plum },
  closeText: { fontSize: 20, color: colors.plum },
  empty: { textAlign: "center", color: colors.ink, opacity: 0.5, marginTop: 30 },
  comment: { backgroundColor: colors.white, borderRadius: radius.md, padding: 12 },
  user: { fontWeight: "800", color: colors.plum, marginBottom: 2 },
  commentBody: { color: colors.ink, opacity: 0.85 },
  inputRow: { flexDirection: "row", gap: 10, paddingVertical: 12, alignItems: "flex-end" },
  input: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    color: colors.ink,
  },
  send: {
    backgroundColor: colors.coral,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  sendText: { color: colors.white, fontWeight: "800" },
});
