// usuarios: consultas (solo GET).
// Usa la conexión de LECTURA.
const express = require('express');
const router = express.Router();
const pool = require('../../config/db.lectura');
const { requierePersonal } = require('../../middleware/auth');
const { idValido } = require('../../validaciones/usuarios');


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
router.get('/', requierePersonal, async (req, res) => {
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
router.get('/:id_usuario', requierePersonal, async (req, res) => {
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

module.exports = router;
