export type Product = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  icono: string;
  stock: number;
};

export type Sede = { id: number; nombre: string };
export type Cart = Record<number, number>;

export type OrderItem = {
  nombre: string;
  cantidad: number;
  precio: number;
};

export type OrderStatus = "pendiente" | "listo" | "cancelado";

export type Order = {
  codigo: string;
  sede: string;
  estado: OrderStatus;
  total: number;
  creadoEn?: string;
  items: OrderItem[];
};

// ---- Administración (panel del personal) ----

// Producto tal como lo devuelve GET /api/personal/productos (incluye los desactivados)
export type AdminProduct = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number;
  imagen: string | null;
  icono: string;
  activo: boolean;
  id_categoria: number;
  categoria: string;
};

// Datos que el administrador puede escribir al crear o editar un producto
export type ProductoDatos = {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  id_categoria: number;
  icono: string;
};

export type Categoria = {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
};
export type CategoriaDatos = { nombre: string; descripcion: string };

export type SedeAdmin = {
  id_sede: number;
  nombre: string;
  direccion: string;
  ciudad: string;
  horario: string | null;
};
export type SedeDatos = { nombre: string; direccion: string; ciudad: string; horario: string };
