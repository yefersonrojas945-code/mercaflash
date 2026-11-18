// inventario: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.lectura');
const { requierePersonal } = require('../../middleware/auth');
const { esIdValido } = require('../../validaciones/inventario');


/**
 * @swagger
 * /api/inventario:
 *   get:
 *     summary: Consultar todo el inventario
 *     tags: [Inventario]
 *     responses:
 *       200:
 *         description: Lista del inventario
 *       500:
 *         description: Error del servidor
 */
router.get('/', requierePersonal, async (req, res) => {
    try {
        const [inventario] = await pool.execute(`
            SELECT
                i.id_inventario,
                i.cantidad,
                i.id_sede,
                s.nombre AS nombre_sede,
                i.id_producto,
                p.nombre AS nombre_producto
            FROM inventario i
            INNER JOIN sede s ON i.id_sede = s.id_sede
            INNER JOIN producto p ON i.id_producto = p.id_producto
            ORDER BY i.id_inventario
        `);

        res.status(200).json(inventario);
    } catch (error) {
        console.error('Error al consultar inventario:', error.message);
        res.status(500).json({
            error: 'No se pudo consultar el inventario'
        });
    }
});


/**
 * @swagger
 * /api/inventario/{id_inventario}:
 *   get:
 *     summary: Consultar inventario por ID
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id_inventario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id_inventario', requierePersonal, async (req, res) => {
    const id = Number(req.params.id_inventario);

    if (!esIdValido(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [inventario] = await pool.execute(`
            SELECT
                i.id_inventario,
                i.cantidad,
                i.id_sede,
                s.nombre AS nombre_sede,
                i.id_producto,
                p.nombre AS nombre_producto
            FROM inventario i
            INNER JOIN sede s ON i.id_sede = s.id_sede
            INNER JOIN producto p ON i.id_producto = p.id_producto
            WHERE i.id_inventario = ?
        `, [id]);

        if (inventario.length === 0) {
            return res.status(404).json({
                error: 'Registro de inventario no encontrado'
            });
        }

        res.status(200).json(inventario[0]);
    } catch (error) {
        console.error('Error al consultar inventario:', error.message);
        res.status(500).json({
            error: 'No se pudo consultar el inventario'
        });
    }
});

module.exports = router;
