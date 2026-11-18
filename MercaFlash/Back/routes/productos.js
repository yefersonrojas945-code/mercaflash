
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Catálogo temporal de MercaFlash.
// Después se consultará desde MySQL.
let productos = [
    { id: 1, name: "Manzanas rojas (kg)", cat: "Frutas", price: 4500, icon: "🍎", cantidad: 20, estado: true },
    { id: 2, name: "Banano (kg)", cat: "Frutas", price: 2800, icon: "🍌", cantidad: 20, estado: true },
    { id: 3, name: "Naranja (kg)", cat: "Frutas", price: 2600, icon: "🍊", cantidad: 20, estado: true },
    { id: 4, name: "Aguacate (unidad)", cat: "Frutas", price: 2200, icon: "🥑", cantidad: 20, estado: true },
    { id: 5, name: "Mango (kg)", cat: "Frutas", price: 3400, icon: "🥭", cantidad: 20, estado: true },

    { id: 6, name: "Tomate chonto (kg)", cat: "Verduras", price: 3200, icon: "🍅", cantidad: 20, estado: true },
    { id: 7, name: "Papa criolla (kg)", cat: "Verduras", price: 3900, icon: "🥔", cantidad: 20, estado: true },
    { id: 8, name: "Cebolla cabezona (kg)", cat: "Verduras", price: 3100, icon: "🧅", cantidad: 20, estado: true },
    { id: 9, name: "Zanahoria (kg)", cat: "Verduras", price: 2400, icon: "🥕", cantidad: 20, estado: true },
    { id: 10, name: "Lechuga (unidad)", cat: "Verduras", price: 2000, icon: "🥬", cantidad: 20, estado: true },

    { id: 11, name: "Leche entera (1L)", cat: "Lácteos", price: 4300, icon: "🥛", cantidad: 20, estado: true },
    { id: 12, name: "Queso campesino (500g)", cat: "Lácteos", price: 9800, icon: "🧀", cantidad: 20, estado: true },
    { id: 13, name: "Huevos AA (x30)", cat: "Lácteos", price: 16500, icon: "🥚", cantidad: 20, estado: true },
    { id: 14, name: "Yogurt natural (1L)", cat: "Lácteos", price: 8700, icon: "🍶", cantidad: 20, estado: true },
    { id: 15, name: "Mantequilla (250g)", cat: "Lácteos", price: 6900, icon: "🧈", cantidad: 20, estado: true },

    { id: 16, name: "Pan tajado", cat: "Panadería", price: 5200, icon: "🍞", cantidad: 20, estado: true },
    { id: 17, name: "Croissant (x4)", cat: "Panadería", price: 7300, icon: "🥐", cantidad: 20, estado: true },
    { id: 18, name: "Arepas (paquete)", cat: "Panadería", price: 4800, icon: "🫓", cantidad: 20, estado: true },

    { id: 19, name: "Arroz (1kg)", cat: "Despensa", price: 3600, icon: "🍚", cantidad: 20, estado: true },
    { id: 20, name: "Aceite vegetal (1L)", cat: "Despensa", price: 8900, icon: "🫙", cantidad: 20, estado: true },
    { id: 21, name: "Café molido (500g)", cat: "Despensa", price: 14200, icon: "☕", cantidad: 20, estado: true },
    { id: 22, name: "Panela (1kg)", cat: "Despensa", price: 3300, icon: "🍯", cantidad: 20, estado: true },
    { id: 23, name: "Pasta (500g)", cat: "Despensa", price: 3900, icon: "🍝", cantidad: 20, estado: true },
    { id: 24, name: "Lentejas (500g)", cat: "Despensa", price: 4600, icon: "🫘", cantidad: 20, estado: true },

    { id: 25, name: "Pechuga de pollo (kg)", cat: "Carnes", price: 14900, icon: "🍗", cantidad: 20, estado: true },
    { id: 26, name: "Carne molida (kg)", cat: "Carnes", price: 17800, icon: "🥩", cantidad: 20, estado: true },
    { id: 27, name: "Tilapia (kg)", cat: "Carnes", price: 19500, icon: "🐟", cantidad: 20, estado: true },

    { id: 28, name: "Jugo de naranja (1L)", cat: "Bebidas", price: 6200, icon: "🧃", cantidad: 20, estado: true },
    { id: 29, name: "Gaseosa (1.5L)", cat: "Bebidas", price: 5400, icon: "🥤", cantidad: 20, estado: true },
    { id: 30, name: "Agua (6 pack)", cat: "Bebidas", price: 8100, icon: "💧", cantidad: 20, estado: true },

    { id: 31, name: "Papas fritas (paquete)", cat: "Snacks", price: 4700, icon: "🍟", cantidad: 20, estado: true },
    { id: 32, name: "Galletas (paquete)", cat: "Snacks", price: 3800, icon: "🍪", cantidad: 20, estado: true },
    { id: 33, name: "Chocolatina (unidad)", cat: "Snacks", price: 2100, icon: "🍫", cantidad: 20, estado: true },

    { id: 34, name: "Detergente (1kg)", cat: "Aseo", price: 11800, icon: "🧴", cantidad: 20, estado: true },
    { id: 35, name: "Papel higiénico (x12)", cat: "Aseo", price: 15300, icon: "🧻", cantidad: 20, estado: true },
    { id: 36, name: "Jabón de baño (x3)", cat: "Aseo", price: 7200, icon: "🧼", cantidad: 20, estado: true }
];

