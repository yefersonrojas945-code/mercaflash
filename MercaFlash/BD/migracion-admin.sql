-- ============================================================
-- MercaFlash - Migración para el módulo de administración
--
-- Agrega la columna "activo" a producto:
--   1 = aparece en el catálogo y se puede comprar
--   0 = desactivado (oculto), pero se conserva en los pedidos anteriores
--
-- Es SEGURO ejecutarlo varias veces y NO borra datos.
-- Ejecutar en MySQL Workbench sobre la base ya creada.
-- Si creas la base desde cero con BD/database.sql actualizado, no hace falta.
-- ============================================================

USE mercaflash;

SET @existe := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'producto' AND COLUMN_NAME = 'activo');
SET @sql := IF(@existe = 0,
               'ALTER TABLE producto ADD COLUMN activo TINYINT(1) NOT NULL DEFAULT 1',
               'SELECT 1');
PREPARE instruccion FROM @sql;
EXECUTE instruccion;
DEALLOCATE PREPARE instruccion;

-- Comprobación: debe mostrar la columna activo
SHOW COLUMNS FROM producto LIKE 'activo';
