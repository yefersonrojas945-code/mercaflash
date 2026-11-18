// Llamadas a la API del panel del administrador. Todas (menos listar categorías y sedes)
// necesitan el token que devuelve el login del personal.
import { api } from "./api";
import type {
  AdminProduct, Categoria, CategoriaDatos, Order, OrderStatus, ProductoDatos, SedeAdmin, SedeDatos
} from "../types";

const enviar = (token: string, method: string, body?: unknown) => ({ token, method, body });

export const adminApi = {
  // ---- Pedidos ----
  pedidos: (token: string, estado?: OrderStatus) =>
    api<Order[]>(`/personal/pedidos${estado ? `?estado=${estado}` : ""}`, { token }),
  marcarListo: (token: string, codigo: string) =>
    api<Order>(`/personal/pedidos/${encodeURIComponent(codigo)}/listo`, enviar(token, "PATCH")),
  cancelarPedido: (token: string, codigo: string) =>
    api<Order>(`/personal/pedidos/${encodeURIComponent(codigo)}/cancelar`, enviar(token, "PATCH")),

  // ---- Productos ----
  productos: (token: string) => api<AdminProduct[]>("/personal/productos", { token }),
  crearProducto: (token: string, datos: ProductoDatos) =>
    api<unknown>("/productos", enviar(token, "POST", { ...datos, imagen: "" })),
  editarProducto: (token: string, id: number, datos: Partial<ProductoDatos>) =>
    api<unknown>(`/productos/${id}`, enviar(token, "PATCH", datos)),
  activarProducto: (token: string, id: number, activo: boolean) =>
    api<unknown>(`/productos/${id}/activo`, enviar(token, "PATCH", { activo })),
  eliminarProducto: (token: string, id: number) =>
    api<unknown>(`/productos/${id}`, enviar(token, "DELETE")),

  // ---- Categorías ----
  categorias: () => api<Categoria[]>("/categorias"),
  crearCategoria: (token: string, datos: CategoriaDatos) =>
    api<unknown>("/categorias", enviar(token, "POST", datos)),
  editarCategoria: (token: string, id: number, datos: CategoriaDatos) =>
    api<unknown>(`/categorias/${id}`, enviar(token, "PUT", datos)),
  eliminarCategoria: (token: string, id: number) =>
    api<unknown>(`/categorias/${id}`, enviar(token, "DELETE")),

  // ---- Sedes ----
  sedes: () => api<SedeAdmin[]>("/sedes"),
  crearSede: (token: string, datos: SedeDatos) =>
    api<unknown>("/sedes", enviar(token, "POST", datos)),
  editarSede: (token: string, id: number, datos: SedeDatos) =>
    api<unknown>(`/sedes/${id}`, enviar(token, "PUT", datos)),
  eliminarSede: (token: string, id: number) =>
    api<unknown>(`/sedes/${id}`, enviar(token, "DELETE"))
};
