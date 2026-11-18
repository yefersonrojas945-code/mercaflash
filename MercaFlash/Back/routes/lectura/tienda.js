// tienda: consultas (ver los pedidos del cliente por código).
// Usa la conexión de LECTURA. Es pública: el cliente consulta sus propios códigos.
const express = require("express");
const { listarPedidos, idDeCodigo } = require("../../services/pedidos");
const router = express.Router();

/**
 * @swagger
 * /api/tienda/pedidos:
 *   get:
 *     summary: Consultar pedidos por código
 *     tags: [Tienda]
 *     parameters:
 *       - in: query
 *         name: codigos
 *         required: true
 *         schema: { type: string, example: "MF-5,MF-6" }
 *         description: Códigos de pedido separados por comas
 *     responses:
 *       200:
 *         description: Lista de pedidos con sus productos
 */
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
