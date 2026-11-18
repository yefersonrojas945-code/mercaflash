
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const pool = require('../config/db');

function idValido(id) {
    return Number.isInteger(id) && id > 0;
}

function validarUsuario(datos, requiereContrasena = true) {
    const {
        nombre,
        apellido,
        correo,
        contrasena,
        telefono,
        direccion
    } = datos;

    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof apellido !== 'string' || !apellido.trim() ||
        typeof correo !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
        (requiereContrasena &&
            (typeof contrasena !== 'string' || contrasena.length < 8)) ||
        (!requiereContrasena &&
            contrasena !== undefined &&
            (typeof contrasena !== 'string' || contrasena.length < 8)) ||
        (telefono != null && typeof telefono !== 'string') ||
        (direccion != null && typeof direccion !== 'string')
    ) {
        return false;
    }

    return true;
}

function datosPublicos(usuario) {
    const { contrasena, ...datos } = usuario;
    return datos;
}

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Consultar todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios sin contraseñas
 *       500:
 *         description: Error del servidor
 */
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await pool.execute(`
            SELECT id_usuario, nombre, apellido, correo, telefono, direccion
            FROM usuario
            ORDER BY id_usuario
        `);

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al consultar usuarios:', error.message);
        res.status(500).json({
            error: 'No se pudieron consultar los usuarios'
        });
    }
});

/**
 * @swagger
 * /api/usuarios/{id_usuario}:
 *   get:
 *     summary: Consultar un usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id_usuario', async (req, res) => {
    const id = Number(req.params.id_usuario);

    if (!idValido(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [usuarios] = await pool.execute(`
            SELECT id_usuario, nombre, apellido, correo, telefono, direccion
            FROM usuario
            WHERE id_usuario = ?
        `, [id]);

        if (usuarios.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.status(200).json(usuarios[0]);
    } catch (error) {
        console.error('Error al consultar usuario:', error.message);
        res.status(500).json({
            error: 'No se pudo consultar el usuario'
        });
    }
});

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Registrar un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - correo
 *               - contrasena
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana
 *               apellido:
 *                 type: string
 *                 example: Gómez
 *               correo:
 *                 type: string
 *                 example: ana.prueba@example.com
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: Prueba123!
 *               telefono:
 *                 type: string
 *                 nullable: true
 *                 example: "3001234567"
 *               direccion:
 *                 type: string
 *                 nullable: true
 *                 example: Medellín
 *     responses:
 *       201:
 *         description: Usuario registrado
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/', async (req, res) => {
    const datos = req.body;

    if (!validarUsuario(datos)) {
        return res.status(400).json({
            error: 'Datos inválidos. Revisa nombre, apellido, correo y contraseña (mínimo 8 caracteres)'
        });
    }

    try {
        const contrasenaHash = await bcrypt.hash(datos.contrasena, 10);

        const [resultado] = await pool.execute(
            `INSERT INTO usuario
                (nombre, apellido, correo, contrasena, telefono, direccion)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                datos.nombre.trim(),
                datos.apellido.trim(),
                datos.correo.trim().toLowerCase(),
                contrasenaHash,
                datos.telefono ?? null,
                datos.direccion ?? null
            ]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            id_usuario: resultado.insertId,
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            correo: datos.correo.trim().toLowerCase(),
            telefono: datos.telefono ?? null,
            direccion: datos.direccion ?? null
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El correo ya está registrado'
            });
        }

        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({
            error: 'No se pudo registrar el usuario'
        });
    }
});

/**
 * @swagger
 * /api/usuarios/{id_usuario}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id_usuario
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
 *               - nombre
 *               - apellido
 *               - correo
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               correo:
 *                 type: string
 *               contrasena:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               telefono:
 *                 type: string
 *                 nullable: true
 *               direccion:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El correo ya está registrado
 */
router.put('/:id_usuario', async (req, res) => {
    const id = Number(req.params.id_usuario);
    const datos = req.body;

    if (!idValido(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    if (!validarUsuario(datos, false)) {
        return res.status(400).json({
            error: 'Datos inválidos. Revisa nombre, apellido, correo y contraseña si la envías'
        });
    }

    try {
        const [existentes] = await pool.execute(
            'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
            [id]
        );

        if (existentes.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        let consulta;
        let parametros;

        if (datos.contrasena !== undefined) {
            const contrasenaHash = await bcrypt.hash(datos.contrasena, 10);

            consulta = `
                UPDATE usuario
                SET nombre = ?, apellido = ?, correo = ?,
                    contrasena = ?, telefono = ?, direccion = ?
                WHERE id_usuario = ?
            `;

            parametros = [
                datos.nombre.trim(),
                datos.apellido.trim(),
                datos.correo.trim().toLowerCase(),
                contrasenaHash,
                datos.telefono ?? null,
                datos.direccion ?? null,
                id
            ];
        } else {
            consulta = `
                UPDATE usuario
                SET nombre = ?, apellido = ?, correo = ?,
                    telefono = ?, direccion = ?
                WHERE id_usuario = ?
            `;

            parametros = [
                datos.nombre.trim(),
                datos.apellido.trim(),
                datos.correo.trim().toLowerCase(),
                datos.telefono ?? null,
                datos.direccion ?? null,
                id
            ];
        }

        await pool.execute(consulta, parametros);

        res.status(200).json({
            mensaje: 'Usuario actualizado correctamente',
            id_usuario: id,
            nombre: datos.nombre.trim(),
            apellido: datos.apellido.trim(),
            correo: datos.correo.trim().toLowerCase(),
            telefono: datos.telefono ?? null,
            direccion: datos.direccion ?? null
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El correo ya está registrado por otro usuario'
            });
        }

        console.error('Error al actualizar usuario:', error.message);
        res.status(500).json({
            error: 'No se pudo actualizar el usuario'
        });
    }
});

/**
 * @swagger
 * /api/usuarios/{id_usuario}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El usuario tiene pedidos asociados
 */
router.delete('/:id_usuario', async (req, res) => {
    const id = Number(req.params.id_usuario);

    if (!idValido(id)) {
        return res.status(400).json({
            error: 'El ID debe ser un número entero positivo'
        });
    }

    try {
        const [usuarios] = await pool.execute(
            'SELECT id_usuario FROM usuario WHERE id_usuario = ?',
            [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        await pool.execute(
            'DELETE FROM usuario WHERE id_usuario = ?',
            [id]
        );

        res.status(200).json({
            mensaje: 'Usuario eliminado correctamente',
            id_usuario: id
        });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar el usuario porque tiene pedidos asociados'
            });
        }

        console.error('Error al eliminar usuario:', error.message);
        res.status(500).json({
            error: 'No se pudo eliminar el usuario'
        });
    }
});

module.exports = router;
