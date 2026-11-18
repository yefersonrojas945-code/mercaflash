
const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
router.get('/', async (req, res) => {
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
router.get('/:id_pago', async (req, res) => {
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

/**
 * @swagger
 * /api/pagos:
 *   post:
 *     summary: Registrar un pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - metodo
 *               - id_pedido
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2026-10-14 12:00:00"
 *               monto:
 *                 type: number
 *                 example: 25000
 *               metodo:
 *                 type: string
 *                 example: Tarjeta
 *               estado:
 *                 type: string
 *                 example: Pendiente
 *               id_pedido:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Pago registrado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pedido no encontrado
 */
router.post('/', async (req, res) => {
    try {
        const {
            fecha,
            monto,
            metodo,
            estado = 'Pendiente',
            id_pedido
        } = req.body;

        const montoPago = Number(monto);
        const pedidoId = Number(id_pedido);

        if (
            monto === undefined ||
            monto === null ||
            monto === '' ||
            !Number.isFinite(montoPago) ||
            montoPago <= 0 ||
            typeof metodo !== 'string' ||
            metodo.trim() === '' ||
            typeof estado !== 'string' ||
            estado.trim() === '' ||
            !Number.isInteger(pedidoId) ||
            pedidoId <= 0 ||
            (fecha !== undefined &&
                (typeof fecha !== 'string' || fecha.trim() === ''))
        ) {
            return res.status(400).json({
                error: 'Datos inválidos. Revisa monto, método, estado, pedido y fecha'
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

        let resultado;

        if (fecha !== undefined) {
            [resultado] = await db.query(
                `INSERT INTO pago
                (fecha, monto, metodo, estado, id_pedido)
                VALUES (?, ?, ?, ?, ?)`,
                [
                    fecha,
                    montoPago,
                    metodo.trim(),
                    estado.trim(),
                    pedidoId
                ]
            );
        } else {
            [resultado] = await db.query(
                `INSERT INTO pago
                (monto, metodo, estado, id_pedido)
                VALUES (?, ?, ?, ?)`,
                [
                    montoPago,
                    metodo.trim(),
                    estado.trim(),
                    pedidoId
                ]
            );
        }

        res.status(201).json({
            mensaje: 'Pago registrado correctamente',
            id_pago: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al registrar el pago'
        });
    }
});

/**
 * @swagger
 * /api/pagos/{id_pago}:
 *   put:
 *     summary: Actualizar un pago
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id_pago
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
 *               - monto
 *               - metodo
 *               - estado
 *               - id_pedido
 *             properties:
 *               fecha:
 *                 type: string
 *                 example: "2026-10-14 12:00:00"
 *               monto:
 *                 type: number
 *                 example: 25000
 *               metodo:
 *                 type: string
 *                 example: Transferencia
 *               estado:
 *                 type: string
 *                 example: Pagado
 *               id_pedido:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Pago actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pago o pedido no encontrado
 */
router.put('/:id_pago', async (req, res) => {
    try {
        const id = Number(req.params.id_pago);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const {
            fecha,
            monto,
            metodo,
            estado,
            id_pedido
        } = req.body;

        const montoPago = Number(monto);
        const pedidoId = Number(id_pedido);

        if (
            monto === undefined ||
            monto === null ||
            monto === '' ||
            !Number.isFinite(montoPago) ||
            montoPago <= 0 ||
            typeof metodo !== 'string' ||
            metodo.trim() === '' ||
            typeof estado !== 'string' ||
            estado.trim() === '' ||
            !Number.isInteger(pedidoId) ||
            pedidoId <= 0 ||
            (fecha !== undefined &&
                (typeof fecha !== 'string' || fecha.trim() === ''))
        ) {
            return res.status(400).json({
                error: 'Datos inválidos. Revisa monto, método, estado, pedido y fecha'
            });
        }

        const [pagos] = await db.query(
            'SELECT id_pago FROM pago WHERE id_pago = ?',
            [id]
        );

        if (pagos.length === 0) {
            return res.status(404).json({
                error: 'Pago no encontrado'
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

        if (fecha !== undefined) {
            await db.query(
                `UPDATE pago
                 SET fecha = ?, monto = ?, metodo = ?,
                     estado = ?, id_pedido = ?
                 WHERE id_pago = ?`,
                [
                    fecha,
                    montoPago,
                    metodo.trim(),
                    estado.trim(),
                    pedidoId,
                    id
                ]
            );
        } else {
            await db.query(
                `UPDATE pago
                 SET monto = ?, metodo = ?, estado = ?, id_pedido = ?
                 WHERE id_pago = ?`,
                [
                    montoPago,
                    metodo.trim(),
                    estado.trim(),
                    pedidoId,
                    id
                ]
            );
        }

        res.json({
            mensaje: 'Pago actualizado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al actualizar el pago'
        });
    }
});

/**
 * @swagger
 * /api/pagos/{id_pago}:
 *   delete:
 *     summary: Eliminar un pago
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: id_pago
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Pago no encontrado
 */
router.delete('/:id_pago', async (req, res) => {
    try {
        const id = Number(req.params.id_pago);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const [pagos] = await db.query(
            'SELECT id_pago FROM pago WHERE id_pago = ?',
            [id]
        );

        if (pagos.length === 0) {
            return res.status(404).json({
                error: 'Pago no encontrado'
            });
        }

        await db.query(
            'DELETE FROM pago WHERE id_pago = ?',
            [id]
        );

        res.json({
            mensaje: 'Pago eliminado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al eliminar el pago'
        });
    }
});

module.exports = router;
