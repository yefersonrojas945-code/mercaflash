// Pedidos del administrador: filtrar por estado, marcar como listo y cancelar.
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { OrderCard } from "../../components/OrderCard";
import { Chip, Empty } from "../../components/ui";
import { adminApi } from "../../services/admin";
import type { Order, OrderStatus } from "../../types";
import type { SeccionProps } from "./types";

type Filtro = "todos" | OrderStatus;

const FILTROS: { clave: Filtro; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "pendiente", etiqueta: "Pendientes" },
  { clave: "listo", etiqueta: "Listos" },
  { clave: "cancelado", etiqueta: "Cancelados" }
];

export function PedidosAdmin({ token, alFallar }: SeccionProps) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setPedidos(await adminApi.pedidos(token, filtro === "todos" ? undefined : filtro));
    } catch (e) {
      alFallar(e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [token, filtro, alFallar]);

  useEffect(() => {
    setCargando(true);
    cargar();
  }, [cargar]);

  const ejecutar = async (codigo: string, accion: () => Promise<unknown>) => {
    setProcesando(codigo);
    try {
      await accion();
      await cargar();
    } catch (e) {
      alFallar(e);
    } finally {
      setProcesando(null);
    }
  };

  const marcarListo = (codigo: string) => ejecutar(codigo, () => adminApi.marcarListo(token, codigo));

  const cancelar = (codigo: string) => {
    Alert.alert(
      "Cancelar pedido",
      `¿Cancelar el pedido ${codigo}? Los productos volverán al stock y el pago se marcará como reembolsado.`,
      [
        { text: "No", style: "cancel" },
        { text: "Sí, cancelar", style: "destructive", onPress: () => ejecutar(codigo, () => adminApi.cancelarPedido(token, codigo)) }
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.contenido}
      refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
    >
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Chip key={f.clave} label={f.etiqueta} active={filtro === f.clave} onPress={() => setFiltro(f.clave)} />
        ))}
      </View>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : pedidos.length === 0 ? (
        <Empty text="No hay pedidos con este filtro." />
      ) : (
        pedidos.map((o) => (
          <OrderCard
            key={o.codigo}
            order={o}
            staff
            ocupado={procesando === o.codigo}
            onReady={() => marcarListo(o.codigo)}
            onCancel={() => cancelar(o.codigo)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 14, paddingBottom: 40 },
  filtros: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }
});
