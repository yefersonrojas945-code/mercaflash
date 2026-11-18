// Rutas de la tienda web (las usa el frontend del cliente).
//   POST /api/tienda/pedidos                    -> crea un pedido completo (checkout)
//   GET  /api/tienda/pedidos?codigos=MF-5,MF-6  -> consulta pedidos por código
//
// El checkout hace en UNA sola transacción lo que antes serían varias llamadas sueltas:
// crear pedido + detalle_pedido + pago y descontar el stock. Si algo falla, no se guarda nada.
// Los precios salen de la base de datos, no del navegador.
const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const pool = require("../config/db");
const { listarPedidos, codigoDePedido, idDeCodigo } = require("../services/pedidos");
const router = express.Router();

const CORREO_INVITADO = "cliente.web@mercaflash.local";

// Error "esperado" (datos malos, sin stock...) para responder con un mensaje claro
class ErrorNegocio extends Error {
  constructor(mensaje, status = 400) { super(mensaje); this.status = status; }
}

// Mientras la web no tenga registro/login, las compras se asocian a un usuario "Cliente Web"
// (la tabla pedido exige id_usuario). Se crea solo la primera vez.
async function usuarioInvitado(conn) {
  const [filas] = await conn.query("SELECT id_usuario FROM usuario WHERE correo = ?", [CORREO_INVITADO]);
  if (filas.length > 0) return filas[0].id_usuario;
  const hash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10); // contraseña aleatoria: nadie inicia sesión con él
  try {
    const [r] = await conn.query(
      "INSERT INTO usuario (nombre, apellido, correo, contrasena) VALUES ('Cliente', 'Web', ?, ?)",
      [CORREO_INVITADO, hash]
    );
    return r.insertId;
  } catch (err) {
    if (err.code !== "ER_DUP_ENTRY") throw err; // otro cliente lo creó justo ahora: lo leemos
    const [otra] = await conn.query("SELECT id_usuario FROM usuario WHERE correo = ?", [CORREO_INVITADO]);
    return otra[0].id_usuario;
  }
}

// POST /api/tienda/pedidos
// Body: { sedeId: 1, items: [ { productoId: 3, cantidad: 2 }, ... ] }
router.post("/pedidos", async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { sedeId, items } = req.body || {};

    // ---- Validar lo que llega ----
    if (!Number.isInteger(sedeId) || sedeId <= 0) throw new ErrorNegocio("Debes elegir un punto de recogida.");
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      throw new ErrorNegocio("El pedido debe tener entre 1 y 50 productos.");
    }
    const cantidades = new Map(); // productoId -> cantidad (si viene repetido, se suma)
    for (const it of items) {
      if (!it || !Number.isInteger(it.productoId) || it.productoId <= 0 ||
          !Number.isInteger(it.cantidad) || it.cantidad < 1 || it.cantidad > 99) {
        throw new ErrorNegocio("Hay un producto con datos inválidos.");
      }
      cantidades.set(it.productoId, (cantidades.get(it.productoId) || 0) + it.cantidad);
    }

    await conn.beginTransaction();

    // ---- Leer precios y stock reales (FOR UPDATE bloquea esas filas hasta terminar) ----
    const ids = [...cantidades.keys()];
    const [productos] = await conn.query(
      "SELECT id_producto, nombre, precio, stock FROM producto WHERE id_producto IN (?) ORDER BY id_producto FOR UPDATE",
      [ids]
    );
    if (productos.length !== ids.length) throw new ErrorNegocio("Alguno de los productos ya no está disponible.");
    for (const p of productos) {
      if (p.stock < cantidades.get(p.id_producto)) {
        throw new ErrorNegocio(`No hay suficiente stock de "${p.nombre}" (quedan ${p.stock}).`, 409);
      }
    }

    const [sedes] = await conn.query("SELECT id_sede FROM sede WHERE id_sede = ?", [sedeId]);
    if (sedes.length === 0) throw new ErrorNegocio("El punto de recogida no existe.");

    const total = productos.reduce((suma, p) => suma + Number(p.precio) * cantidades.get(p.id_producto), 0);
    const idUsuario = await usuarioInvitado(conn);

    // ---- Guardar: pedido, detalle, stock y pago ----
    const [pedido] = await conn.query(
      "INSERT INTO pedido (estado, total, tipo_compra, id_usuario, id_sede) VALUES ('Pendiente', ?, 'Recogida en tienda', ?, ?)",
      [total, idUsuario, sedeId]
    );
    const idPedido = pedido.insertId;

    await conn.query(
      "INSERT INTO detalle_pedido (cantidad, precio_unitario, id_pedido, id_producto) VALUES ?",
      [productos.map((p) => [cantidades.get(p.id_producto), p.precio, idPedido, p.id_producto])]
    );
    for (const p of productos) {
      await conn.query("UPDATE producto SET stock = stock - ? WHERE id_producto = ?", [cantidades.get(p.id_producto), p.id_producto]);
    }
    // Pago simulado (aún no hay pasarela de pago real)
    await conn.query(
      "INSERT INTO pago (monto, metodo, estado, id_pedido) VALUES (?, 'Simulado', 'Aprobado', ?)",
      [total, idPedido]
    );

    await conn.commit();

    const [creado] = await listarPedidos("WHERE p.id_pedido = ?", [idPedido], 1);
    res.status(201).json(creado);
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* sin transacción abierta */ }
    if (err instanceof ErrorNegocio) return res.status(err.status).json({ error: err.message });
    next(err);
  } finally {
    conn.release();
  }
});

// GET /api/tienda/pedidos?codigos=MF-5,MF-6
// El navegador recuerda los códigos de sus compras y los consulta aquí.
router.get("/pedidos", async (req, res, next) => {
  try {
    const ids = String(req.query.codigos || "")
      .split(",")
      .map((c) => idDeCodigo(c.trim()))
      .filter((id) => id !== null)
      .slice(0, 50);
    if (ids.length === 0) return res.json([]);
    res.json(await listarPedidos("WHERE p.id_pedido IN (?)", [ids]));
  } catch (err) { next(err); }
});

module.exports = router;
