// Consultas reutilizables de pedidos para la tienda web y el panel del personal.
// Usa las tablas del equipo: pedido, sede, detalle_pedido y producto.
// Por defecto lee con la conexión de LECTURA. Después de escribir (por ejemplo al crear un
// pedido) se le pasa la conexión de escritura para leer justo lo que se acaba de guardar.
const poolLectura = require("../config/db.lectura");

// El código que ve el cliente es "MF-" + el id del pedido (ej: pedido 57 -> MF-57)
const codigoDePedido = (id) => "MF-" + id;
function idDeCodigo(codigo) {
  const m = /^MF-(\d{1,9})$/.exec(String(codigo));
  return m ? Number(m[1]) : null;
}

// En la base de datos el estado es texto libre ("Pendiente", "Listo", "Cancelado").
// La API siempre responde uno de estos tres: "pendiente", "listo" o "cancelado".
const ESTADOS = ["pendiente", "listo", "cancelado"];
function normalizarEstado(estado) {
  const e = String(estado).toLowerCase();
  return e === "listo" || e === "cancelado" ? e : "pendiente";
}

// Condición SQL para filtrar por estado (para el panel del personal)
function filtroPorEstado(estado) {
  if (estado === "listo" || estado === "cancelado") {
    return { where: "WHERE LOWER(p.estado) = ?", params: [estado] };
  }
  return { where: "WHERE LOWER(p.estado) NOT IN ('listo', 'cancelado')", params: [] }; // pendiente
}

// Devuelve pedidos con su sede y sus productos. `where` y `params` filtran cuáles.
async function listarPedidos(where = "", params = [], limite = 200, conexion = poolLectura) {
  const [pedidos] = await conexion.query(
    `SELECT p.id_pedido, p.fecha, p.estado, p.total, s.nombre AS sede
       FROM pedido p
       JOIN sede s ON s.id_sede = p.id_sede
       ${where}
      ORDER BY p.fecha DESC, p.id_pedido DESC
      LIMIT ?`,
    [...params, limite]
  );
  if (pedidos.length === 0) return [];

  const [items] = await conexion.query(
    `SELECT d.id_pedido, pr.nombre, d.precio_unitario, d.cantidad
       FROM detalle_pedido d
       JOIN producto pr ON pr.id_producto = d.id_producto
      WHERE d.id_pedido IN (?)
      ORDER BY d.id_detalle`,
    [pedidos.map((p) => p.id_pedido)]
  );

  const porPedido = new Map();
  for (const it of items) {
    if (!porPedido.has(it.id_pedido)) porPedido.set(it.id_pedido, []);
    porPedido.get(it.id_pedido).push({
      nombre: it.nombre,
      precio: Number(it.precio_unitario), // DECIMAL llega como texto, lo pasamos a número
      cantidad: it.cantidad,
    });
  }

  return pedidos.map((p) => ({
    codigo: codigoDePedido(p.id_pedido),
    creadoEn: p.fecha,
    estado: normalizarEstado(p.estado),
    total: Number(p.total),
    sede: p.sede,
    items: porPedido.get(p.id_pedido) || [],
  }));
}

module.exports = { listarPedidos, codigoDePedido, idDeCodigo, ESTADOS, filtroPorEstado };
