# MercaFlash

Aplicación móvil multiplataforma para realizar compras virtuales y recoger pedidos en tienda. La solución está separada en **Frontend móvil**, **API REST** y **Base de datos**, conforme a la estructura solicitada para la entrega.

## Estructura

```text
MercaFlash/
├── Front/   # Expo + React Native + TypeScript
├── Back/    # Node.js + Express (API REST JSON)
├── BD/      # Scripts SQL/DDL de MySQL
└── Readme.md
```

## Tecnologías

**Frontend:** Expo, React Native y TypeScript.  
**Backend:** Node.js, Express, CORS y Swagger.  
**Base de datos:** MySQL (`mysql2`).  
**API:** REST con respuestas JSON.

## 1. Preparar la base de datos

1. Inicia MySQL.
2. Ejecuta `BD/database.sql` para crear la base `mercaflash`, tablas, claves y relaciones.
3. Si deseas cargar el catálogo inicial, ejecuta después `BD/catalogo-inicial.sql`.

## 2. Ejecutar el backend

Requiere Node.js y acceso a MySQL.

```bash
cd Back
npm install
```

Copia `.env.example` como `.env` y configura los datos reales de MySQL y el PIN del personal. Después:

```bash
npm start
```

La API queda en `http://localhost:3000/api`. La documentación Swagger está en `http://localhost:3000/api-docs`.

Puedes comprobar el servidor con `GET http://localhost:3000/api/estado`.

## 3. Ejecutar el frontend móvil

Expo SDK 58 requiere Node.js 22.13 o superior.

```bash
cd Front
npm install
```

Copia `.env.example` como `.env` y configura la URL del backend:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:3000/api
```

**Importante:** si pruebas desde un celular físico, cambia `192.168.1.25` por la IPv4 local del computador donde corre el backend. El computador y el celular deben estar en la misma red. No uses `localhost` desde el celular, porque allí `localhost` sería el propio teléfono.

Luego ejecuta:

```bash
npx expo start
```

Abre el proyecto con una versión compatible de Expo Go o con un emulador/desarrollo nativo. Para comprobar TypeScript:

```bash
npm run typecheck
```

## Funcionalidades del frontend

- Catálogo cargado desde `GET /api/productos`.
- Filtro por categorías.
- Carrito y cálculo del total.
- Selección de sede desde `GET /api/sedes`.
- Creación de pedidos mediante `POST /api/tienda/pedidos`.
- Consulta del estado de los pedidos creados durante la sesión.
- Acceso del personal mediante PIN.
- Consulta de pedidos del personal.
- Cambio de estado de un pedido a listo.
- Interfaz adaptable para Android/iOS mediante React Native.

## API REST

Además del flujo móvil, el backend contiene recursos REST para productos, categorías, sedes, inventario, usuarios, pedidos, detalle de pedido y pagos. Usa métodos HTTP `GET`, `POST`, `PUT`, `PATCH` y `DELETE`, según el recurso.

## Variables de entorno

No subas el archivo `.env` con contraseñas reales. El repositorio incluye `.env.example` como plantilla.

## Entrega

Antes de publicar en GitHub:

1. Verifica que `Front`, `Back`, `BD` y `Readme.md` estén en la raíz.
2. Ejecuta `npm install` en `Front` y `Back`.
3. Ejecuta `npm run typecheck` en `Front`.
4. Inicia MySQL y el backend.
5. Configura `Front/.env` con la IP correcta y prueba la app desde el celular/emulador.
6. No subas `node_modules` ni archivos `.env`.
