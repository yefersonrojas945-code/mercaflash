-- ============================================================
-- MercaFlash - Catalogo inicial (36 productos con su icono)
--
-- Es SEGURO ejecutarlo varias veces y NO borra nada:
--   * agrega la columna "icono" a producto solo si no existe
--   * crea las categorias y productos que falten (compara por nombre)
--   * pone el icono a los productos por nombre
--   * crea 3 sedes SOLO si la tabla sede esta vacia
-- Ejecutar en MySQL Workbench (despues de tener las tablas creadas).
-- ============================================================

USE mercaflash;

-- 1) Columna icono (solo si todavia no existe)
SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'producto' AND COLUMN_NAME = 'icono');
SET @sql := IF(@existe = 0,
               'ALTER TABLE producto ADD COLUMN icono VARCHAR(16) NOT NULL DEFAULT ''🛒''',
               'SELECT 1');
PREPARE instruccion FROM @sql;
EXECUTE instruccion;
DEALLOCATE PREPARE instruccion;

-- 2) Categorias que falten
INSERT INTO categoria (nombre) SELECT 'Frutas' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Frutas');
INSERT INTO categoria (nombre) SELECT 'Verduras' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Verduras');
INSERT INTO categoria (nombre) SELECT 'Lácteos' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Lácteos');
INSERT INTO categoria (nombre) SELECT 'Panadería' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Panadería');
INSERT INTO categoria (nombre) SELECT 'Despensa' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Despensa');
INSERT INTO categoria (nombre) SELECT 'Carnes' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Carnes');
INSERT INTO categoria (nombre) SELECT 'Bebidas' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Bebidas');
INSERT INTO categoria (nombre) SELECT 'Snacks' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Snacks');
INSERT INTO categoria (nombre) SELECT 'Aseo' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM categoria WHERE nombre = 'Aseo');

