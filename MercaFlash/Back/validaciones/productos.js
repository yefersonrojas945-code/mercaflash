// Reglas de validación de productos. Las comparten POST, PUT y PATCH.
const esEnteroPositivo = (v) => Number.isInteger(v) && v > 0;

const reglas = {
    nombre: (v) => typeof v === 'string' && v.trim() !== '',
    descripcion: (v) => typeof v === 'string',
    precio: (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
    imagen: (v) => typeof v === 'string',
    stock: (v) => Number.isInteger(v) && v >= 0,
    id_categoria: esEnteroPositivo,
    icono: (v) => typeof v === 'string' && v.trim() !== '' && [...v.trim()].length <= 16
};

const CAMPOS = Object.keys(reglas);
const OBLIGATORIOS = ['nombre', 'descripcion', 'precio', 'imagen', 'stock', 'id_categoria'];

// Se queda solo con los campos permitidos y recorta los textos
function limpiar(cuerpo) {
    const datos = {};
    for (const campo of CAMPOS) {
        const valor = (cuerpo || {})[campo];
        if (valor === undefined) continue;
        datos[campo] = typeof valor === 'string' ? valor.trim() : valor;
    }
    return datos;
}

// Devuelve el nombre del primer campo inválido, o null si todo está bien.
// completo: true  -> exige los campos obligatorios (POST y PUT)
// completo: false -> solo valida los que vengan (PATCH)
function campoInvalido(datos, { completo }) {
    for (const campo of CAMPOS) {
        if (datos[campo] === undefined) {
            if (completo && OBLIGATORIOS.includes(campo)) return campo;
            continue;
        }
        if (!reglas[campo](datos[campo])) return campo;
    }
    return null;
}

module.exports = { limpiar, campoInvalido, esEnteroPositivo };
