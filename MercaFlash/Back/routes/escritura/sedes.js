// sedes: comandos (POST, PUT, PATCH y DELETE).
// Usa la conexión de ESCRITURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.escritura');
const { requierePersonal } = require('../../middleware/auth');


/**
 * @swagger
 * /api/sedes:
 *   post:
 *     summary: Registrar una sede
 *     tags: [Sedes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - ciudad
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Sede Poblado
 *               direccion:
 *                 type: string
 *                 example: Dirección de prueba - Poblado
 *               ciudad:
 *                 type: string
 *                 example: Medellín
 *               horario:
 *                 type: string
 *                 nullable: true
 *                 example: Lunes a sábado, 8:00 a. m. - 8:00 p. m.
 *     responses:
 *       201:
 *         description: Sede creada correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requierePersonal, async (req, res) => {
    const { nombre, direccion, ciudad, horario } = req.body;

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof direccion !== 'string' || !direccion.trim() ||
        typeof ciudad !== 'string' || !ciudad.trim() ||
        (horario !== undefined &&
            horario !== null &&
            typeof horario !== 'string')
    ) {
        return res.status(400).json({
            error: 'Debes enviar nombre, dirección y ciudad válidos'
        });
    }

    try {
        const [resultado] = await pool.execute(
            `INSERT INTO sede (nombre, direccion, ciudad, horario)
             VALUES (?, ?, ?, ?)`,
            [
                nombre.trim(),
                direccion.trim(),
                ciudad.trim(),
                horario == null ? null : horario.trim()
            ]
        );

        res.status(201).json({
            mensaje: 'Sede creada correctamente',
            id_sede: resultado.insertId,
            nombre: nombre.trim(),
            direccion: direccion.trim(),
            ciudad: ciudad.trim(),
            horario: horario == null ? null : horario.trim()
        });
    } catch (error) {
        console.error('Error al crear sede:', error.message);

        res.status(500).json({
            error: 'No se pudo crear la sede'
        });
    }
});


/**
 * @swagger
 * /api/sedes/{id_sede}:
 *   put:
 *     summary: Actualizar una sede
 *     tags: [Sedes]
 *     parameters:
 *       - in: path
 *         name: id_sede
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede que se desea actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - direccion
 *               - ciudad
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Sede Poblado Actualizada
 *               direccion:
 *                 type: string
 *                 example: Dirección actualizada - Poblado
 *               ciudad:
 *                 type: string
 *                 example: Medellín
 *               horario:
 *                 type: string
 *                 nullable: true
 *                 example: Lunes a domingo, 8:00 a. m. - 9:00 p. m.
 *     responses:
 *       200:
 *         description: Sede actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Sede no encontrada
 */
router.put('/:id_sede', requierePersonal, async (req, res) => {
    const id = Number(req.params.id_sede);
    const { nombre, direccion, ciudad, horario } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof direccion !== 'string' || !direccion.trim() ||
        typeof ciudad !== 'string' || !ciudad.trim() ||
        (horario !== undefined &&
            horario !== null &&
            typeof horario !== 'string')
    ) {
        return res.status(400).json({
            error: 'Debes enviar nombre, dirección y ciudad válidos'
        });
    }

    try {
        const [sedes] = await pool.execute(
            'SELECT id_sede FROM sede WHERE id_sede = ?',
            [id]
        );

        if (sedes.length === 0) {
            return res.status(404).json({
                error: 'Sede no encontrada'
            });
        }

        await pool.execute(
            `UPDATE sede
             SET nombre = ?, direccion = ?, ciudad = ?, horario = ?
             WHERE id_sede = ?`,
            [
                nombre.trim(),
                direccion.trim(),
                ciudad.trim(),
                horario == null ? null : horario.trim(),
                id
            ]
        );

        res.status(200).json({
            mensaje: 'Sede actualizada correctamente',
            id_sede: id,
            nombre: nombre.trim(),
            direccion: direccion.trim(),
            ciudad: ciudad.trim(),
            horario: horario == null ? null : horario.trim()
        });
    } catch (error) {
        console.error('Error al actualizar sede:', error.message);

        res.status(500).json({
            error: 'No se pudo actualizar la sede'
        });
    }
});



/**
 * @swagger
 * /api/sedes/{id_sede}:
 *   delete:
 *     summary: Eliminar una sede
 *     tags: [Sedes]
 *     parameters:
 *       - in: path
 *         name: id_sede
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sede que se desea eliminar
 *     responses:
 *       200:
 *         description: Sede eliminada correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Sede no encontrada
 */
router.delete('/:id_sede', requierePersonal, async (req, res) => {
    const id = Number(req.params.id_sede);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [sedes] = await pool.execute(
            'SELECT id_sede FROM sede WHERE id_sede = ?',
            [id]
        );

        if (sedes.length === 0) {
            return res.status(404).json({
                error: 'Sede no encontrada'
            });
        }

        await pool.execute(
            'DELETE FROM sede WHERE id_sede = ?',
            [id]
        );

        res.status(200).json({
            mensaje: 'Sede eliminada correctamente',
            id_sede: id
        });
    } catch (error) {
        console.error('Error al eliminar sede:', error.message);

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar la sede porque tiene pedidos asociados'
            });
        }

        res.status(500).json({
            error: 'No se pudo eliminar la sede'
        });
    }
});

module.exports = router;
