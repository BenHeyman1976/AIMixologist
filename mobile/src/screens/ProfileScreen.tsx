import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../theme";
import { getImageUsage, getUserCocktails } from "../api/client";
import { useSession } from "../lib/session";

export default function ProfileScreen({ refreshKey }: { refreshKey: number }) {
  const { user, setUser } = useSession();
  const usage = getImageUsage();
  const mine = getUserCocktails("me").filter((c) => c.user_id === "me");
  const published = mine.filter((c) => c.is_public);
  const pct = usage.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 28 }}>🍹</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>@{user?.username ?? "guest"}</Text>
          <Text style={styles.plan}>{user?.plan ?? "free"} plan</Text>
        </View>
        <Pressable onPress={() => setUser(null)}>
          <Text style={styles.logout}>Log out</Text>
        </Pressable>
      </View>

      {/* Image allowance */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Monthly image allowance</Text>
          <Text style={styles.usageNum}>
            {usage.used}/{usage.limit}
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.usageNote}>
          {usage.remaining} image generations left this month. Recipes are always
          unlimited.
        </Text>
        {/* TODO(billing): "Upgrade" → paid plan raises this allowance. */}
        <View style={styles.upgrade}>
          <Text style={styles.upgradeText}>Upgrade for more images (coming soon)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your published cocktails ({published.length})</Text>
      {published.length === 0 ? (
        <Text style={styles.empty}>
          Nothing published yet — head to Create and share your first one!
        </Text>
      ) : (
        <View style={styles.grid}>
          {published.map((c) => (
            <View key={c.id} style={styles.tile}>
              {c.image_url ? (
                <Image source={{ uri: c.image_url }} style={styles.tileImg} />
              ) : (
                <View style={[styles.tileImg, styles.tileEmpty]}>
                  <Text style={{ fontSize: 28 }}>🍸</Text>
                </View>
              )}
              <Text style={styles.tileName} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.tileVotes}>❤️ {c.vote_count}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.peach,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 22, fontWeight: "900", color: colors.plum },
  plan: { fontSize: 14, color: colors.ink, opacity: 0.6, textTransform: "capitalize" },
  logout: { color: colors.coral, fontWeight: "800" },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 18 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.plum },
  usageNum: { fontSize: 16, fontWeight: "800", color: colors.plum },
  barTrack: {
    height: 12,
    backgroundColor: "rgba(255,177,122,0.25)",
    borderRadius: 6,
    marginTop: 12,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: colors.coral, borderRadius: 6 },
  usageNote: { fontSize: 13, color: colors.ink, opacity: 0.6, marginTop: 10 },
  upgrade: {
    marginTop: 14,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: radius.pill,
    paddingVertical: 12,
    alignItems: "center",
  },
  upgradeText: { color: colors.ink, opacity: 0.5, fontWeight: "700" },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.plum },
  empty: { color: colors.ink, opacity: 0.6 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "47%" },
  tileImg: { width: "100%", aspectRatio: 1, borderRadius: radius.md },
  tileEmpty: { backgroundColor: colors.peach, alignItems: "center", justifyContent: "center" },
  tileName: { fontSize: 14, fontWeight: "800", color: colors.plum, marginTop: 6 },
  tileVotes: { fontSize: 13, color: colors.ink, opacity: 0.6 },
});
