
const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
router.get('/', async (req, res) => {
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
router.get('/:id_detalle', async (req, res) => {
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

/**
 * @swagger
 * /api/detalle-pedido:
 *   post:
 *     summary: Agregar un producto a un pedido
 *     tags: [Detalles de pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_pedido
 *               - id_producto
 *               - cantidad
 *               - precio_unitario
 *             properties:
 *               id_pedido:
 *                 type: integer
 *                 example: 1
 *               id_producto:
 *                 type: integer
 *                 example: 2
 *               cantidad:
 *                 type: integer
 *                 example: 2
 *               precio_unitario:
 *                 type: number
 *                 example: 3500
 *     responses:
 *       201:
 *         description: Detalle creado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pedido o producto no encontrado
 */
router.post('/', async (req, res) => {
    try {
        const {
            id_pedido,
            id_producto,
            cantidad,
            precio_unitario
        } = req.body;

        const pedidoId = Number(id_pedido);
        const productoId = Number(id_producto);
        const unidades = Number(cantidad);
        const precio = Number(precio_unitario);

        if (
            !Number.isInteger(pedidoId) || pedidoId <= 0 ||
            !Number.isInteger(productoId) || productoId <= 0 ||
            !Number.isInteger(unidades) || unidades <= 0 ||
            !Number.isFinite(precio) || precio < 0
        ) {
            return res.status(400).json({
                error: 'Datos inválidos. Revisa pedido, producto, cantidad y precio unitario'
            });
        }

        const [pedidos] = await db.query(
            'SELECT id_pedido FROM pedido WHERE id_pedido = ?',
            [pedidoId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'El pedido indicado no existe'
            });
        }

        const [productos] = await db.query(
            'SELECT id_producto FROM producto WHERE id_producto = ?',
            [productoId]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                error: 'El producto indicado no existe'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO detalle_pedido
            (id_pedido, id_producto, cantidad, precio_unitario)
            VALUES (?, ?, ?, ?)`,
            [pedidoId, productoId, unidades, precio]
        );

        res.status(201).json({
            mensaje: 'Detalle de pedido creado correctamente',
            id_detalle: resultado.insertId
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Este producto ya está registrado en el pedido o existe un registro duplicado'
            });
        }

        res.status(500).json({
            error: 'Error al crear el detalle del pedido'
        });
    }
});

/**
 * @swagger
 * /api/detalle-pedido/{id_detalle}:
 *   put:
 *     summary: Actualizar un detalle de pedido
 *     tags: [Detalles de pedidos]
 *     parameters:
 *       - in: path
 *         name: id_detalle
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
 *               - id_pedido
 *               - id_producto
 *               - cantidad
 *               - precio_unitario
 *             properties:
 *               id_pedido:
 *                 type: integer
 *                 example: 1
 *               id_producto:
 *                 type: integer
 *                 example: 2
 *               cantidad:
 *                 type: integer
 *                 example: 3
 *               precio_unitario:
 *                 type: number
 *                 example: 3500
 *     responses:
 *       200:
 *         description: Detalle actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Detalle, pedido o producto no encontrado
 */
router.put('/:id_detalle', async (req, res) => {
    try {
        const id = Number(req.params.id_detalle);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const {
            id_pedido,
            id_producto,
            cantidad,
            precio_unitario
        } = req.body;

        const pedidoId = Number(id_pedido);
        const productoId = Number(id_producto);
        const unidades = Number(cantidad);
        const precio = Number(precio_unitario);

        if (
            !Number.isInteger(pedidoId) || pedidoId <= 0 ||
            !Number.isInteger(productoId) || productoId <= 0 ||
            !Number.isInteger(unidades) || unidades <= 0 ||
            !Number.isFinite(precio) || precio < 0
        ) {
            return res.status(400).json({
                error: 'Datos inválidos. Revisa pedido, producto, cantidad y precio unitario'
            });
        }

        const [detalles] = await db.query(
            'SELECT id_detalle FROM detalle_pedido WHERE id_detalle = ?',
            [id]
        );

        if (detalles.length === 0) {
            return res.status(404).json({
                error: 'Detalle de pedido no encontrado'
            });
        }

        const [pedidos] = await db.query(
            'SELECT id_pedido FROM pedido WHERE id_pedido = ?',
            [pedidoId]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'El pedido indicado no existe'
            });
        }

        const [productos] = await db.query(
            'SELECT id_producto FROM producto WHERE id_producto = ?',
            [productoId]
        );

        if (productos.length === 0) {
            return res.status(404).json({
                error: 'El producto indicado no existe'
            });
        }

        await db.query(
            `UPDATE detalle_pedido
            SET id_pedido = ?, id_producto = ?,
                cantidad = ?, precio_unitario = ?
            WHERE id_detalle = ?`,
            [pedidoId, productoId, unidades, precio, id]
        );

        res.json({
            mensaje: 'Detalle de pedido actualizado correctamente'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'La actualización genera un registro duplicado'
            });
        }

        res.status(500).json({
            error: 'Error al actualizar el detalle'
        });
    }
});

/**
 * @swagger
 * /api/detalle-pedido/{id_detalle}:
 *   delete:
 *     summary: Eliminar un detalle de pedido
 *     tags: [Detalles de pedidos]
 *     parameters:
 *       - in: path
 *         name: id_detalle
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detalle eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Detalle no encontrado
 */
router.delete('/:id_detalle', async (req, res) => {
    try {
        const id = Number(req.params.id_detalle);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const [detalles] = await db.query(
            'SELECT id_detalle FROM detalle_pedido WHERE id_detalle = ?',
            [id]
        );

        if (detalles.length === 0) {
            return res.status(404).json({
                error: 'Detalle de pedido no encontrado'
            });
        }

        await db.query(
            'DELETE FROM detalle_pedido WHERE id_detalle = ?',
            [id]
        );

        res.json({
            mensaje: 'Detalle de pedido eliminado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al eliminar el detalle del pedido'
        });
    }
});

module.exports = router;
