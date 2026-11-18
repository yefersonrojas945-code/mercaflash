// Categorías del administrador: crear, editar y eliminar.
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Campo, FormModal } from "../../components/FormModal";
import { Button, Empty } from "../../components/ui";
import { adminApi } from "../../services/admin";
import { esSesionVencida } from "../../services/api";
import { colors } from "../../theme";
import type { Categoria } from "../../types";
import type { SeccionProps } from "./types";

const CAMPOS: Campo[] = [
  { clave: "nombre", etiqueta: "Nombre", obligatorio: true },
  { clave: "descripcion", etiqueta: "Descripción", multilinea: true }
];

export function CategoriasAdmin({ token, alFallar }: SeccionProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [formulario, setFormulario] = useState<{ abierto: boolean; categoria: Categoria | null }>({ abierto: false, categoria: null });
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setCategorias(await adminApi.categorias());
    } catch (e) {
      alFallar(e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [alFallar]);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async (v: Record<string, string>) => {
    const datos = { nombre: v.nombre.trim(), descripcion: (v.descripcion ?? "").trim() };
    try {
      if (formulario.categoria) await adminApi.editarCategoria(token, formulario.categoria.id_categoria, datos);
      else await adminApi.crearCategoria(token, datos);
    } catch (e) {
      if (esSesionVencida(e)) { alFallar(e); return; }
      throw e;
    }
    setFormulario({ abierto: false, categoria: null });
    await cargar();
  };

  const eliminar = (c: Categoria) => {
    Alert.alert(
      "Eliminar categoría",
      `¿Eliminar "${c.nombre}"? Solo se puede si no tiene productos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await adminApi.eliminarCategoria(token, c.id_categoria);
              await cargar();
            } catch (e) {
              alFallar(e);
            }
          }
        }
      ]
    );
  };

  const cat = formulario.categoria;

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.contenido}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      >
        <Button label="+ Nueva categoría" onPress={() => setFormulario({ abierto: true, categoria: null })} />

        <View style={styles.lista}>
          {cargando ? (
            <ActivityIndicator size="large" />
          ) : categorias.length === 0 ? (
            <Empty text="Todavía no hay categorías." />
          ) : (
            categorias.map((c) => (
              <View key={c.id_categoria} style={styles.tarjeta}>
                <Text style={styles.nombre}>{c.nombre}</Text>
                {c.descripcion ? <Text style={styles.suave}>{c.descripcion}</Text> : null}
                <View style={styles.acciones}>
                  <Button label="Editar" variant="secondary" small grow onPress={() => setFormulario({ abierto: true, categoria: c })} />
                  <Button label="Eliminar" variant="danger" small grow onPress={() => eliminar(c)} />
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <FormModal
        visible={formulario.abierto}
        titulo={cat ? "Editar categoría" : "Nueva categoría"}
        campos={CAMPOS}
        valoresIniciales={{ nombre: cat?.nombre ?? "", descripcion: cat?.descripcion ?? "" }}
        onCancelar={() => setFormulario({ abierto: false, categoria: null })}
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
