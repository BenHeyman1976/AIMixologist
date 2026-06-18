import React from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../theme";

export default function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "dark";
  style?: ViewStyle;
}) {
  const isDisabled = disabled || loading;
  const bg =
    variant === "secondary"
      ? "rgba(255,255,255,0.12)"
      : variant === "dark"
      ? colors.ink
      : colors.coral;
  const fg = variant === "secondary" ? colors.white : colors.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.text, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { fontSize: 16, fontWeight: "800" },
});
