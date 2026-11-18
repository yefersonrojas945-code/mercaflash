# Arquitectura del backend

API REST en Node.js + Express con MySQL, organizada en **lectura** (consultas) y **escritura** (comandos).

## Estructura

```
Back/
├── server.js                  # Arranque: monta cada recurso con su router de lectura y de escritura
├── swagger.js                 # Documentación (http://localhost:3000/api-docs)
├── config/
│   ├── db.lectura.js          # Conexión usada solo por las consultas (GET)
│   └── db.escritura.js        # Conexión usada solo por los comandos (POST, PUT, PATCH, DELETE)
├── routes/
│   ├── lectura/<recurso>.js   # Solo GET
│   ├── escritura/<recurso>.js # Solo POST, PUT, PATCH y DELETE
│   └── autenticacion.js       # Login del personal (PIN -> token)
├── middleware/auth.js         # Token del personal (requierePersonal)
├── validaciones/              # Validaciones puras compartidas entre lectura y escritura
└── services/
    ├── pedidos.js             # Consulta de pedidos con sus productos y filtro por estado
    └── errores.js             # ErrorNegocio: errores esperados con su código HTTP
```

Cada recurso se publica con la misma URL en sus dos routers (por ejemplo `/api/productos`):
el `GET` lo atiende `routes/lectura/productos.js` y el `POST/PUT/DELETE`, `routes/escritura/productos.js`.
Las URLs de la API no cambian.

## Lectura y escritura separadas

- Las rutas de lectura usan la conexión `config/db.lectura.js` y no pueden modificar datos.
- Las rutas de escritura usan `config/db.escritura.js`.
- En desarrollo ambas apuntan a la misma base. Si se define `DB_READ_HOST` (y las demás `DB_READ_*`)
  en el `.env`, las consultas van a otro servidor, por ejemplo una réplica de solo lectura, sin tocar el código.

## Acceso

| Acceso | Endpoints |
|---|---|
| Público | `GET` productos, categorías y sedes; `POST /api/usuarios` (registro); `GET` y `POST /api/tienda/pedidos`; `POST /api/personal/login` |
| Con token del personal | Todo lo demás: crear, editar y borrar datos, y consultar usuarios, pedidos, detalle de pedido, pagos e inventario |

El token se obtiene con `POST /api/personal/login` (cuerpo `{ "pin": "1234" }`) y se envía en la cabecera
`Authorization: Bearer <token>`. En Swagger, el botón **Authorize** permite pegarlo para probar las rutas protegidas.
Los tokens duran 8 horas y viven en la memoria del servidor (se pierden al reiniciarlo).

## Administración (panel del personal)

Todas estas rutas requieren el token del personal.

| Acción | Endpoint |
|---|---|
| Listar todos los productos (incluye desactivados) | `GET /api/personal/productos` |
| Crear un producto | `POST /api/productos` |
| Editar todos los datos de un producto | `PUT /api/productos/:id` |
| Cambiar solo algunos campos (precio, stock...) | `PATCH /api/productos/:id` |
| Activar o desactivar un producto | `PATCH /api/productos/:id/activo` con `{ "activo": false }` |
| Eliminar un producto (solo si nunca se vendió) | `DELETE /api/productos/:id` |
| Crear, editar y eliminar categorías y sedes | `POST`, `PUT` y `DELETE` en `/api/categorias` y `/api/sedes` |
| Listar pedidos, con filtro opcional | `GET /api/personal/pedidos?estado=pendiente\|listo\|cancelado` |
| Marcar un pedido como listo | `PATCH /api/personal/pedidos/:codigo/listo` |
| Cancelar un pedido | `PATCH /api/personal/pedidos/:codigo/cancelar` |

Reglas de negocio:

- Un producto **desactivado** deja de aparecer en el catálogo y no se puede comprar, pero se conserva en los
  pedidos anteriores. Un producto que ya salió en algún pedido no se puede eliminar (la API responde 409 y
  sugiere desactivarlo). Lo mismo pasa con una categoría que tiene productos o una sede que tiene pedidos.
- **Cancelar** un pedido, en una sola transacción: lo marca como cancelado, devuelve las unidades al stock y marca
  el pago como reembolsado (el pago es simulado). Cancelarlo otra vez responde 409 y no devuelve el stock de nuevo.
  Un pedido cancelado no se puede marcar como listo.
- La API responde el estado de un pedido siempre como `pendiente`, `listo` o `cancelado`.
