// Productos del administrador: buscar, crear, editar, ajustar el stock, desactivar y eliminar.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Badge, Button, Chip, Empty } from "../../components/ui";
import { adminApi } from "../../services/admin";
import { esSesionVencida } from "../../services/api";
import { colors } from "../../theme";
import type { AdminProduct, Categoria, ProductoDatos } from "../../types";
import { money } from "../../utils/format";
import { ProductoForm } from "./ProductoForm";
import type { SeccionProps } from "./types";

type Filtro = "todos" | "activos" | "desactivados";

const FILTROS: { clave: Filtro; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "activos", etiqueta: "Activos" },
  { clave: "desactivados", etiqueta: "Desactivados" }
];

const STOCK_BAJO = 5;

export function ProductosAdmin({ token, alFallar }: SeccionProps) {
  const [productos, setProductos] = useState<AdminProduct[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [formulario, setFormulario] = useState<{ abierto: boolean; producto: AdminProduct | null }>({ abierto: false, producto: null });
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([adminApi.productos(token), adminApi.categorias()]);
      setProductos(prods);
      setCategorias(cats);
    } catch (e) {
      alFallar(e);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [token, alFallar]);

  useEffect(() => { cargar(); }, [cargar]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const cumpleFiltro = filtro === "todos" || (filtro === "activos") === p.activo;
      const cumpleBusqueda = texto === "" || p.nombre.toLowerCase().includes(texto) || p.categoria.toLowerCase().includes(texto);
      return cumpleFiltro && cumpleBusqueda;
    });
  }, [productos, busqueda, filtro]);

  const actualizarLocal = (id: number, cambios: Partial<AdminProduct>) =>
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)));

  // Ejecuta una acción sobre un producto bloqueando sus botones mientras espera la respuesta
  const ejecutar = async (id: number, accion: () => Promise<void>) => {
    setOcupado(id);
    try {
      await accion();
    } catch (e) {
      alFallar(e);
    } finally {
      setOcupado(null);
    }
  };

  const cambiarStock = (p: AdminProduct, delta: number) => {
    const nuevo = Math.max(0, p.stock + delta);
    if (nuevo === p.stock) return;
    ejecutar(p.id, async () => {
      await adminApi.editarProducto(token, p.id, { stock: nuevo });
      actualizarLocal(p.id, { stock: nuevo });
    });
  };

  const alternarActivo = (p: AdminProduct) =>
    ejecutar(p.id, async () => {
      await adminApi.activarProducto(token, p.id, !p.activo);
      actualizarLocal(p.id, { activo: !p.activo });
    });

  const eliminar = (p: AdminProduct) => {
    Alert.alert(
      "Eliminar producto",
      `¿Eliminar "${p.nombre}"? Solo se puede si nunca se vendió; si ya salió en pedidos, desactívalo.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => ejecutar(p.id, async () => {
            await adminApi.eliminarProducto(token, p.id);
            setProductos((prev) => prev.filter((x) => x.id !== p.id));
          })
        }
      ]
    );
  };

  const guardarFormulario = async (datos: ProductoDatos) => {
    try {
      if (formulario.producto) await adminApi.editarProducto(token, formulario.producto.id, datos);
      else await adminApi.crearProducto(token, datos);
    } catch (e) {
      if (esSesionVencida(e)) { alFallar(e); return; }
      throw e; // el formulario muestra el mensaje de error
    }
    setFormulario({ abierto: false, producto: null });
    await cargar();
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />}
      >
        <Button label="+ Nuevo producto" onPress={() => setFormulario({ abierto: true, producto: null })} />

        <TextInput
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar por nombre o categoría"
          style={styles.busqueda}
        />
        <View style={styles.filtros}>
          {FILTROS.map((f) => (
            <Chip key={f.clave} label={f.etiqueta} active={filtro === f.clave} onPress={() => setFiltro(f.clave)} />
          ))}
        </View>

        {cargando ? (
          <ActivityIndicator size="large" />
        ) : visibles.length === 0 ? (
          <Empty text="No hay productos para mostrar." />
        ) : (
          visibles.map((p) => (
            <View key={p.id} style={[styles.tarjeta, !p.activo && styles.inactivo]}>
              <View style={styles.fila}>
                <Text style={styles.icono}>{p.icono}</Text>
                <View style={styles.grow}>
                  <Text style={styles.nombre}>{p.nombre}</Text>
                  <Text style={styles.suave}>{p.categoria} · {money(p.precio)}</Text>
                </View>
                {!p.activo && <Badge texto="Desactivado" tono="neutro" />}
              </View>

              <View style={styles.filaStock}>
                <View style={styles.stockInfo}>
                  <Text style={styles.suave}>Stock: </Text>
                  <Text style={styles.stock}>{p.stock}</Text>
                  {p.stock === 0 ? <Badge texto="Agotado" tono="peligro" /> : p.stock <= STOCK_BAJO ? <Badge texto="Poco stock" tono="aviso" /> : null}
                </View>
                <View style={styles.ajustes}>
                  <Button label="−1" variant="secondary" small disabled={ocupado === p.id || p.stock === 0} onPress={() => cambiarStock(p, -1)} />
                  <Button label="+1" variant="secondary" small disabled={ocupado === p.id} onPress={() => cambiarStock(p, 1)} />
                  <Button label="+10" variant="secondary" small disabled={ocupado === p.id} onPress={() => cambiarStock(p, 10)} />
                </View>
              </View>

              <View style={styles.acciones}>
                <Button label="Editar" variant="secondary" small grow disabled={ocupado === p.id} onPress={() => setFormulario({ abierto: true, producto: p })} />
                <Button label={p.activo ? "Desactivar" : "Activar"} variant="secondary" small grow disabled={ocupado === p.id} onPress={() => alternarActivo(p)} />
                <Button label="Eliminar" variant="danger" small grow disabled={ocupado === p.id} onPress={() => eliminar(p)} />
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <ProductoForm
        visible={formulario.abierto}
        producto={formulario.producto}
        categorias={categorias}
        onCancelar={() => setFormulario({ abierto: false, producto: null })}
        onGuardar={guardarFormulario}
      />
    </>
  );
}

const styles = StyleSheet.create({
  contenido: { paddingHorizontal: 14, paddingBottom: 40 },
  busqueda: { borderWidth: 1, borderColor: colors.bordeFuerte, borderRadius: 12, padding: 12, fontSize: 16, backgroundColor: colors.superficie, marginTop: 12 },
  filtros: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 12 },
  tarjeta: { backgroundColor: colors.superficie, padding: 14, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: colors.borde },
  inactivo: { opacity: 0.6 },
  fila: { flexDirection: "row", alignItems: "center", gap: 10 },
  grow: { flex: 1 },
  icono: { fontSize: 32 },
  nombre: { fontSize: 15, fontWeight: "800", color: "#27372F" },
  suave: { color: colors.textoSuave },
  filaStock: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginTop: 12 },
  stockInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  stock: { fontWeight: "900", fontSize: 16, color: colors.texto },
  ajustes: { flexDirection: "row", gap: 6 },
  acciones: { flexDirection: "row", gap: 8, marginTop: 12 }
});
