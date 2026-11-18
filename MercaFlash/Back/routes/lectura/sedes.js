// sedes: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.lectura');


/**
 * @swagger
 * /api/sedes:
 *   get:
 *     summary: Consultar todas las sedes
 *     tags: [Sedes]
 *     responses:
 *       200:
 *         description: Lista de sedes
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
    try {
        const [sedes] = await pool.execute(
            `SELECT id_sede, nombre, direccion, ciudad, horario
             FROM sede
             ORDER BY id_sede`
        );

        res.json(sedes);
    } catch (error) {
        console.error('Error al consultar sedes:', error.message);

        res.status(500).json({
            error: 'No se pudieron consultar las sedes'
        });
    }
});


/**
 * @swagger
 * /api/sedes/{id_sede}:
 *   get:
 *     summary: Consultar una sede por ID
 *     tags: [Sedes]
 *     parameters:
 *       - in: path
 *         name: id_sede
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede
 *     responses:
 *       200:
 *         description: Sede encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Sede no encontrada
 */
router.get('/:id_sede', async (req, res) => {
    const id = Number(req.params.id_sede);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [sedes] = await pool.execute(
            `SELECT id_sede, nombre, direccion, ciudad, horario
             FROM sede
             WHERE id_sede = ?`,
            [id]
        );

        if (sedes.length === 0) {
            return res.status(404).json({
                error: 'Sede no encontrada'
            });
        }

        res.json(sedes[0]);
    } catch (error) {
        console.error('Error al consultar sede:', error.message);

        res.status(500).json({
            error: 'No se pudo consultar la sede'
        });
    }
});

module.exports = router;
