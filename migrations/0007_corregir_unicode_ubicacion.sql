-- Migration: corrige caracteres unicode en tablas de ubicacion
-- Source: C:/Users/USUARIO/Downloads/FormularioAsistencia.xlsx

PRAGMA foreign_keys = ON;

UPDATE location_provinces SET name = 'MARAÑON', description = 'MARAÑON', updated_at = CURRENT_TIMESTAMP WHERE idprovincia = '1007';
UPDATE location_provinces SET name = 'FERREÑAFE', description = 'FERREÑAFE', updated_at = CURRENT_TIMESTAMP WHERE idprovincia = '1402';
UPDATE location_provinces SET name = 'CAÑETE', description = 'CAÑETE', updated_at = CURRENT_TIMESTAMP WHERE idprovincia = '1505';
UPDATE location_provinces SET name = 'DATEM DEL MARAÑON', description = 'DATEM DEL MARAÑON', updated_at = CURRENT_TIMESTAMP WHERE idprovincia = '1607';
UPDATE location_districts SET name = 'NEPEÑA', description = 'NEPEÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '021806';
UPDATE location_districts SET name = 'SAN JUAN DE CHACÑA', description = 'SAN JUAN DE CHACÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '030411';
UPDATE location_districts SET name = 'SAÑAYCA', description = 'SAÑAYCA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '030412';
UPDATE location_districts SET name = 'QUEQUEÑA', description = 'QUEQUEÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '040115';
UPDATE location_districts SET name = 'OCOÑA', description = 'OCOÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '040206';
UPDATE location_districts SET name = 'UÑON', description = 'UÑON', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '040412';
UPDATE location_districts SET name = 'CHAVIÑA', description = 'CHAVIÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '050605';
UPDATE location_districts SET name = 'OCAÑA', description = 'OCAÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '050612';
UPDATE location_districts SET name = 'CORONEL CASTAÑEDA', description = 'CORONEL CASTAÑEDA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '050703';
UPDATE location_districts SET name = 'HUACAÑA', description = 'HUACAÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '050905';
UPDATE location_districts SET name = 'ENCAÑADA', description = 'ENCAÑADA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '060105';
UPDATE location_districts SET name = 'LOS BAÑOS DEL INCA', description = 'LOS BAÑOS DEL INCA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '060108';
UPDATE location_districts SET name = 'CHANCAYBAÑOS', description = 'CHANCAYBAÑOS', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '061304';
UPDATE location_districts SET name = 'QUIÑOTA', description = 'QUIÑOTA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '080707';
UPDATE location_districts SET name = 'KOSÑIPATA', description = 'KOSÑIPATA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '081106';
UPDATE location_districts SET name = 'ÑAHUIMPUQUIO', description = 'ÑAHUIMPUQUIO', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '090710';
UPDATE location_districts SET name = 'PUÑOS', description = 'PUÑOS', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '100509';
UPDATE location_districts SET name = 'BAÑOS', description = 'BAÑOS', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '101002';
UPDATE location_districts SET name = 'LA TINGUIÑA', description = 'LA TINGUIÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '110102';
UPDATE location_districts SET name = 'SAÑO', description = 'SAÑO', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '120132';
UPDATE location_districts SET name = 'LEONOR ORDOÑEZ', description = 'LEONOR ORDOÑEZ', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '120413';
UPDATE location_districts SET name = 'VIZCATÁN DEL ENE', description = 'VIZCATÁN DEL ENE', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '120609';
UPDATE location_districts SET name = 'SAÑA', description = 'SAÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '140115';
UPDATE location_districts SET name = 'FERREÑAFE', description = 'FERREÑAFE', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '140201';
UPDATE location_districts SET name = 'CAÑARIS', description = 'CAÑARIS', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '140202';
UPDATE location_districts SET name = 'BREÑA', description = 'BREÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '150105';
UPDATE location_districts SET name = 'SAN VICENTE DE CAÑETE', description = 'SAN VICENTE DE CAÑETE', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '150501';
UPDATE location_districts SET name = 'ZUÑIGA', description = 'ZUÑIGA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '150516';
UPDATE location_districts SET name = 'HUAÑEC', description = 'HUAÑEC', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '151017';
UPDATE location_districts SET name = 'VIÑAC', description = 'VIÑAC', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '151032';
UPDATE location_districts SET name = 'IÑAPARI', description = 'IÑAPARI', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '170301';
UPDATE location_districts SET name = 'ICHUÑA', description = 'ICHUÑA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '180204';
UPDATE location_districts SET name = 'PARIÑAS', description = 'PARIÑAS', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '200701';
UPDATE location_districts SET name = 'MAÑAZO', description = 'MAÑAZO', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '210109';
UPDATE location_districts SET name = 'MUÑANI', description = 'MUÑANI', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '210208';
UPDATE location_districts SET name = 'NUÑOA', description = 'NUÑOA', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '210806';
UPDATE location_districts SET name = 'CUÑUMBUQUI', description = 'CUÑUMBUQUI', updated_at = CURRENT_TIMESTAMP WHERE iddistrito = '220505';
