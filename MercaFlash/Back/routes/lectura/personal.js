// personal: consultas del panel del administrador. Requieren el token del personal.
// Usa la conexión de LECTURA.
const express = require("express");
const pool = require("../../config/db.lectura");
const { listarPedidos, ESTADOS, filtroPorEstado } = require("../../services/pedidos");
const { requierePersonal } = require("../../middleware/auth");
const router = express.Router();

/**
 * @swagger
 * /api/personal/pedidos:
 *   get:
 *     summary: Consultar pedidos (panel del personal)
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: estado
 *         required: false
 *         schema: { type: string, enum: [pendiente, listo, cancelado] }
 *         description: Si se omite, devuelve todos los pedidos
 *     responses:
 *       200:
 *         description: Lista de pedidos, los más recientes primero
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: Falta el token o venció
 */
router.get("/pedidos", requierePersonal, async (req, res, next) => {
  try {
    const { estado } = req.query;
    if (estado === undefined) return res.json(await listarPedidos());
    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: "El estado debe ser pendiente, listo o cancelado." });
    }
    const { where, params } = filtroPorEstado(estado);
    res.json(await listarPedidos(where, params));
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/personal/productos:
 *   get:
 *     summary: Listar TODOS los productos, incluidos los desactivados (inventario del administrador)
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productos con su categoría, stock y si están activos
 *       401:
 *         description: Falta el token o venció
 */
router.get("/productos", requierePersonal, async (req, res, next) => {
  try {
    const [filas] = await pool.query(
      `SELECT p.id_producto AS id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen,
              COALESCE(p.icono, '🛒') AS icono, p.activo, p.id_categoria, c.nombre AS categoria
         FROM producto p
         JOIN categoria c ON c.id_categoria = p.id_categoria
        ORDER BY p.nombre`
    );
    res.json(filas.map((f) => ({ ...f, precio: Number(f.precio), activo: Boolean(f.activo) })));
  } catch (err) { next(err); }
});

module.exports = router;
