import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SessionProvider, useSession } from "./src/lib/session";
import LoginScreen from "./src/screens/LoginScreen";
import FeedScreen from "./src/screens/FeedScreen";
import CreateScreen from "./src/screens/CreateScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { colors } from "./src/theme";

type Tab = "feed" | "create" | "profile";

function Shell() {
  const { user } = useSession();
  const [tab, setTab] = useState<Tab>("feed");
  // Bumped when a cocktail is published so the feed/profile re-read data.
  const [refreshKey, setRefreshKey] = useState(0);

  if (!user) {
    return (
      <>
        <StatusBar style="light" />
        <LoginScreen />
      </>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style={tab === "feed" ? "light" : "dark"} />

      <View style={styles.screen}>
        {tab === "feed" && <FeedScreen key={`feed-${refreshKey}`} />}
        {tab === "create" && (
          <CreateScreen
            onPublished={() => {
              setRefreshKey((k) => k + 1);
              setTab("feed");
            }}
          />
        )}
        {tab === "profile" && <ProfileScreen refreshKey={refreshKey} />}
      </View>

      {/* Floating bottom tab bar */}
      <View style={styles.tabbar}>
        <TabButton icon="🍹" label="Feed" active={tab === "feed"} onPress={() => setTab("feed")} />
        <CreateButton onPress={() => setTab("create")} active={tab === "create"} />
        <TabButton icon="👤" label="Profile" active={tab === "profile"} onPress={() => setTab("profile")} />
      </View>
    </View>
  );
}

function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tabBtn}>
      <Text style={[styles.tabIcon, { opacity: active ? 1 : 0.55 }]}>{icon}</Text>
      <Text style={[styles.tabLabel, { opacity: active ? 1 : 0.55 }]}>{label}</Text>
    </Pressable>
  );
}

function CreateButton({ onPress, active }: { onPress: () => void; active: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.createBtn}>
      <View style={[styles.createInner, active && { backgroundColor: colors.sunset }]}>
        <Text style={styles.createPlus}>＋</Text>
      </View>
    </Pressable>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink },
  screen: { flex: 1 },
  tabbar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 30,
    height: 64,
    backgroundColor: "rgba(26,20,16,0.92)",
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  tabBtn: { alignItems: "center", gap: 2, width: 70 },
  tabIcon: { fontSize: 22 },
  tabLabel: { color: colors.white, fontSize: 11, fontWeight: "700" },
  createBtn: { alignItems: "center", justifyContent: "center" },
  createInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  createPlus: { color: colors.white, fontSize: 30, fontWeight: "300", lineHeight: 32 },
});
