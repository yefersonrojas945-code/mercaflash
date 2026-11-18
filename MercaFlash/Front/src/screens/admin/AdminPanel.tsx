// Panel del administrador. Secciones: pedidos y productos (categorías y sedes se agregan en la siguiente parte).
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, Chip } from "../../components/ui";
import { esSesionVencida } from "../../services/api";
import { colors } from "../../theme";
import { PedidosAdmin } from "./PedidosAdmin";
import { ProductosAdmin } from "./ProductosAdmin";

type Seccion = "pedidos" | "productos";

const SECCIONES: { clave: Seccion; etiqueta: string }[] = [
  { clave: "pedidos", etiqueta: "Pedidos" },
  { clave: "productos", etiqueta: "Productos" }
];

export function AdminPanel({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [seccion, setSeccion] = useState<Seccion>("pedidos");

  // Un solo lugar para manejar los errores de la API en todas las secciones
  const alFallar = useCallback((error: unknown) => {
    if (esSesionVencida(error)) {
      Alert.alert("Sesión del personal", "Tu sesión venció. Ingresa el PIN de nuevo.");
      onLogout();
      return;
    }
    Alert.alert("Error", error instanceof Error ? error.message : "Ocurrió un error inesperado.");
  }, [onLogout]);

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>Panel del personal</Text>
        <Button label="Cerrar sesión" variant="secondary" small onPress={onLogout} />
      </View>

      <View style={styles.pestanas}>
        {SECCIONES.map((s) => (
          <Chip key={s.clave} label={s.etiqueta} active={seccion === s.clave} onPress={() => setSeccion(s.clave)} />
        ))}
      </View>

      {seccion === "pedidos" && <PedidosAdmin token={token} alFallar={alFallar} />}
      {seccion === "productos" && <ProductosAdmin token={token} alFallar={alFallar} />}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  encabezado: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingTop: 12 },
  titulo: { fontSize: 22, fontWeight: "800", color: colors.texto },
  pestanas: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 14, paddingVertical: 12 }
});
