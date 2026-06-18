import React from "react";
import {
  Image,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Cocktail } from "../types";
import { colors } from "../theme";
import Chip from "./Chip";

const ALCOHOL_LABEL: Record<string, string> = {
  "alcohol-free": "0% Alcohol-free",
  "low-alcohol": "Low-alcohol",
  "full-strength": "Full-strength",
};

// One full-screen, swipeable cocktail — the core of the feed.
export default function FeedItem({
  cocktail,
  height,
  onLike,
  onOpenRecipe,
  onOpenComments,
  commentCount,
}: {
  cocktail: Cocktail;
  height: number;
  onLike: () => void;
  onOpenRecipe: () => void;
  onOpenComments: () => void;
  commentCount: number;
}) {
  async function share() {
    try {
      await Share.share({
        message: `${cocktail.name} 🍹 — ${cocktail.tasting_notes}\nMade with Bob the AI Mixologist`,
      });
    } catch {
      /* cancelled */
    }
  }

  return (
    <View style={[styles.page, { height }]}>
      {cocktail.image_url ? (
        <Image
          source={{ uri: cocktail.image_url }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.plum }]} />
      )}

      {/* Gradient-ish scrim for legibility (top + bottom) */}
      <View style={[styles.scrim, styles.scrimBottom]} />
      <View style={[styles.scrim, styles.scrimTop]} />

      {/* Right action rail */}
      <View style={styles.rail}>
        <RailButton
          icon={cocktail.voted ? "❤️" : "🤍"}
          label={String(cocktail.vote_count)}
          onPress={onLike}
        />
        <RailButton icon="💬" label={String(commentCount)} onPress={onOpenComments} />
        <RailButton icon="🔗" label="Share" onPress={share} />
        <RailButton icon="📖" label="Recipe" onPress={onOpenRecipe} />
      </View>

      {/* Bottom info */}
      <View style={styles.info}>
        <Chip label={ALCOHOL_LABEL[cocktail.alcohol_level] ?? cocktail.alcohol_level} />
        <Text style={styles.name}>{cocktail.name}</Text>
        <Text style={styles.creator}>@{cocktail.creator_username}</Text>
        <Text style={styles.notes} numberOfLines={2}>
          {cocktail.tasting_notes}
        </Text>
        <View style={styles.tags}>
          {cocktail.tags.slice(0, 3).map((t) => (
            <Text key={t} style={styles.tag}>
              #{t}
            </Text>
          ))}
        </View>
        <Pressable onPress={onOpenRecipe} style={styles.recipeCta}>
          <Text style={styles.recipeCtaText}>View full recipe →</Text>
        </Pressable>
      </View>
    </View>
  );
}

function RailButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.railBtn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={styles.railIcon}>{icon}</Text>
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { width: "100%", justifyContent: "flex-end", backgroundColor: colors.ink },
  scrim: { position: "absolute", left: 0, right: 0 },
  scrimBottom: {
    bottom: 0,
    height: 320,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  scrimTop: { top: 0, height: 120, backgroundColor: "rgba(0,0,0,0.25)" },
  rail: {
    position: "absolute",
    right: 12,
    bottom: 170,
    alignItems: "center",
    gap: 22,
  },
  railBtn: { alignItems: "center", gap: 4 },
  railIcon: { fontSize: 30 },
  railLabel: { color: colors.white, fontSize: 12, fontWeight: "700" },
  info: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    paddingRight: 80,
    gap: 6,
  },
  name: { color: colors.white, fontSize: 28, fontWeight: "900" },
  creator: { color: colors.peach, fontSize: 15, fontWeight: "700" },
  notes: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 20 },
  tags: { flexDirection: "row", gap: 10, marginTop: 2 },
  tag: { color: colors.white, fontSize: 13, fontWeight: "700" },
  recipeCta: {
    marginTop: 10,
    backgroundColor: colors.glass,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  recipeCtaText: { color: colors.white, fontWeight: "800" },
});