let siguienteId = 37;

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
            WHERE p.id_producto = ?
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


/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *           example:
 *             name: "Manzanas verdes (kg)"
 *             cat: "Frutas"
 *             price: 5000
 *             icon: "🍏"
 *             cantidad: 15
 *             estado: true
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *       400:
 *         description: Datos inválidos
 */


/*POST: crear un producto*/
router.post('/', async (req, res) => {
    const { nombre, descripcion, precio, imagen, stock, id_categoria } = req.body;

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof descripcion !== 'string' ||
        typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0 ||
        typeof imagen !== 'string' ||
        !Number.isInteger(stock) || stock < 0 ||
        !Number.isInteger(id_categoria) || id_categoria <= 0
    ) {
        return res.status(400).json({
            error: 'Datos inválidos. Revisa nombre, descripción, precio, imagen, stock e ID de categoría'
        });
    }

    try {
        const [categorias] = await pool.execute(
            'SELECT id_categoria FROM categoria WHERE id_categoria = ?',
            [id_categoria]
        );

        if (categorias.length === 0) {
            return res.status(400).json({
                error: 'La categoría indicada no existe'
            });
        }

        const [resultado] = await pool.execute(
            `INSERT INTO producto
                (nombre, descripcion, precio, imagen, stock, id_categoria)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                nombre.trim(),
                descripcion.trim(),
                precio,
                imagen,
                stock,
                id_categoria
            ]
        );

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            id: resultado.insertId,
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            precio,
            imagen,
            stock,
            id_categoria
        });

    } catch (error) {
        console.error('Error al crear producto:', error.message);

        res.status(500).json({
            error: 'No se pudo crear el producto'
        });
    }
});


/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identificador del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Producto'
 *           example:
 *             name: "Manzanas rojas (kg)"
 *             cat: "Frutas"
 *             price: 4800
 *             icon: "🍎"
 *             cantidad: 25
 *             estado: true
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       400:
 *         description: Datos o ID inválidos
 *       404:
 *         description: Producto no encontrado
 */


/**
 * PUT: actualizar un producto
 */
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    const { nombre, descripcion, precio, imagen, stock, id_categoria } = req.body;

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof descripcion !== 'string' ||
        typeof precio !== 'number' || !Number.isFinite(precio) || precio < 0 ||
        typeof imagen !== 'string' ||
        !Number.isInteger(stock) || stock < 0 ||
        !Number.isInteger(id_categoria) || id_categoria <= 0
    ) {
        return res.status(400).json({
            error: 'Datos inválidos. Revisa nombre, descripción, precio, imagen, stock e ID de categoría'
        });
    }

    try {
        const [categorias] = await pool.execute(
            'SELECT id_categoria FROM categoria WHERE id_categoria = ?',
            [id_categoria]
        );

        if (categorias.length === 0) {
            return res.status(400).json({
                error: 'La categoría indicada no existe'
            });
        }

        const [productosBD] = await pool.execute(
            'SELECT id_producto FROM producto WHERE id_producto = ?',
            [id]
        );

        if (productosBD.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

      const [resultado] = await pool.execute(
    `UPDATE producto
     SET nombre = ?,
         descripcion = ?,
         precio = ?,
         imagen = ?,
         stock = ?,
         id_categoria = ?
     WHERE id_producto = ?`,
    [
        nombre.trim(),
        descripcion.trim(),
        precio,
        imagen,
        stock,
        id_categoria,
        id
    ]
);

console.log('Resultado del UPDATE:', resultado);

        res.json({
            mensaje: 'Producto actualizado correctamente',
            id,
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            precio,
            imagen,
            stock,
            id_categoria
        });

    } catch (error) {
        console.error('Error al actualizar producto:', error.message);

        res.status(500).json({
            error: 'No se pudo actualizar el producto'
        });
    }
});


/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
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
 *         description: Producto eliminado correctamente
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 */


/**
 * DELETE: eliminar un producto
 */
router.delete('/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [productosBD] = await pool.execute(
            `SELECT id_producto, nombre
             FROM producto
             WHERE id_producto = ?`,
            [id]
        );

        if (productosBD.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM producto WHERE id_producto = ?',
            [id]
        );

        res.json({
            mensaje: 'Producto eliminado correctamente',
            producto: productosBD[0]
        });

    } catch (error) {
        console.error('Error al eliminar producto:', error.message);

        res.status(500).json({
            error: 'No se pudo eliminar el producto'
        });
    }
});


module.exports = router;