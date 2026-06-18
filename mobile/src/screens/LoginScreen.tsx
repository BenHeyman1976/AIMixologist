import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, radius } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import { login } from "../api/client";
import { useSession } from "../lib/session";

// First-run login. Mock providers for the PoC (one tap signs you in).
// TODO(auth): replace with Supabase Google/Apple OAuth + email magic links.
export default function LoginScreen() {
  const { setUser } = useSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  async function doLogin(method: "google" | "apple" | "email") {
    if (method === "email" && !email.includes("@")) return;
    setLoading(method);
    const user = await login(method, email);
    setUser(user);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.hero}>
        <Text style={styles.emoji}>🍹</Text>
        <Text style={styles.title}>Bob</Text>
        <Text style={styles.subtitle}>
          The AI mixologist. Create stunning cocktails, share them, get voted up.
        </Text>
      </View>

      <View style={styles.form}>
        <PrimaryButton
          title=" Continue with Apple"
          variant="dark"
          loading={loading === "apple"}
          onPress={() => doLogin("apple")}
        />
        <PrimaryButton
          title="Continue with Google"
          variant="secondary"
          loading={loading === "google"}
          onPress={() => doLogin("google")}
        />

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.or}>or</Text>
          <View style={styles.line} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="rgba(255,255,255,0.5)"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <PrimaryButton
          title="Continue with email"
          loading={loading === "email"}
          disabled={!email.includes("@")}
          onPress={() => doLogin("email")}
        />

        <Text style={styles.legal}>
          Demo sign-in for the preview. By continuing you confirm you are 18+.
          Please drink responsibly.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.plum, justifyContent: "center", padding: 26 },
  hero: { alignItems: "center", marginBottom: 40 },
  emoji: { fontSize: 64 },
  title: { fontSize: 52, fontWeight: "900", color: colors.white, marginTop: 6 },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  form: { gap: 12 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 },
  line: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  or: { color: "rgba(255,255,255,0.6)", fontSize: 13 },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 16,
  },
  legal: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 17,
  },
});