-- 3) Productos que falten (stock inicial: 20 unidades)
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Manzanas rojas (kg)', 4500, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Frutas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Manzanas rojas (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Banano (kg)', 2800, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Frutas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Banano (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Naranja (kg)', 2600, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Frutas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Naranja (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Aguacate (unidad)', 2200, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Frutas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Aguacate (unidad)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Mango (kg)', 3400, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Frutas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Mango (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Tomate chonto (kg)', 3200, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Verduras' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Tomate chonto (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Papa criolla (kg)', 3900, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Verduras' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Papa criolla (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Cebolla cabezona (kg)', 3100, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Verduras' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Cebolla cabezona (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Zanahoria (kg)', 2400, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Verduras' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Zanahoria (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Lechuga (unidad)', 2000, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Verduras' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Lechuga (unidad)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Leche entera (1L)', 4300, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Lácteos' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Leche entera (1L)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Queso campesino (500g)', 9800, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Lácteos' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Queso campesino (500g)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Huevos AA (x30)', 16500, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Lácteos' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Huevos AA (x30)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Yogurt natural (1L)', 8700, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Lácteos' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Yogurt natural (1L)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Mantequilla (250g)', 6900, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Lácteos' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Mantequilla (250g)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Pan tajado', 5200, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Panadería' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Pan tajado');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Croissant (x4)', 7300, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Panadería' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Croissant (x4)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Arepas (paquete)', 4800, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Panadería' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Arepas (paquete)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Arroz (1kg)', 3600, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Despensa' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Arroz (1kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Aceite vegetal (1L)', 8900, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Despensa' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Aceite vegetal (1L)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Café molido (500g)', 14200, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Despensa' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Café molido (500g)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Panela (1kg)', 3300, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Despensa' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Panela (1kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Pasta (500g)', 3900, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Despensa' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Pasta (500g)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Lentejas (500g)', 4600, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Despensa' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Lentejas (500g)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Pechuga de pollo (kg)', 14900, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Carnes' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Pechuga de pollo (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Carne molida (kg)', 17800, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Carnes' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Carne molida (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Tilapia (kg)', 19500, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Carnes' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Tilapia (kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Jugo de naranja (1L)', 6200, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Bebidas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Jugo de naranja (1L)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Gaseosa (1.5L)', 5400, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Bebidas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Gaseosa (1.5L)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Agua (6 pack)', 8100, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Bebidas' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Agua (6 pack)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Papas fritas (paquete)', 4700, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Snacks' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Papas fritas (paquete)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Galletas (paquete)', 3800, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Snacks' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Galletas (paquete)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Chocolatina (unidad)', 2100, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Snacks' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Chocolatina (unidad)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Detergente (1kg)', 11800, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Aseo' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Detergente (1kg)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Papel higiénico (x12)', 15300, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Aseo' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Papel higiénico (x12)');
INSERT INTO producto (nombre, precio, stock, id_categoria)
SELECT 'Jabón de baño (x3)', 7200, 20, (SELECT id_categoria FROM categoria WHERE nombre = 'Aseo' LIMIT 1) FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM producto WHERE nombre = 'Jabón de baño (x3)');

-- 4) Iconos (por nombre de producto)
-- (MySQL Workbench bloquea UPDATE sin clave primaria; lo desactivamos solo para este bloque)
SET SQL_SAFE_UPDATES = 0;
UPDATE producto SET icono = '🍎' WHERE nombre = 'Manzanas rojas (kg)';
UPDATE producto SET icono = '🍌' WHERE nombre = 'Banano (kg)';
UPDATE producto SET icono = '🍊' WHERE nombre = 'Naranja (kg)';
UPDATE producto SET icono = '🥑' WHERE nombre = 'Aguacate (unidad)';
UPDATE producto SET icono = '🥭' WHERE nombre = 'Mango (kg)';
UPDATE producto SET icono = '🍅' WHERE nombre = 'Tomate chonto (kg)';
UPDATE producto SET icono = '🥔' WHERE nombre = 'Papa criolla (kg)';
UPDATE producto SET icono = '🧅' WHERE nombre = 'Cebolla cabezona (kg)';
UPDATE producto SET icono = '🥕' WHERE nombre = 'Zanahoria (kg)';
UPDATE producto SET icono = '🥬' WHERE nombre = 'Lechuga (unidad)';
UPDATE producto SET icono = '🥛' WHERE nombre = 'Leche entera (1L)';
UPDATE producto SET icono = '🧀' WHERE nombre = 'Queso campesino (500g)';
UPDATE producto SET icono = '🥚' WHERE nombre = 'Huevos AA (x30)';
UPDATE producto SET icono = '🍶' WHERE nombre = 'Yogurt natural (1L)';
UPDATE producto SET icono = '🧈' WHERE nombre = 'Mantequilla (250g)';
UPDATE producto SET icono = '🍞' WHERE nombre = 'Pan tajado';
UPDATE producto SET icono = '🥐' WHERE nombre = 'Croissant (x4)';
UPDATE producto SET icono = '🫓' WHERE nombre = 'Arepas (paquete)';
UPDATE producto SET icono = '🍚' WHERE nombre = 'Arroz (1kg)';
UPDATE producto SET icono = '🫙' WHERE nombre = 'Aceite vegetal (1L)';
UPDATE producto SET icono = '☕' WHERE nombre = 'Café molido (500g)';
UPDATE producto SET icono = '🍯' WHERE nombre = 'Panela (1kg)';
UPDATE producto SET icono = '🍝' WHERE nombre = 'Pasta (500g)';
UPDATE producto SET icono = '🫘' WHERE nombre = 'Lentejas (500g)';
UPDATE producto SET icono = '🍗' WHERE nombre = 'Pechuga de pollo (kg)';
UPDATE producto SET icono = '🥩' WHERE nombre = 'Carne molida (kg)';
UPDATE producto SET icono = '🐟' WHERE nombre = 'Tilapia (kg)';
UPDATE producto SET icono = '🧃' WHERE nombre = 'Jugo de naranja (1L)';
UPDATE producto SET icono = '🥤' WHERE nombre = 'Gaseosa (1.5L)';
UPDATE producto SET icono = '💧' WHERE nombre = 'Agua (6 pack)';
UPDATE producto SET icono = '🍟' WHERE nombre = 'Papas fritas (paquete)';
UPDATE producto SET icono = '🍪' WHERE nombre = 'Galletas (paquete)';
UPDATE producto SET icono = '🍫' WHERE nombre = 'Chocolatina (unidad)';
UPDATE producto SET icono = '🧴' WHERE nombre = 'Detergente (1kg)';
UPDATE producto SET icono = '🧻' WHERE nombre = 'Papel higiénico (x12)';
UPDATE producto SET icono = '🧼' WHERE nombre = 'Jabón de baño (x3)';
SET SQL_SAFE_UPDATES = 1;

-- 5) Sedes de ejemplo, solo si la tabla esta vacia (edita las direcciones cuando las tengas)
INSERT INTO sede (nombre, direccion, ciudad, horario)
SELECT * FROM (
  SELECT 'Sede Laureles' AS nombre, 'Por definir' AS direccion, 'Medellín' AS ciudad, NULL AS horario
  UNION ALL SELECT 'Sede Envigado', 'Por definir', 'Envigado', NULL
  UNION ALL SELECT 'Sede Centro', 'Por definir', 'Medellín', NULL
) AS nuevas
WHERE NOT EXISTS (SELECT 1 FROM sede);
