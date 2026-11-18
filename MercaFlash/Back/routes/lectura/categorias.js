// categorias: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.lectura');



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

module.exports = router;
