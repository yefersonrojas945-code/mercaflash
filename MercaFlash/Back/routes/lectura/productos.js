// productos: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.lectura');


/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Consultar todos los productos
 *     tags: [Productos]
 *     responses:
 *       200:
 *         description: Lista de productos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 */

// GET: consultar todos los productos

router.get('/', async (req, res) => {
    try {
        const [productosBD] = await pool.execute(`
            SELECT
                p.id_producto AS id,
                p.nombre AS name,
                p.descripcion AS descripcion,
                c.nombre AS cat,
                p.precio AS price,
                p.imagen AS imagen,
                p.stock AS cantidad,
                COALESCE(p.icono, '🛒') AS icon
            FROM producto p
            INNER JOIN categoria c
                ON p.id_categoria = c.id_categoria
            WHERE p.activo = 1
            ORDER BY p.id_producto
        `);

        res.json(productosBD);

    } catch (error) {
        console.error('Error al consultar productos:', error.message);

        res.status(500).json({
            error: 'No se pudieron consultar los productos'
        });
    }
});



/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Consultar un producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 */


/** GET: consultar un producto por ID*/

router.get('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [productosBD] = await pool.execute(`
            SELECT
                p.id_producto AS id,
                p.nombre AS name,
                p.descripcion AS descripcion,
                c.nombre AS cat,
                p.precio AS price,
                p.imagen AS imagen,
                p.stock AS cantidad,
                COALESCE(p.icono, '🛒') AS icon
            FROM producto p
            INNER JOIN categoria c
                ON p.id_categoria = c.id_categoria
            WHERE p.id_producto = ? AND p.activo = 1
        `, [id]);

        if (productosBD.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json(productosBD[0]);

    } catch (error) {
        console.error('Error al consultar producto:', error.message);

        res.status(500).json({
            error: 'No se pudo consultar el producto'
        });
    }
});

module.exports = router;
