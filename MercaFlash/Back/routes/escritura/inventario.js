// inventario: comandos (POST, PUT, PATCH y DELETE).
// Usa la conexión de ESCRITURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.escritura');
const { requierePersonal } = require('../../middleware/auth');
const { esIdValido, validarDatos } = require('../../validaciones/inventario');

// Comprobar que la sede y el producto existan
async function verificarRelaciones(id_sede, id_producto) {
    const [sedes] = await pool.execute(
        'SELECT id_sede FROM sede WHERE id_sede = ?',
        [id_sede]
    );

    const [productos] = await pool.execute(
        'SELECT id_producto FROM producto WHERE id_producto = ?',
        [id_producto]
    );

    return sedes.length > 0 && productos.length > 0;
}


/**
 * @swagger
 * /api/inventario:
 *   post:
 *     summary: Registrar inventario
 *     tags: [Inventario]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *               - id_sede
 *               - id_producto
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 minimum: 0
 *                 example: 25
 *               id_sede:
 *                 type: integer
 *                 example: 1
 *               id_producto:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Inventario registrado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Sede o producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/', requierePersonal, async (req, res) => {
    const { cantidad, id_sede, id_producto } = req.body;

    if (!validarDatos(cantidad, id_sede, id_producto)) {
        return res.status(400).json({
            error: 'Cantidad debe ser un entero no negativo y los IDs deben ser enteros positivos'
        });
    }

    try {
        const relacionesValidas = await verificarRelaciones(
            id_sede,
            id_producto
        );

        if (!relacionesValidas) {
            return res.status(404).json({
                error: 'La sede o el producto no existe'
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO inventario (cantidad, id_sede, id_producto)
             VALUES (?, ?, ?)`,
            [cantidad, id_sede, id_producto]
        );

        res.status(201).json({
            mensaje: 'Inventario registrado correctamente',
            id_inventario: resultado.insertId,
            cantidad,
            id_sede,
            id_producto
        });
    } catch (error) {
        console.error('Error al registrar inventario:', error.message);
        res.status(500).json({
            error: 'No se pudo registrar el inventario'
        });
    }
});


/**
 * @swagger
 * /api/inventario/{id_inventario}:
 *   put:
 *     summary: Actualizar un registro de inventario
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id_inventario
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *               - id_sede
 *               - id_producto
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 minimum: 0
 *                 example: 40
 *               id_sede:
 *                 type: integer
 *                 example: 1
 *               id_producto:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Inventario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Registro, sede o producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id_inventario', requierePersonal, async (req, res) => {
    const id = Number(req.params.id_inventario);
    const { cantidad, id_sede, id_producto } = req.body;

    if (!esIdValido(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    if (!validarDatos(cantidad, id_sede, id_producto)) {
        return res.status(400).json({
            error: 'Cantidad debe ser un entero no negativo y los IDs deben ser enteros positivos'
        });
    }

    try {
        const [registros] = await pool.execute(
            'SELECT id_inventario FROM inventario WHERE id_inventario = ?',
            [id]
        );

        if (registros.length === 0) {
            return res.status(404).json({
                error: 'Registro de inventario no encontrado'
            });
        }

        const relacionesValidas = await verificarRelaciones(
            id_sede,
            id_producto
        );

        if (!relacionesValidas) {
            return res.status(404).json({
                error: 'La sede o el producto no existe'
            });
        }

        await pool.execute(
            `UPDATE inventario
             SET cantidad = ?, id_sede = ?, id_producto = ?
             WHERE id_inventario = ?`,
            [cantidad, id_sede, id_producto, id]
        );

        res.status(200).json({
            mensaje: 'Inventario actualizado correctamente',
            id_inventario: id,
            cantidad,
            id_sede,
            id_producto
        });
    } catch (error) {
        console.error('Error al actualizar inventario:', error.message);
        res.status(500).json({
            error: 'No se pudo actualizar el inventario'
        });
    }
});


/**
 * @swagger
 * /api/inventario/{id_inventario}:
 *   delete:
 *     summary: Eliminar un registro de inventario
 *     tags: [Inventario]
 *     parameters:
 *       - in: path
 *         name: id_inventario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inventario eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Registro no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id_inventario', requierePersonal, async (req, res) => {
    const id = Number(req.params.id_inventario);

    if (!esIdValido(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [registros] = await pool.execute(
            'SELECT id_inventario FROM inventario WHERE id_inventario = ?',
            [id]
        );

        if (registros.length === 0) {
            return res.status(404).json({
                error: 'Registro de inventario no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM inventario WHERE id_inventario = ?',
            [id]
        );

        res.status(200).json({
            mensaje: 'Inventario eliminado correctamente',
            id_inventario: id
        });
    } catch (error) {
        console.error('Error al eliminar inventario:', error.message);
        res.status(500).json({
            error: 'No se pudo eliminar el inventario'
        });
    }
});

module.exports = router;
