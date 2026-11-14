-- Barrio Seguro: datos semilla de demostración

INSERT INTO categories (name, description) VALUES
  ('Alumbrado público',   'Postes sin luz, luminarias dañadas o zonas oscuras que afectan la seguridad.'),
  ('Espacios públicos',   'Parques, aceras, canchas y plazas descuidados o en mal estado.'),
  ('Infraestructura',     'Huecos, alcantarillas, semáforos dañados y otros problemas de la vía pública.'),
  ('Seguridad comunitaria','Situaciones que preocupan a la comunidad (sin acusar a personas identificables).'),
  ('Otros problemas',     'Cualquier otro problema del barrio que no encaje en las categorías anteriores.');

-- 12 reportes de demostración con estados variados
INSERT INTO reports
  (id, report_code, title, category, description, sector, latitude, longitude, photo_url, incident_date, status, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0000-000000000001','BS-A1B2C3','Poste de luz apagado en calle principal','Alumbrado público',
   'Desde hace dos semanas el poste de la esquina no enciende y la calle queda muy oscura en la noche.','Urdesa',-2.1700,-79.9050,NULL, CURRENT_DATE - 12,'RECIBIDO', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),
  ('00000000-0000-0000-0000-000000000002','BS-D4E5F6','Parque infantil con juegos rotos','Espacios públicos',
   'El tobogán y los columpios están rotos y representan un riesgo para los niños del sector.','Alborada',-2.1450,-79.8980,NULL, CURRENT_DATE - 20,'EN_REVISION', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'),
  ('00000000-0000-0000-0000-000000000003','BS-G7H8J9','Hueco grande en la vía','Infraestructura',
   'Un hueco de más de un metro en medio de la calzada está causando daños a los vehículos.','Samanes',-2.1280,-79.9000,NULL, CURRENT_DATE - 9,'EN_ATENCION', NOW() - INTERVAL '9 days', NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000004','BS-K1L2M3','Alcantarilla sin tapa','Infraestructura',
   'La alcantarilla frente a la escuela no tiene tapa y es peligrosa para peatones.','Ceibos',-2.1700,-79.9500,NULL, CURRENT_DATE - 30,'RESUELTO', NOW() - INTERVAL '30 days', NOW() - INTERVAL '26 days'),
  ('00000000-0000-0000-0000-000000000005','BS-N4P5Q6','Zona con poca iluminación cerca de la parada','Alumbrado público',
   'La parada de buses queda a oscuras desde las 18h00 y los usuarios se sienten inseguros.','Centro',-2.1894,-79.8891,NULL, CURRENT_DATE - 3,'RECIBIDO', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000006','BS-R7S8T9','Acumulación de basura en terreno baldío','Otros problemas',
   'Se acumula basura en un terreno baldío y hay mal olor y presencia de roedores.','Guasmo',-2.2400,-79.8900,NULL, CURRENT_DATE - 15,'EN_REVISION', NOW() - INTERVAL '15 days', NOW() - INTERVAL '13 days'),
  ('00000000-0000-0000-0000-000000000007','BS-U1V2W3','Cancha comunitaria sin mantenimiento','Espacios públicos',
   'La cancha del barrio tiene el piso levantado y las mallas rotas; los jóvenes ya no pueden usarla.','Sauces',-2.1350,-79.9100,NULL, CURRENT_DATE - 25,'EN_ATENCION', NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000008','BS-X4Y5Z6','Vecinos preocupados por falta de patrullaje','Seguridad comunitaria',
   'Los vecinos de la cooperativa piden mayor presencia de patrullaje en horas de la noche.','Mapasingue',-2.1100,-79.9200,NULL, CURRENT_DATE - 6,'RECIBIDO', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000009','BS-B2C3D4','Semáforo intermitente en cruce concurrido','Infraestructura',
   'El semáforo parpadea en amarillo todo el día y se producen casi-accidentes en el cruce.','Kennedy',-2.1600,-79.9000,NULL, CURRENT_DATE - 40,'RESUELTO', NOW() - INTERVAL '40 days', NOW() - INTERVAL '35 days'),
  ('00000000-0000-0000-0000-000000000010','BS-E5F6G7','Luminarias dañadas en parque','Alumbrado público',
   'Varias luminarias del parque central están quebradas y por la noche no se puede transitar.','Garzota',-2.1500,-79.9000,NULL, CURRENT_DATE - 8,'EN_REVISION', NOW() - INTERVAL '8 days', NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000011','BS-H8J9K1','Aceras destruidas frente al mercado','Espacios públicos',
   'Las aceras están rotas y con desniveles; adultos mayores y personas con discapacidad tienen dificultades.','Centro',-2.2000,-79.8800,NULL, CURRENT_DATE - 2,'RECIBIDO', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000012','BS-L2M3N4','Calle sin señalización escolar','Seguridad comunitaria',
   'Frente a la unidad educativa no hay señalización ni reductores de velocidad.','Pascuales',-2.0900,-79.9400,NULL, CURRENT_DATE - 18,'EN_ATENCION', NOW() - INTERVAL '18 days', NOW() - INTERVAL '12 days');

-- Historial: cada reporte pasa por todos los estados hasta llegar al actual
INSERT INTO report_status_history (report_id, status, changed_at)
SELECT r.id, s.status, r.created_at + (s.ord - 1) * INTERVAL '1 day'
FROM reports r
JOIN (VALUES
  ('RECIBIDO'::report_status, 1),
  ('EN_REVISION'::report_status, 2),
  ('EN_ATENCION'::report_status, 3),
  ('RESUELTO'::report_status, 4)
) AS s(status, ord)
  ON s.ord <= CASE r.status::text
      WHEN 'RECIBIDO'    THEN 1
      WHEN 'EN_REVISION' THEN 2
      WHEN 'EN_ATENCION' THEN 3
      WHEN 'RESUELTO'    THEN 4
    END;
