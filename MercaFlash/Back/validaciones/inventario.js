// Validaciones y utilidades puras de inventario (no tocan la base de datos).
// Las comparten las rutas de lectura y de escritura.

// Validar que un valor sea un entero positivo
function esIdValido(valor) {
    return Number.isInteger(valor) && valor > 0;
}

// Validar los datos del inventario
function validarDatos(cantidad, id_sede, id_producto) {
    return (
        Number.isInteger(cantidad) &&
        cantidad >= 0 &&
        esIdValido(id_sede) &&
        esIdValido(id_producto)
    );
}

module.exports = { esIdValido, validarDatos };
