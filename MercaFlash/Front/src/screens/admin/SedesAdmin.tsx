// Sedes (puntos de recogida) del administrador: crear, editar y eliminar.
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Campo, FormModal } from "../../components/FormModal";
import { Button, Empty } from "../../components/ui";
import { adminApi } from "../../services/admin";
import { esSesionVencida } from "../../services/api";
import { colors } from "../../theme";
import type { SedeAdmin } from "../../types";
import type { SeccionProps } from "./types";

const CAMPOS: Campo[] = [
  { clave: "nombre", etiqueta: "Nombre", obligatorio: true },
  { clave: "direccion", etiqueta: "Dirección", obligatorio: true },
  { clave: "ciudad", etiqueta: "Ciudad", obligatorio: true },
  { clave: "horario", etiqueta: "Horario", placeholder: "Lunes a sábado, 8:00 a 20:00" }
];

export function SedesAdmin({ token, alFallar }: SeccionProps) {
  const [sedes, setSedes] = useState<SedeAdmin[]>([]);
  const [formulario, setFormulario] = useState<{ abierto: boolean; sede: SedeAdmin | null }>({ abierto: false, sede: null });
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setSedes(await adminApi.sedes());
    } catch (e) {
      alFallar(e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [alFallar]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (v: Record<string, string>) => {
    const datos = {
      nombre: v.nombre.trim(),
      direccion: v.direccion.trim(),
      ciudad: v.ciudad.trim(),
      horario: (v.horario ?? "").trim()
    };
    try {
      if (formulario.sede) await adminApi.editarSede(token, formulario.sede.id_sede, datos);
      else await adminApi.crearSede(token, datos);
    } catch (e) {
      if (esSesionVencida(e)) { alFallar(e); return; }
      throw e;
    }
    setFormulario({ abierto: false, sede: null });
    await cargar();
  };

  const eliminar = (s: SedeAdmin) => {
    Alert.alert(
      "Eliminar sede",
      `¿Eliminar "${s.nombre}"? Solo se puede si no tiene pedidos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await adminApi.eliminarSede(token, s.id_sede);
              await cargar();
            } catch (e) {
              alFallar(e);
            }
          }
        }
      ]
    );
  };

  const sede = formulario.sede;

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      >
        <Button label="+ Nueva sede" onPress={() => setFormulario({ abierto: true, sede: null })} />

        <View style={styles.lista}>
          {cargando ? (
            <ActivityIndicator size="large" />
          ) : sedes.length === 0 ? (
            <Empty text="Todavía no hay sedes." />
          ) : (
            sedes.map((s) => (
              <View key={s.id_sede} style={styles.tarjeta}>
                <Text style={styles.nombre}>{s.nombre}</Text>
                <Text style={styles.suave}>{s.direccion} · {s.ciudad}</Text>
                {s.horario ? <Text style={styles.suave}>{s.horario}</Text> : null}
                <View style={styles.acciones}>
                  <Button label="Editar" variant="secondary" small grow onPress={() => setFormulario({ abierto: true, sede: s })} />
                  <Button label="Eliminar" variant="danger" small grow onPress={() => eliminar(s)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FormModal
        visible={formulario.abierto}
        titulo={sede ? "Editar sede" : "Nueva sede"}
        campos={CAMPOS}
        valoresIniciales={{
          nombre: sede?.nombre ?? "",
          direccion: sede?.direccion ?? "",
          ciudad: sede?.ciudad ?? "",
          horario: sede?.horario ?? ""
        }}
        onCancelar={() => setFormulario({ abierto: false, sede: null })}
        onGuardar={guardar}
      />
    </>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 14, paddingBottom: 40 },
  lista: { marginTop: 14 },
  tarjeta: { backgroundColor: colors.superficie, padding: 14, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: colors.borde },
  nombre: { fontSize: 16, fontWeight: "800", color: "#27372F" },
  suave: { color: colors.textoSuave, marginTop: 2 },
  acciones: { flexDirection: "row", gap: 8, marginTop: 12 }
});
