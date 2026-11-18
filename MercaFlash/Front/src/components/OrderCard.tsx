// Tarjeta de un pedido. La usan "Mis pedidos" (cliente) y el panel del personal.
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Order, OrderStatus } from "../types";
import { colors } from "../theme";
import { money } from "../utils/format";
import { Badge, Button } from "./ui";

const ESTADOS: Record<OrderStatus, { texto: string; tono: "aviso" | "ok" | "peligro" }> = {
  pendiente: { texto: "Pendiente", tono: "aviso" },
  listo: { texto: "Listo", tono: "ok" },
  cancelado: { texto: "Cancelado", tono: "peligro" }
};

export function OrderCard({ order, staff = false, ocupado = false, onReady, onCancel }: {
  order: Order;
  staff?: boolean;
  ocupado?: boolean;
  onReady?: () => void;
  onCancel?: () => void;
}) {
  const estado = ESTADOS[order.estado] ?? ESTADOS.pendiente;

  return (
    <View style={styles.order}>
      <View style={styles.top}>
        <View style={styles.grow}>
          <Text style={styles.codigo}>{order.codigo}</Text>
          <Text style={styles.muted}>
            {order.sede}
            {order.creadoEn ? ` · ${new Date(order.creadoEn).toLocaleString("es-CO")}` : ""}
          </Text>
        </View>
        <Badge texto={estado.texto} tono={estado.tono} />
      </View>

      {order.items.map((it, i) => (
        <View key={`${it.nombre}-${i}`} style={styles.itemLine}>
          <Text style={styles.itemText}>{it.cantidad}× {it.nombre}</Text>
          <Text style={styles.itemText}>{money(it.precio * it.cantidad)}</Text>
        </View>
      ))}
      <Text style={styles.total}>Total: {money(order.total)}</Text>

      {staff && order.estado !== "cancelado" && (
        <View style={styles.actions}>
          {order.estado === "pendiente" && onReady && (
            <Button label="Marcar como listo" onPress={onReady} disabled={ocupado} grow />
          )}
          {onCancel && <Button label="Cancelar pedido" variant="danger" onPress={onCancel} disabled={ocupado} grow />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  order: { backgroundColor: colors.superficie, padding: 15, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: colors.borde },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 },
  grow: { flex: 1 },
  codigo: { fontSize: 15, fontWeight: "800", color: "#27372F" },
  muted: { color: colors.textoSuave },
  itemLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#F0ECE4" },
  itemText: { color: colors.texto },
  total: { fontWeight: "900", textAlign: "right", marginTop: 9, color: colors.primario },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 }
});
