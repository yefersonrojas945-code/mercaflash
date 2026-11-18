
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Autenticación del personal (login con PIN)
const autenticacionRoutes = require('./routes/autenticacion');

// Cada recurso tiene DOS routers con la misma URL:
//   routes/lectura/<archivo>.js    -> consultas (GET), usan la conexión de lectura
//   routes/escritura/<archivo>.js  -> comandos (POST, PUT, PATCH, DELETE), usan la conexión de escritura
const recursos = [
    { ruta: '/api/productos', archivo: 'productos' },
    { ruta: '/api/categorias', archivo: 'categorias' },
    { ruta: '/api/sedes', archivo: 'sedes' },
    { ruta: '/api/inventario', archivo: 'inventario' },
    { ruta: '/api/usuarios', archivo: 'usuarios' },
    { ruta: '/api/pedidos', archivo: 'pedidos' },
    { ruta: '/api/detalle-pedido', archivo: 'detalles_pedido' },
    { ruta: '/api/pagos', archivo: 'pagos' },
    { ruta: '/api/tienda', archivo: 'tienda' },
    { ruta: '/api/personal', archivo: 'personal' }
];

// Configuración del servidor
app.use(cors());
app.use(express.json());

// Documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// El frontend móvil se ejecuta por separado con Expo y consume esta API REST.

// Consultar estado del servidor
app.get('/api/estado', (req, res) => {
    res.json({
        estado: 'Activo',
        proyecto: 'MercaFlash'
    });
});

// Login del personal
app.use('/api/personal', autenticacionRoutes);

// Lecturas y escrituras de cada recurso
recursos.forEach(({ ruta, archivo }) => {
    app.use(ruta, require(`./routes/lectura/${archivo}`));
    app.use(ruta, require(`./routes/escritura/${archivo}`));
});

// Respuesta para rutas inexistentes
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada'
    });
});

// Errores no previstos
app.use((err, req, res, next) => {
    console.error(err);
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'JSON inválido' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`API ejecutándose en http://localhost:${PORT}`);
});