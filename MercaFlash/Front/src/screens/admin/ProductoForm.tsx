// Formulario para crear o editar un producto.
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Campo, FormModal } from "../../components/FormModal";
import { Chip } from "../../components/ui";
import { colors } from "../../theme";
import type { AdminProduct, Categoria, ProductoDatos } from "../../types";

const ICONO_POR_DEFECTO = "🛒";

const CAMPOS: Campo[] = [
  { clave: "nombre", etiqueta: "Nombre", obligatorio: true },
  { clave: "icono", etiqueta: "Emoji", placeholder: ICONO_POR_DEFECTO },
  { clave: "precio", etiqueta: "Precio (COP)", obligatorio: true, teclado: "numeric" },
  { clave: "stock", etiqueta: "Stock", obligatorio: true, teclado: "number-pad" },
  { clave: "descripcion", etiqueta: "Descripción", multilinea: true }
];

export function ProductoForm({ visible, producto, categorias, onCancelar, onGuardar }: {
  visible: boolean;
  producto: AdminProduct | null;      // null = crear uno nuevo
  categorias: Categoria[];
  onCancelar: () => void;
  onGuardar: (datos: ProductoDatos) => Promise<void>;
}) {
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  useEffect(() => {
    if (visible) setCategoriaId(producto?.id_categoria ?? categorias[0]?.id_categoria ?? null);
  }, [visible]);

  const valoresIniciales = {
    nombre: producto?.nombre ?? "",
    icono: producto?.icono ?? ICONO_POR_DEFECTO,
    precio: producto ? String(producto.precio) : "",
    stock: producto ? String(producto.stock) : "0",
    descripcion: producto?.descripcion ?? ""
  };

  const validar = (v: Record<string, string>): string | null => {
    const precio = Number(v.precio.replace(",", "."));
    if (!Number.isFinite(precio) || precio < 0) return "El precio debe ser un número mayor o igual a 0.";
    const stock = Number(v.stock);
    if (!Number.isInteger(stock) || stock < 0) return "El stock debe ser un número entero mayor o igual a 0.";
    if ([...v.icono.trim()].length > 16) return "El emoji es demasiado largo.";
    if (categoriaId === null) return "Selecciona una categoría.";
    return null;
  };

  const guardar = async (v: Record<string, string>) => {
    if (categoriaId === null) return;
    await onGuardar({
      nombre: v.nombre.trim(),
      descripcion: v.descripcion.trim(),
      precio: Number(v.precio.replace(",", ".")),
      stock: Number(v.stock),
      id_categoria: categoriaId,
      icono: v.icono.trim() || ICONO_POR_DEFECTO
    });
  };

  const selectorCategoria = (
    <View style={styles.bloque}>
      <Text style={styles.etiqueta}>Categoría *</Text>
      {categorias.length === 0 ? (
        <Text style={styles.aviso}>Primero crea una categoría en la pestaña Categorías.</Text>
      ) : (
        <View style={styles.categorias}>
          {categorias.map((c) => (
            <Chip key={c.id_categoria} label={c.nombre} active={categoriaId === c.id_categoria} onPress={() => setCategoriaId(c.id_categoria)} />
          ))}
        </View>
      )}
    </View>
  );

  return (
    <FormModal
      visible={visible}
      titulo={producto ? "Editar producto" : "Nuevo producto"}
      campos={CAMPOS}
      valoresIniciales={valoresIniciales}
      extra={selectorCategoria}
      validar={validar}
      onCancelar={onCancelar}
      onGuardar={guardar}
    />
  );
}

const styles = StyleSheet.create({
  bloque: { marginBottom: 12 },
  etiqueta: { fontWeight: "700", color: "#465049", marginBottom: 6 },
  categorias: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  aviso: { color: colors.peligro }
});
