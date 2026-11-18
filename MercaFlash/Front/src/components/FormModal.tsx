// Ventana con un formulario de campos de texto. La usan productos, categorías y sedes.
import React, { ReactNode, useEffect, useState } from "react";
import { KeyboardAvoidingView, KeyboardTypeOptions, Modal, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { Button, Field } from "./ui";

export type Campo = {
  clave: string;
  etiqueta: string;
  obligatorio?: boolean;
  teclado?: KeyboardTypeOptions;
  multilinea?: boolean;
  placeholder?: string;
};

type Valores = Record<string, string>;

export function FormModal({ visible, titulo, campos, valoresIniciales, extra, validar, onCancelar, onGuardar }: {
  visible: boolean;
  titulo: string;
  campos: Campo[];
  valoresIniciales: Valores;
  extra?: ReactNode;                              // contenido adicional debajo de los campos (por ejemplo, categorías)
  validar?: (valores: Valores) => string | null;  // devuelve un mensaje de error o null si todo está bien
  onCancelar: () => void;
  onGuardar: (valores: Valores) => Promise<void>;
}) {
  const [valores, setValores] = useState<Valores>(valoresIniciales);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Cada vez que se abre la ventana, se cargan los valores iniciales
  useEffect(() => {
    if (visible) {
      setValores(valoresIniciales);
      setError(null);
    }
  }, [visible]);

  const guardar = async () => {
    const faltante = campos.find((c) => c.obligatorio && !(valores[c.clave] ?? "").trim());
    if (faltante) { setError(`${faltante.etiqueta} es obligatorio.`); return; }

    const problema = validar ? validar(valores) : null;
    if (problema) { setError(problema); return; }

    setGuardando(true);
    setError(null);
    try {
      await onGuardar(valores);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancelar}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.box}>
          <Text style={styles.titulo}>{titulo}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            {campos.map((c) => (
              <Field
                key={c.clave}
                label={c.obligatorio ? `${c.etiqueta} *` : c.etiqueta}
                value={valores[c.clave] ?? ""}
                onChangeText={(texto) => setValores((v) => ({ ...v, [c.clave]: texto }))}
                keyboardType={c.teclado}
                multiline={c.multilinea}
                placeholder={c.placeholder}
              />
            ))}
            {extra}
            {error !== null && <Text style={styles.error}>{error}</Text>}
          </ScrollView>
          <View style={styles.acciones}>
            <Button label="Cancelar" variant="secondary" onPress={onCancelar} disabled={guardando} grow />
            <Button label={guardando ? "Guardando…" : "Guardar"} onPress={guardar} disabled={guardando} grow />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,.45)", justifyContent: "flex-end" },
  box: { backgroundColor: colors.fondo, padding: 18, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
  titulo: { fontSize: 21, fontWeight: "900", color: colors.texto, marginBottom: 14 },
  error: { color: colors.peligro, fontWeight: "700", marginBottom: 8 },
  acciones: { flexDirection: "row", gap: 10, marginTop: 8 }
});
