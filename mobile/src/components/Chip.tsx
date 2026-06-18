import React from "react";
import { Text, View, StyleSheet, ViewStyle } from "react-native";
import { colors, radius } from "../theme";

export default function Chip({
  label,
  tone = "glass",
  style,
}: {
  label: string;
  tone?: "glass" | "coral" | "peach";
  style?: ViewStyle;
}) {
  const bg =
    tone === "coral" ? colors.coral : tone === "peach" ? "rgba(255,177,122,0.25)" : colors.glass;
  const fg = tone === "coral" ? colors.white : tone === "peach" ? colors.plum : colors.white;
  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "700" },
});
