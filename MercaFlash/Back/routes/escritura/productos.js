// productos: comandos (POST, PUT, PATCH y DELETE).
// Usa la conexión de ESCRITURA. Todas las rutas requieren el token del personal.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.escritura');
const { requierePersonal } = require('../../middleware/auth');
const { limpiar, campoInvalido, esEnteroPositivo } = require('../../validaciones/productos');

const ICONO_POR_DEFECTO = '🛒';
const MENSAJE_DATOS = 'Datos inválidos. Revisa nombre, descripción, precio, imagen, stock e ID de categoría';

async function categoriaExiste(id) {
    const [filas] = await pool.execute(
        'SELECT id_categoria FROM categoria WHERE id_categoria = ?',
        [id]
    );
    return filas.length > 0;
}

async function productoExiste(id) {
    const [filas] = await pool.execute(
        'SELECT id_producto FROM producto WHERE id_producto = ?',
        [id]
    );
    return filas.length > 0;
}

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
 *             type: object
 *             required: [nombre, descripcion, precio, imagen, stock, id_categoria]
 *             properties:
 *               nombre: { type: string, example: "Leche entera (1L)" }
 *               descripcion: { type: string, example: "Leche entera pasteurizada" }
 *               precio: { type: number, example: 4300 }
 *               imagen: { type: string, example: "" }
 *               stock: { type: integer, example: 20 }
 *               id_categoria: { type: integer, example: 1 }
 *               icono: { type: string, example: "🥛", description: "Emoji del producto (opcional, por defecto 🛒)" }
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos
 */
router.post('/', requierePersonal, async (req, res) => {
    const datos = limpiar(req.body);
    if (campoInvalido(datos, { completo: true })) {
        return res.status(400).json({ error: MENSAJE_DATOS });
    }

    try {
        if (!(await categoriaExiste(datos.id_categoria))) {
            return res.status(400).json({ error: 'La categoría indicada no existe' });
        }

        const icono = datos.icono || ICONO_POR_DEFECTO;
        const [resultado] = await pool.execute(
            `INSERT INTO producto
                (nombre, descripcion, precio, imagen, stock, id_categoria, icono)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [datos.nombre, datos.descripcion, datos.precio, datos.imagen, datos.stock, datos.id_categoria, icono]
        );

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            id: resultado.insertId,
            ...datos,
            icono
        });
    } catch (error) {
        console.error('Error al crear producto:', error.message);
        res.status(500).json({ error: 'No se pudo crear el producto' });
    }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Reemplazar todos los datos de un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, descripcion, precio, imagen, stock, id_categoria]
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               precio: { type: number }
 *               imagen: { type: string }
 *               stock: { type: integer }
 *               id_categoria: { type: integer }
 *               icono: { type: string, description: "Opcional; si no se envía se conserva el actual" }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id', requierePersonal, async (req, res) => {
    const id = Number(req.params.id);
    if (!esEnteroPositivo(id)) {
        return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const datos = limpiar(req.body);
    if (campoInvalido(datos, { completo: true })) {
        return res.status(400).json({ error: MENSAJE_DATOS });
    }

    try {
        if (!(await categoriaExiste(datos.id_categoria))) {
            return res.status(400).json({ error: 'La categoría indicada no existe' });
        }
        if (!(await productoExiste(id))) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await pool.execute(
            `UPDATE producto
                SET nombre = ?, descripcion = ?, precio = ?, imagen = ?,
                    stock = ?, id_categoria = ?, icono = COALESCE(?, icono)
              WHERE id_producto = ?`,
            [datos.nombre, datos.descripcion, datos.precio, datos.imagen, datos.stock,
             datos.id_categoria, datos.icono ?? null, id]
        );

        res.json({ mensaje: 'Producto actualizado correctamente', id, ...datos });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ error: 'No se pudo actualizar el producto' });
    }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   patch:
 *     summary: Cambiar solo algunos campos de un producto (por ejemplo precio o stock)
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre: { type: string }
 *               descripcion: { type: string }
 *               precio: { type: number, example: 4500 }
 *               imagen: { type: string }
 *               stock: { type: integer, example: 30 }
 *               id_categoria: { type: integer }
 *               icono: { type: string }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Datos inválidos o sin campos para actualizar
 *       404:
 *         description: Producto no encontrado
 */
router.patch('/:id', requierePersonal, async (req, res) => {
    const id = Number(req.params.id);
    if (!esEnteroPositivo(id)) {
        return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    const datos = limpiar(req.body);
    const campos = Object.keys(datos); // solo campos de la lista permitida: es seguro usarlos en el SQL
    if (campos.length === 0) {
        return res.status(400).json({ error: 'Envía al menos un campo para actualizar' });
    }
    const invalido = campoInvalido(datos, { completo: false });
    if (invalido) {
        return res.status(400).json({ error: `El campo "${invalido}" no es válido` });
    }

    try {
        if (datos.id_categoria !== undefined && !(await categoriaExiste(datos.id_categoria))) {
            return res.status(400).json({ error: 'La categoría indicada no existe' });
        }
        if (!(await productoExiste(id))) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await pool.execute(
            `UPDATE producto SET ${campos.map((c) => `${c} = ?`).join(', ')} WHERE id_producto = ?`,
            [...campos.map((c) => datos[c]), id]
        );

        res.json({ mensaje: 'Producto actualizado correctamente', id, ...datos });
    } catch (error) {
        console.error('Error al actualizar producto:', error.message);
        res.status(500).json({ error: 'No se pudo actualizar el producto' });
    }
});

/**
 * @swagger
 * /api/productos/{id}/activo:
 *   patch:
 *     summary: Activar o desactivar un producto
 *     description: Un producto desactivado deja de aparecer en el catálogo y no se puede comprar, pero se conserva en los pedidos anteriores.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activo]
 *             properties:
 *               activo: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 */
router.patch('/:id/activo', requierePersonal, async (req, res) => {
    const id = Number(req.params.id);
    if (!esEnteroPositivo(id)) {
        return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }
    const activo = (req.body || {}).activo;
    if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'El campo "activo" debe ser true o false' });
    }

    try {
        if (!(await productoExiste(id))) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        await pool.execute('UPDATE producto SET activo = ? WHERE id_producto = ?', [activo ? 1 : 0, id]);
        res.json({ mensaje: activo ? 'Producto activado' : 'Producto desactivado', id, activo });
    } catch (error) {
        console.error('Error al cambiar el estado del producto:', error.message);
        res.status(500).json({ error: 'No se pudo cambiar el estado del producto' });
    }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     description: Solo se puede eliminar si nunca se vendió. Si ya aparece en pedidos, hay que desactivarlo.
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: El producto tiene pedidos o inventario asociados
 */
router.delete('/:id', requierePersonal, async (req, res) => {
    const id = Number(req.params.id);
    if (!esEnteroPositivo(id)) {
        return res.status(400).json({ error: 'El ID debe ser un número entero positivo' });
    }

    try {
        const [productosBD] = await pool.execute(
            'SELECT id_producto, nombre FROM producto WHERE id_producto = ?',
            [id]
        );
        if (productosBD.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        await pool.execute('DELETE FROM producto WHERE id_producto = ?', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente', producto: productosBD[0] });
    } catch (error) {
        console.error('Error al eliminar producto:', error.message);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar el producto porque está asociado a pedidos o inventario. Desactívalo para ocultarlo del catálogo.'
            });
        }
        res.status(500).json({ error: 'No se pudo eliminar el producto' });
    }
});

module.exports = router;
