// Comprueba que el backend puede conectarse a MySQL (conexión de escritura y de lectura).
// Uso:  node probar-conexion.js
require('dotenv').config();

const escritura = require('./config/db.escritura');
const lectura = require('./config/db.lectura');

async function probar(nombre, pool) {
    try {
        const [filas] = await pool.query('SELECT DATABASE() AS base_datos, 1 AS prueba');
        console.log(`¡Conexión de ${nombre} exitosa!`, filas[0]);
    } catch (error) {
        console.error(`Error en la conexión de ${nombre}:`, error.message);
    }
}

(async () => {
    await probar('escritura', escritura);
    await probar('lectura', lectura);
    await escritura.end();
    await lectura.end();
})();
