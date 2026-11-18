// pedidos: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const db = require('../../config/db.lectura');
const { requierePersonal } = require('../../middleware/auth');


/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: Operaciones para administrar los pedidos
 */

/**
 * @swagger
 * /api/pedidos:
 *   get:
 *     summary: Consultar todos los pedidos
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', requierePersonal, async (req, res) => {
    try {
        const [pedidos] = await db.query(`
            SELECT
                p.id_pedido,
                p.fecha,
                p.estado,
                p.total,
                p.tipo_compra,
                p.id_usuario,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                p.id_sede,
                s.nombre AS sede
            FROM pedido p
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            INNER JOIN sede s ON p.id_sede = s.id_sede
            ORDER BY p.id_pedido DESC
        `);

        res.json(pedidos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al consultar los pedidos'
        });
    }
});


/**
 * @swagger
 * /api/pedidos/{id_pedido}:
 *   get:
 *     summary: Consultar un pedido por ID
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id_pedido
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pedido no encontrado
 */
router.get('/:id_pedido', requierePersonal, async (req, res) => {
    try {
        const id = Number(req.params.id_pedido);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const [pedidos] = await db.query(`
            SELECT
                p.id_pedido,
                p.fecha,
                p.estado,
                p.total,
                p.tipo_compra,
                p.id_usuario,
                CONCAT(u.nombre, ' ', u.apellido) AS usuario,
                p.id_sede,
                s.nombre AS sede
            FROM pedido p
            INNER JOIN usuario u ON p.id_usuario = u.id_usuario
            INNER JOIN sede s ON p.id_sede = s.id_sede
            WHERE p.id_pedido = ?
        `, [id]);

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        res.json(pedidos[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al consultar el pedido'
        });
    }
});

module.exports = router;
