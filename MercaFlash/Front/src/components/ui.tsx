// Componentes pequeños y reutilizables de la interfaz
import React from "react";
import { KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

type Variante = "primary" | "secondary" | "danger";

export function Button({ label, onPress, variant = "primary", disabled = false, small = false, grow = false }: {
  label: string;
  onPress: () => void;
  variant?: Variante;
  disabled?: boolean;
  small?: boolean;
  grow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, small && styles.buttonSmall, grow && styles.grow, styles[variant], disabled && styles.disabled]}
    >
      <Text style={[styles.buttonText, variant === "secondary" && styles.buttonTextDark, variant === "danger" && styles.buttonTextDanger]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={active ? styles.chipTextActive : styles.chipText}>{label}</Text>
    </Pressable>
  );
}

type Tono = "aviso" | "ok" | "peligro" | "neutro";

export function Badge({ texto, tono }: { texto: string; tono: Tono }) {
  return (
    <Text style={[styles.badge, styles[`badge_${tono}`]]}>{texto}</Text>
  );
}

export function Title({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.titleBox}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{subtitle}</Text>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}

export function Field({ label, value, onChangeText, keyboardType, multiline = false, placeholder }: {
  label: string;
  value: string;
  onChangeText: (texto: string) => void;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        style={[styles.input, multiline && styles.inputMultiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  buttonSmall: { paddingVertical: 8, paddingHorizontal: 11, borderRadius: 10 },
  grow: { flex: 1 },
  primary: { backgroundColor: colors.primario, borderColor: colors.primario },
  secondary: { backgroundColor: colors.superficie, borderColor: colors.bordeFuerte },
  danger: { backgroundColor: colors.superficie, borderColor: colors.peligro },
  disabled: { opacity: 0.45 },
  buttonText: { color: "#FFF", fontWeight: "800" },
  buttonTextDark: { color: colors.texto },
  buttonTextDanger: { color: colors.peligro },

  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.bordeFuerte, backgroundColor: colors.superficie },
  chipActive: { backgroundColor: colors.primario, borderColor: colors.primario },
  chipText: { color: "#3E4942", fontWeight: "600" },
  chipTextActive: { color: "#FFF", fontWeight: "700" },

  badge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, overflow: "hidden", fontSize: 11, fontWeight: "800", color: colors.texto },
  badge_aviso: { backgroundColor: colors.avisoFondo },
  badge_ok: { backgroundColor: colors.okFondo },
  badge_peligro: { backgroundColor: colors.peligroFondo, color: colors.peligro },
  badge_neutro: { backgroundColor: colors.grisFondo },

  titleBox: { marginBottom: 14 },
  title: { fontSize: 25, fontWeight: "800", color: colors.texto, marginBottom: 4 },
  muted: { color: colors.textoSuave },
  empty: { padding: 28, backgroundColor: colors.superficie, borderRadius: 16, alignItems: "center" },

  field: { marginBottom: 12 },
  fieldLabel: { fontWeight: "700", color: "#465049", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.bordeFuerte, borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: colors.superficie },
  inputMultiline: { minHeight: 72, textAlignVertical: "top" }
});
