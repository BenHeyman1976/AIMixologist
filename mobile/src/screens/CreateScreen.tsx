import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors, radius } from "../theme";
import PrimaryButton from "../components/PrimaryButton";
import Chip from "../components/Chip";
import type { Cocktail, GeneratedRecipe } from "../types";
import {
  complianceNotes,
  generateImage,
  generateRecipe,
  saveCocktail,
} from "../api/client";
import { useSession } from "../lib/session";

const EXAMPLES = [
  "Aperol + Trip CBD summer spritz",
  "Low-alcohol Christmas cocktail",
  "Something tropical for a BBQ",
];

// Prompt → recipe → image → publish. Recipe shows first (drunk-proof).
export default function CreateScreen({ onPublished }: { onPublished: () => void }) {
  const { user } = useSession();
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saved, setSaved] = useState<Cocktail | null>(null);

  const [genLoading, setGenLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  async function onGenerate() {
    if (prompt.trim().length < 3) return;
    setGenLoading(true);
    setSaved(null);
    setImageUrl(null);
    try {
      setRecipe(await generateRecipe(prompt));
    } finally {
      setGenLoading(false);
    }
  }

  async function onGenerateImage() {
    if (!recipe) return;
    setImgLoading(true);
    try {
      const res = await generateImage(recipe.name);
      if (res.error === "limit") {
        Alert.alert(
          "Monthly limit reached",
          "You've used all your free image generations this month. Upgrade for more."
          // TODO(billing): open upgrade / paywall screen here.
        );
      } else {
        setImageUrl(res.image_url);
      }
    } finally {
      setImgLoading(false);
    }
  }

  function onPublish() {
    if (!recipe || !user) return;
    const c = saveCocktail(prompt, recipe, imageUrl, true, user);
    setSaved(c);
    Alert.alert("Published 🎉", "Your cocktail is live in the feed!");
    onPublished();
  }

  const notes = recipe ? complianceNotes(recipe) : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Create a cocktail</Text>
      <Text style={styles.sub}>Describe an idea, mood, brand or occasion. Recipes are unlimited & free.</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Relaxing Aperol & Trip CBD spritz for summer"
        placeholderTextColor="rgba(0,0,0,0.4)"
        value={prompt}
        onChangeText={setPrompt}
        multiline
      />

      {!recipe && (
        <View style={styles.examples}>
          {EXAMPLES.map((ex) => (
            <Text
              key={ex}
              style={styles.example}
              onPress={() => setPrompt(ex)}
            >
              {ex}
            </Text>
          ))}
        </View>
      )}

      <PrimaryButton
        title={recipe ? "Regenerate 🔄" : "Generate recipe 🍹"}
        onPress={onGenerate}
        loading={genLoading}
        disabled={prompt.trim().length < 3}
      />

      {genLoading && !recipe && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.coral} size="large" />
          <Text style={styles.loadingText}>Bob is shaking things up…</Text>
        </View>
      )}

      {recipe && (
        <View style={styles.card}>
          <View style={styles.heroWrap}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.hero} resizeMode="cover" />
            ) : (
              <View style={[styles.hero, styles.heroEmpty]}>
                <Text style={{ fontSize: 48 }}>🍸</Text>
                <Text style={styles.heroEmptyText}>Generate an image to bring it to life</Text>
              </View>
            )}
          </View>

          <Text style={styles.name}>{recipe.name}</Text>

          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((i, idx) => (
            <Text key={idx} style={styles.li}>•  {i}</Text>
          ))}

          <Text style={styles.sectionTitle}>Method</Text>
          {recipe.method.map((m, idx) => (
            <Text key={idx} style={styles.li}>{idx + 1}.  {m}</Text>
          ))}

          <Text style={styles.notes}>{recipe.tasting_notes}</Text>

          <View style={styles.tags}>
            {recipe.tags.map((t) => (
              <Chip key={t} label={`#${t}`} tone="peach" />
            ))}
          </View>

          {notes.map((n, i) => (
            <Text key={i} style={styles.compliance}>⚠️  {n}</Text>
          ))}

          <View style={styles.actions}>
            <PrimaryButton
              title={imgLoading ? "Generating…" : imageUrl ? "Regenerate image 🖼️" : "Generate image 🖼️"}
              variant="secondary"
              onPress={onGenerateImage}
              loading={imgLoading}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              title={saved ? "Published ✓" : "Publish 🌍"}
              onPress={onPublish}
              disabled={!!saved}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 20, paddingTop: 64, paddingBottom: 120, gap: 12 },
  h1: { fontSize: 30, fontWeight: "900", color: colors.plum },
  sub: { fontSize: 15, color: colors.ink, opacity: 0.7, lineHeight: 21 },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    minHeight: 100,
    fontSize: 17,
    color: colors.ink,
    textAlignVertical: "top",
  },
  examples: { gap: 8 },
  example: {
    color: colors.plum,
    fontWeight: "700",
    backgroundColor: "rgba(255,177,122,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  loadingCard: { alignItems: "center", gap: 12, paddingVertical: 36 },
  loadingText: { fontSize: 18, fontWeight: "800", color: colors.plum },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 18, gap: 6, marginTop: 6 },
  heroWrap: { borderRadius: radius.md, overflow: "hidden" },
  hero: { width: "100%", height: 200, borderRadius: radius.md },
  heroEmpty: { backgroundColor: colors.peach, alignItems: "center", justifyContent: "center", gap: 8 },
  heroEmptyText: { color: colors.plum, fontWeight: "600" },
  name: { fontSize: 24, fontWeight: "900", color: colors.plum, marginTop: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.plum, marginTop: 12 },
  li: { fontSize: 15, color: colors.ink, lineHeight: 22 },
  notes: { fontSize: 15, fontStyle: "italic", color: colors.ink, opacity: 0.8, marginTop: 12 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  compliance: {
    marginTop: 12,
    fontSize: 13,
    color: colors.plum,
    backgroundColor: "rgba(245,158,11,0.12)",
    padding: 12,
    borderRadius: radius.md,
  },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
});
