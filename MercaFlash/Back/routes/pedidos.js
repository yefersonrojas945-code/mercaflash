const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
router.get('/', async (req, res) => {
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
router.get('/:id_pedido', async (req, res) => {
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

/**
 * @swagger
 * /api/pedidos:
 *   post:
 *     summary: Crear un pedido
 *     tags: [Pedidos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo_compra
 *               - id_usuario
 *               - id_sede
 *             properties:
 *               estado:
 *                 type: string
 *                 example: Pendiente
 *               total:
 *                 type: number
 *                 example: 25000
 *               tipo_compra:
 *                 type: string
 *                 example: Recoger en sede
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_sede:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pedido creado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario o sede no encontrados
 */
router.post('/', async (req, res) => {
    try {
        const {
            fecha,
            estado = 'Pendiente',
            total = 0,
            tipo_compra,
            id_usuario,
            id_sede
        } = req.body;

        const usuarioId = Number(id_usuario);
        const sedeId = Number(id_sede);
        const totalPedido = Number(total);

        if (
            typeof tipo_compra !== 'string' ||
            tipo_compra.trim() === '' ||
            !Number.isInteger(usuarioId) ||
            usuarioId <= 0 ||
            !Number.isInteger(sedeId) ||
            sedeId <= 0 ||
            typeof estado !== 'string' ||
            estado.trim() === '' ||
            !Number.isFinite(totalPedido) ||
            totalPedido < 0 ||
            (fecha !== undefined &&
                (typeof fecha !== 'string' || fecha.trim() === ''))
        ) {
            return res.status(400).json({
                error: 'Datos inválidos. Revisa estado, total, tipo de compra, usuario, sede y fecha'
            });
        }

        const [usuarios] = await db.query(
            'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
            [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                error: 'El usuario indicado no existe'
            });
        }

        const [sedes] = await db.query(
            'SELECT id_sede FROM sede WHERE id_sede = ?',
            [sedeId]
        );

        if (sedes.length === 0) {
            return res.status(404).json({
                error: 'La sede indicada no existe'
            });
        }

        let resultado;

        if (fecha !== undefined) {
            [resultado] = await db.query(
                `INSERT INTO pedido
                (fecha, estado, total, tipo_compra, id_usuario, id_sede)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    fecha,
                    estado.trim(),
                    totalPedido,
                    tipo_compra.trim(),
                    usuarioId,
                    sedeId
                ]
            );
        } else {
            [resultado] = await db.query(
                `INSERT INTO pedido
                (estado, total, tipo_compra, id_usuario, id_sede)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    estado.trim(),
                    totalPedido,
                    tipo_compra.trim(),
                    usuarioId,
                    sedeId
                ]
            );
        }

        res.status(201).json({
            mensaje: 'Pedido creado correctamente',
            id_pedido: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al crear el pedido'
        });
    }
});

/**
 * @swagger
 * /api/pedidos/{id_pedido}:
 *   put:
 *     summary: Actualizar un pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id_pedido
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
 *               - estado
 *               - total
 *               - tipo_compra
 *               - id_usuario
 *               - id_sede
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2026-10-14 12:00:00"
 *               estado:
 *                 type: string
 *                 example: En preparación
 *               total:
 *                 type: number
 *                 example: 30000
 *               tipo_compra:
 *                 type: string
 *                 example: Recoger en sede
 *               id_usuario:
 *                 type: integer
 *                 example: 1
 *               id_sede:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Pedido actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pedido, usuario o sede no encontrados
 */
router.put('/:id_pedido', async (req, res) => {
    try {
        const id = Number(req.params.id_pedido);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const {
            fecha,
            estado,
            total,
            tipo_compra,
            id_usuario,
            id_sede
        } = req.body;

        const usuarioId = Number(id_usuario);
        const sedeId = Number(id_sede);
        const totalPedido = Number(total);

        if (
            typeof estado !== 'string' ||
            estado.trim() === '' ||
            !Number.isFinite(totalPedido) ||
            totalPedido < 0 ||
            typeof tipo_compra !== 'string' ||
            tipo_compra.trim() === '' ||
            !Number.isInteger(usuarioId) ||
            usuarioId <= 0 ||
            !Number.isInteger(sedeId) ||
            sedeId <= 0 ||
            (fecha !== undefined &&
                (typeof fecha !== 'string' || fecha.trim() === ''))
        ) {
            return res.status(400).json({
                error: 'Datos inválidos. Revisa estado, total, tipo de compra, usuario, sede y fecha'
            });
        }

        const [pedidos] = await db.query(
            'SELECT id_pedido FROM pedido WHERE id_pedido = ?',
            [id]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        const [usuarios] = await db.query(
            'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
            [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                error: 'El usuario indicado no existe'
            });
        }

        const [sedes] = await db.query(
            'SELECT id_sede FROM sede WHERE id_sede = ?',
            [sedeId]
        );

        if (sedes.length === 0) {
            return res.status(404).json({
                error: 'La sede indicada no existe'
            });
        }

        if (fecha !== undefined) {
            await db.query(
                `UPDATE pedido
                SET fecha = ?, estado = ?, total = ?,
                    tipo_compra = ?, id_usuario = ?, id_sede = ?
                WHERE id_pedido = ?`,
                [
                    fecha,
                    estado.trim(),
                    totalPedido,
                    tipo_compra.trim(),
                    usuarioId,
                    sedeId,
                    id
                ]
            );
        } else {
            await db.query(
                `UPDATE pedido
                SET estado = ?, total = ?, tipo_compra = ?,
                    id_usuario = ?, id_sede = ?
                WHERE id_pedido = ?`,
                [
                    estado.trim(),
                    totalPedido,
                    tipo_compra.trim(),
                    usuarioId,
                    sedeId,
                    id
                ]
            );
        }

        res.json({
            mensaje: 'Pedido actualizado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al actualizar el pedido'
        });
    }
});

/**
 * @swagger
 * /api/pedidos/{id_pedido}:
 *   delete:
 *     summary: Eliminar un pedido
 *     tags: [Pedidos]
 *     parameters:
 *       - in: path
 *         name: id_pedido
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pedido eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: El pedido tiene pagos o detalles asociados
 */
router.delete('/:id_pedido', async (req, res) => {
    try {
        const id = Number(req.params.id_pedido);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const [pedidos] = await db.query(
            'SELECT id_pedido FROM pedido WHERE id_pedido = ?',
            [id]
        );

        if (pedidos.length === 0) {
            return res.status(404).json({
                error: 'Pedido no encontrado'
            });
        }

        await db.query(
            'DELETE FROM pedido WHERE id_pedido = ?',
            [id]
        );

        res.json({
            mensaje: 'Pedido eliminado correctamente'
        });
    } catch (error) {
        console.error(error);

        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            error.code === 'ER_ROW_IS_REFERENCED'
        ) {
            return res.status(409).json({
                error: 'No se puede eliminar el pedido porque tiene pagos o detalles asociados'
            });
        }

        res.status(500).json({
            error: 'Error al eliminar el pedido'
        });
    }
});

module.exports = router;