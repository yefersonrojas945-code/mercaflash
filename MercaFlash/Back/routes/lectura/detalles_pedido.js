// detalles_pedido: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const db = require('../../config/db.lectura');
const { requierePersonal } = require('../../middleware/auth');


/**
 * @swagger
 * tags:
 *   name: Detalles de pedidos
 *   description: Productos incluidos en cada pedido
 */

/**
 * @swagger
 * /api/detalle-pedido:
 *   get:
 *     summary: Consultar todos los detalles de pedidos
 *     tags: [Detalles de pedidos]
 *     responses:
 *       200:
 *         description: Lista de detalles
 */
router.get('/', requierePersonal, async (req, res) => {
    try {
        const [detalles] = await db.query(`
            SELECT
                d.id_detalle,
                d.id_pedido,
                d.id_producto,
                pr.nombre AS producto,
                d.cantidad,
                d.precio_unitario,
                d.cantidad * d.precio_unitario AS subtotal
            FROM detalle_pedido d
            INNER JOIN producto pr
                ON d.id_producto = pr.id_producto
            ORDER BY d.id_detalle DESC
        `);

        res.json(detalles);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al consultar los detalles de pedidos'
        });
    }
});


/**
 * @swagger
 * /api/detalle-pedido/{id_detalle}:
 *   get:
 *     summary: Consultar un detalle por ID
 *     tags: [Detalles de pedidos]
 *     parameters:
 *       - in: path
 *         name: id_detalle
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Detalle no encontrado
 */
router.get('/:id_detalle', requierePersonal, async (req, res) => {
    try {
        const id = Number(req.params.id_detalle);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const [detalles] = await db.query(`
            SELECT
                d.id_detalle,
                d.id_pedido,
                d.id_producto,
                pr.nombre AS producto,
                d.cantidad,
                d.precio_unitario,
                d.cantidad * d.precio_unitario AS subtotal
            FROM detalle_pedido d
            INNER JOIN producto pr
                ON d.id_producto = pr.id_producto
            WHERE d.id_detalle = ?
        `, [id]);

        if (detalles.length === 0) {
            return res.status(404).json({
                error: 'Detalle de pedido no encontrado'
            });
        }

        res.json(detalles[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al consultar el detalle'
        });
    }
});

module.exports = router;
