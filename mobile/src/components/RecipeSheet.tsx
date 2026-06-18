import React from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { Cocktail } from "../types";
import { colors, radius } from "../theme";
import Chip from "./Chip";
import { complianceNotes } from "../api/client";
import { isShoppable, retailerLinks } from "../lib/affiliates";

// Bottom sheet showing the full recipe + "shop the ingredients" affiliate links.
export default function RecipeSheet({
  cocktail,
  visible,
  onClose,
}: {
  cocktail: Cocktail | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!cocktail) return null;
  const notes = complianceNotes(cocktail);
  const shoppable = cocktail.ingredients.filter(isShoppable);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Pressable style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {cocktail.image_url && (
              <Image source={{ uri: cocktail.image_url }} style={styles.hero} resizeMode="cover" />
            )}
            <Text style={styles.name}>{cocktail.name}</Text>
            <Text style={styles.creator}>@{cocktail.creator_username} · {cocktail.occasion}</Text>

            <Section title="Ingredients">
              {cocktail.ingredients.map((ing, i) => (
                <Text key={i} style={styles.li}>•  {ing}</Text>
              ))}
            </Section>

            <Section title="Method">
              {cocktail.method.map((step, i) => (
                <Text key={i} style={styles.li}>{i + 1}.  {step}</Text>
              ))}
            </Section>

            <View style={styles.factRow}>
              <Fact label="Garnish" value={cocktail.garnish} />
              <Fact label="Glassware" value={cocktail.glassware} />
            </View>

            <Section title="Tasting notes">
              <Text style={styles.notesText}>{cocktail.tasting_notes}</Text>
            </Section>

            {/* Shop the ingredients (affiliate) */}
            {shoppable.length > 0 && (
              <Section title="🛒 Shop the ingredients">
                {shoppable.map((ing, i) => (
                  <View key={i} style={styles.shopRow}>
                    <Text style={styles.shopName}>{ing}</Text>
                    <View style={styles.shopLinks}>
                      {retailerLinks(ing).map((r) => (
                        <Pressable key={r.name} onPress={() => Linking.openURL(r.url)}>
                          <Chip label={r.name} tone="peach" />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
                <Text style={styles.disclosure}>
                  We may earn a small commission, at no extra cost to you.
                </Text>
              </Section>
            )}

            {notes.map((n, i) => (
              <Text key={i} style={styles.compliance}>⚠️  {n}</Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={{ marginTop: 8, gap: 6 }}>{children}</View>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label.toUpperCase()}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
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
    maxHeight: "92%",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignSelf: "center",
    marginBottom: 8,
  },
  close: { position: "absolute", right: 16, top: 12, zIndex: 2 },
  closeText: { fontSize: 20, color: colors.plum },
  hero: { width: "100%", height: 220, borderRadius: radius.md, marginTop: 6 },
  name: { fontSize: 26, fontWeight: "900", color: colors.plum, marginTop: 14 },
  creator: { fontSize: 14, color: colors.ink, opacity: 0.6, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: colors.plum },
  li: { fontSize: 15, color: colors.ink, lineHeight: 22 },
  notesText: { fontSize: 15, fontStyle: "italic", color: colors.ink, opacity: 0.85 },
  factRow: { flexDirection: "row", gap: 12, marginTop: 18 },
  fact: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 12 },
  factLabel: { fontSize: 11, fontWeight: "700", color: colors.ink, opacity: 0.5 },
  factValue: { fontSize: 14, color: colors.ink, marginTop: 4 },
  shopRow: { marginBottom: 10 },
  shopName: { fontSize: 14, color: colors.ink, marginBottom: 6 },
  shopLinks: { flexDirection: "row", gap: 8 },
  disclosure: { fontSize: 12, color: colors.ink, opacity: 0.5, marginTop: 6 },
  compliance: {
    marginTop: 16,
    fontSize: 13,
    color: colors.plum,
    backgroundColor: "rgba(245,158,11,0.12)",
    padding: 12,
    borderRadius: radius.md,
  },
});
