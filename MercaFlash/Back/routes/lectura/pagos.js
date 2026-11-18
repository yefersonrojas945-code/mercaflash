// pagos: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const db = require('../../config/db.lectura');
const { requierePersonal } = require('../../middleware/auth');


/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Operaciones para administrar los pagos
 */

/**
 * @swagger
 * /api/pagos:
 *   get:
 *     summary: Consultar todos los pagos
 *     tags: [Pagos]
 *     responses:
 *       200:
 *         description: Lista de pagos
 */
router.get('/', requierePersonal, async (req, res) => {
    try {
        const [pagos] = await db.query(`
            SELECT
                pa.id_pago,
                pa.fecha,
                pa.monto,
                pa.metodo,
                pa.estado,
                pa.id_pedido
            FROM pago pa
            ORDER BY pa.id_pago DESC
        `);

        res.json(pagos);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al consultar los pagos'
        });
    }
});


/**
 * @swagger
 * /api/pagos/{id_pago}:
 *   get:
 *     summary: Consultar un pago por ID
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id_pago
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:id_pago', requierePersonal, async (req, res) => {
    try {
        const id = Number(req.params.id_pago);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const [pagos] = await db.query(
            `SELECT id_pago, fecha, monto, metodo, estado, id_pedido
             FROM pago
             WHERE id_pago = ?`,
            [id]
        );

        if (pagos.length === 0) {
            return res.status(404).json({
                error: 'Pago no encontrado'
            });
        }

        res.json(pagos[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al consultar el pago'
        });
    }
});

module.exports = router;
