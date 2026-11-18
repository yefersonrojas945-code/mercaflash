
const swaggerJsdoc = require('swagger-jsdoc');

const opciones = {
    definition: {
        openapi: '3.0.0',

        info: {
            title: 'API MercaFlash',
            version: '1.0.0',
            description:
                'API REST para gestionar usuarios, productos, categorías, sedes, inventario, pedidos, detalles de pedidos y pagos del supermercado MercaFlash.'
        },

        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor local de desarrollo'
            }
        ],

        // Todas las operaciones aceptan el token del personal (botón "Authorize")
        security: [{ bearerAuth: [] }],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    description: 'Token que devuelve POST /api/personal/login'
                }
            },
            schemas: {
                Usuario: {
                    type: 'object',
                    properties: {
                        id_usuario: { type: 'integer', example: 1 },
                        nombre: { type: 'string', example: 'Carlos' },
                        apellido: { type: 'string', example: 'Ramírez' },
                        correo: {
                            type: 'string',
                            format: 'email',
                            example: 'carlos@example.com'
                        },
                        contrasena: {
                            type: 'string',
                            format: 'password',
                            example: 'Prueba123!'
                        },
                        telefono: { type: 'string', example: '3001234567' },
                        direccion: {
                            type: 'string',
                            example: 'Laureles, Medellín'
                        }
                    }
                },

                Categoria: {
                    type: 'object',
                    required: ['nombre', 'descripcion'],
                    properties: {
                        id_categoria: { type: 'integer', example: 1 },
                        nombre: { type: 'string', example: 'Frutas' },
                        descripcion: {
                            type: 'string',
                            example: 'Frutas frescas'
                        }
                    }
                },

                Producto: {
                    type: 'object',
                    required: [
                        'nombre',
                        'descripcion',
                        'precio',
                        'imagen',
                        'stock',
                        'id_categoria'
                    ],
                    properties: {
                        id_producto: { type: 'integer', example: 2 },
                        nombre: {
                            type: 'string',
                            example: 'Banano (kg)'
                        },
                        descripcion: {
                            type: 'string',
                            example: 'Banano fresco por kilogramo'
                        },
                        precio: { type: 'number', example: 3500 },
                        imagen: {
                            type: 'string',
                            example: 'banano.jpg'
                        },
                        stock: { type: 'integer', example: 20 },
                        id_categoria: { type: 'integer', example: 1 }
                    }
                },

                Sede: {
                    type: 'object',
                    required: ['nombre', 'direccion', 'ciudad'],
                    properties: {
                        id_sede: { type: 'integer', example: 1 },
                        nombre: {
                            type: 'string',
                            example: 'Sede Laureles'
                        },
                        direccion: {
                            type: 'string',
                            example: 'Dirección de prueba - Laureles'
                        },
                        ciudad: { type: 'string', example: 'Medellín' },
                        horario: {
                            type: 'string',
                            example: 'Lunes a sábado, 8:00 a. m. - 8:00 p. m.'
                        }
                    }
                },

                Inventario: {
                    type: 'object',
                    required: ['cantidad', 'id_sede', 'id_producto'],
                    properties: {
                        id_inventario: { type: 'integer', example: 1 },
                        cantidad: { type: 'integer', example: 20 },
                        id_sede: { type: 'integer', example: 1 },
                        id_producto: { type: 'integer', example: 2 }
                    }
                },

                Pedido: {
                    type: 'object',
                    required: [
                        'tipo_compra',
                        'id_usuario',
                        'id_sede'
                    ],
                    properties: {
                        id_pedido: { type: 'integer', example: 1 },
                        fecha: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-10-14T12:00:00'
                        },
                        estado: {
                            type: 'string',
                            example: 'Pendiente'
                        },
                        total: { type: 'number', example: 25000 },
                        tipo_compra: {
                            type: 'string',
                            example: 'Recoger en sede'
                        },
                        id_usuario: { type: 'integer', example: 1 },
                        id_sede: { type: 'integer', example: 1 }
                    }
                },

                DetallePedido: {
                    type: 'object',
                    required: [
                        'id_pedido',
                        'id_producto',
                        'cantidad',
                        'precio_unitario'
                    ],
                    properties: {
                        id_detalle: { type: 'integer', example: 1 },
                        id_pedido: { type: 'integer', example: 1 },
                        id_producto: { type: 'integer', example: 2 },
                        cantidad: { type: 'integer', example: 2 },
                        precio_unitario: { type: 'number', example: 3500 }
                    }
                },

                Pago: {
                    type: 'object',
                    required: ['monto', 'metodo', 'id_pedido'],
                    properties: {
                        id_pago: { type: 'integer', example: 1 },
                        fecha: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-10-14T12:00:00'
                        },
                        monto: { type: 'number', example: 25000 },
                        metodo: {
                            type: 'string',
                            example: 'Tarjeta'
                        },
                        estado: {
                            type: 'string',
                            example: 'Pendiente'
                        },
                        id_pedido: { type: 'integer', example: 1 }
                    }
                }
            }
        }
    },

    apis: ['./routes/**/*.js']
};

const swaggerSpec = swaggerJsdoc(opciones);

module.exports = swaggerSpec;
