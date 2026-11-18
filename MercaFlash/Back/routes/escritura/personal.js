// personal: comandos del panel del administrador (cambiar el estado de un pedido).
// Requieren el token del personal. Usa la conexión de ESCRITURA.
const express = require("express");
const pool = require("../../config/db.escritura");
const { listarPedidos, idDeCodigo } = require("../../services/pedidos");
const { ErrorNegocio } = require("../../services/errores");
const { requierePersonal } = require("../../middleware/auth");
const router = express.Router();

const esCancelado = (estado) => String(estado).toLowerCase() === "cancelado";

/**
 * @swagger
 * /api/personal/pedidos/{codigo}/listo:
 *   patch:
 *     summary: Marcar un pedido como listo para recoger
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string, example: "MF-5" }
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *       401:
 *         description: Falta el token o venció
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: El pedido está cancelado
 */
router.patch("/pedidos/:codigo/listo", requierePersonal, async (req, res, next) => {
  try {
    const id = idDeCodigo(req.params.codigo);
    if (id === null) return res.status(400).json({ error: "Código de pedido inválido." });

    const [filas] = await pool.query("SELECT estado FROM pedido WHERE id_pedido = ?", [id]);
    if (filas.length === 0) return res.status(404).json({ error: "Pedido no encontrado." });
    if (esCancelado(filas[0].estado)) {
      return res.status(409).json({ error: "El pedido está cancelado y no se puede marcar como listo." });
    }

    await pool.query("UPDATE pedido SET estado = 'Listo' WHERE id_pedido = ?", [id]);
    const [pedido] = await listarPedidos("WHERE p.id_pedido = ?", [id], 1, pool);
    res.json(pedido);
  } catch (err) { next(err); }
});

/**
 * @swagger
 * /api/personal/pedidos/{codigo}/cancelar:
 *   patch:
 *     summary: Cancelar un pedido
 *     description: >
 *       Marca el pedido como cancelado, devuelve las unidades al stock y marca el pago como
 *       reembolsado (el pago es simulado). Todo en una transacción.
 *     tags: [Personal]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema: { type: string, example: "MF-5" }
 *     responses:
 *       200:
 *         description: Pedido cancelado
 *       401:
 *         description: Falta el token o venció
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: El pedido ya estaba cancelado
 */
router.patch("/pedidos/:codigo/cancelar", requierePersonal, async (req, res, next) => {
  const id = idDeCodigo(req.params.codigo);
  if (id === null) return res.status(400).json({ error: "Código de pedido inválido." });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // FOR UPDATE bloquea el pedido para que dos cancelaciones seguidas no devuelvan el stock dos veces
    const [filas] = await conn.query("SELECT estado FROM pedido WHERE id_pedido = ? FOR UPDATE", [id]);
    if (filas.length === 0) throw new ErrorNegocio("Pedido no encontrado.", 404);
    if (esCancelado(filas[0].estado)) throw new ErrorNegocio("El pedido ya estaba cancelado.", 409);

    const [items] = await conn.query(
      `SELECT id_producto, SUM(cantidad) AS cantidad
         FROM detalle_pedido WHERE id_pedido = ? GROUP BY id_producto ORDER BY id_producto`,
      [id]
    );
    for (const it of items) {
      await conn.query("UPDATE producto SET stock = stock + ? WHERE id_producto = ?", [Number(it.cantidad), it.id_producto]);
    }
    await conn.query("UPDATE pedido SET estado = 'Cancelado' WHERE id_pedido = ?", [id]);
    await conn.query("UPDATE pago SET estado = 'Reembolsado' WHERE id_pedido = ?", [id]);

    await conn.commit();

    const [pedido] = await listarPedidos("WHERE p.id_pedido = ?", [id], 1, pool);
    res.json(pedido);
  } catch (err) {
    try { await conn.rollback(); } catch (e) { /* sin transacción abierta */ }
    if (err instanceof ErrorNegocio) return res.status(err.status).json({ error: err.message });
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
