
const express = require('express');
const router = express.Router();
const pool = require('../config/db');


/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Consultar todas las categorías
 *     tags: [Categorías]
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */


// Consultar todas las categorías
router.get('/', async (req, res) => {
    try {
        const [categorias] = await pool.execute(
            `SELECT id_categoria, nombre, descripcion
             FROM categoria
             ORDER BY id_categoria`
        );

        res.json(categorias);
    } catch (error) {
        console.error('Error al consultar categorías:', error.message);

        res.status(500).json({
            error: 'No se pudieron consultar las categorías'
        });
    }
});


/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Crear una categoría
 *     tags: [Categorías]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Congelados
 *               descripcion:
 *                 type: string
 *                 example: Productos congelados
 *     responses:
 *       201:
 *         description: Categoría creada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */


/**
 * @swagger
 * /api/categorias/{id_categoria}:
 *   get:
 *     summary: Consultar una categoría por ID
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id_categoria
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoría no encontrada
 */
router.get('/:id_categoria', async (req, res) => {
    const id = Number(req.params.id_categoria);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [categorias] = await pool.execute(
            `SELECT id_categoria, nombre, descripcion
             FROM categoria
             WHERE id_categoria = ?`,
            [id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                error: 'Categoría no encontrada'
            });
        }

        res.json(categorias[0]);
    } catch (error) {
        console.error('Error al consultar categoría:', error.message);

        res.status(500).json({
            error: 'No se pudo consultar la categoría'
        });
    }
});

 // Crear una categoría
router.post('/', async (req, res) => {
    const { nombre, descripcion } = req.body;

    // Validar los datos recibidos
    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof descripcion !== 'string'
    ) {
        return res.status(400).json({
            error: 'Debes enviar un nombre y una descripción válida'
        });
    }

    try {
        const [resultado] = await pool.execute(
            `INSERT INTO categoria (nombre, descripcion)
             VALUES (?, ?)`,
            [nombre.trim(), descripcion.trim()]
        );

        res.status(201).json({
            mensaje: 'Categoría creada correctamente',
            id_categoria: resultado.insertId,
            nombre: nombre.trim(),
            descripcion: descripcion.trim()
        });
    } catch (error) {
        console.error('Error al crear categoría:', error.message);

        res.status(500).json({
            error: 'No se pudo crear la categoría'
        });
    }
});


/**
 * @swagger
 * /api/categorias/{id_categoria}:
 *   put:
 *     summary: Actualizar una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id_categoria
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría que se actualizará
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Congelados
 *               descripcion:
 *                 type: string
 *                 example: Carnes y alimentos congelados
 *     responses:
 *       200:
 *         description: Categoría actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Categoría no encontrada
 */
router.put('/:id_categoria', async (req, res) => {
    const id = Number(req.params.id_categoria);
    const { nombre, descripcion } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof descripcion !== 'string'
    ) {
        return res.status(400).json({
            error: 'Debes enviar un nombre y una descripción válida'
        });
    }

    try {
        const [categorias] = await pool.execute(
            'SELECT id_categoria FROM categoria WHERE id_categoria = ?',
            [id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                error: 'Categoría no encontrada'
            });
        }

        await pool.execute(
            `UPDATE categoria
             SET nombre = ?, descripcion = ?
             WHERE id_categoria = ?`,
            [nombre.trim(), descripcion.trim(), id]
        );

        res.json({
            mensaje: 'Categoría actualizada correctamente',
            id_categoria: id,
            nombre: nombre.trim(),
            descripcion: descripcion.trim()
        });
    } catch (error) {
        console.error('Error al actualizar categoría:', error.message);

        res.status(500).json({
            error: 'No se pudo actualizar la categoría'
        });
    }
});


/**
 * @swagger
 * /api/categorias/{id_categoria}:
 *   delete:
 *     summary: Eliminar una categoría
 *     tags: [Categorías]
 *     parameters:
 *       - in: path
 *         name: id_categoria
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la categoría que se eliminará
 *     responses:
 *       200:
 *         description: Categoría eliminada correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id_categoria', async (req, res) => {
    const id = Number(req.params.id_categoria);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [categorias] = await pool.execute(
            `SELECT id_categoria, nombre, descripcion
             FROM categoria
             WHERE id_categoria = ?`,
            [id]
        );

        if (categorias.length === 0) {
            return res.status(404).json({
                error: 'Categoría no encontrada'
            });
        }

        await pool.execute(
            'DELETE FROM categoria WHERE id_categoria = ?',
            [id]
        );

        res.json({
            mensaje: 'Categoría eliminada correctamente',
            categoria: categorias[0]
        });
    } catch (error) {
        console.error('Error al eliminar categoría:', error.message);

        res.status(500).json({
            error: 'No se pudo eliminar la categoría'
        });
    }
});

module.exports = router;
