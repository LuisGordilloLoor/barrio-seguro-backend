-- Barrio Seguro: esquema de base de datos (PostgreSQL)
-- ATENCIÓN: este script reinicia las tablas (DROP + CREATE). Úsalo solo en desarrollo.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- para gen_random_uuid()

DROP TABLE IF EXISTS report_status_history CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;

-- Estados posibles de un reporte
CREATE TYPE report_status AS ENUM ('RECIBIDO', 'EN_REVISION', 'EN_ATENCION', 'RESUELTO');

-- Categorías disponibles
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT
);

-- Reportes anónimos (no se guardan datos personales)
CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code   VARCHAR(10) NOT NULL UNIQUE,          -- formato BS-XXXXXX
  title         VARCHAR(150) NOT NULL,
  category      VARCHAR(100) NOT NULL,                -- coincide con categories.name
  description   TEXT NOT NULL,
  sector        VARCHAR(100) NOT NULL,
  latitude      DECIMAL(9,6) NOT NULL,
  longitude     DECIMAL(9,6) NOT NULL,
  photo_url     TEXT,
  incident_date DATE,
  status        report_status NOT NULL DEFAULT 'RECIBIDO',
  is_hidden     BOOLEAN NOT NULL DEFAULT false,       -- moderación (ocultar sin borrar)
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Historial de cambios de estado de cada reporte
CREATE TABLE report_status_history (
  id         SERIAL PRIMARY KEY,
  report_id  UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status     report_status NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para filtros frecuentes
CREATE INDEX idx_reports_category   ON reports(category);
CREATE INDEX idx_reports_status     ON reports(status);
CREATE INDEX idx_reports_sector     ON reports(sector);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_history_report_id  ON report_status_history(report_id);
