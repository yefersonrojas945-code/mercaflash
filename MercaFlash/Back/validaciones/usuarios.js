// Validaciones y utilidades puras de usuarios (no tocan la base de datos).
// Las comparten las rutas de lectura y de escritura.

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

module.exports = { idValido, validarUsuario, datosPublicos };
