-- Migration: conserva el enlace publico SERFOR Educa apuntando al formulario simplificado
-- El QR distribuido sigue siendo valido porque la URL /f/curso-serforeduca1 no cambia.

PRAGMA foreign_keys = ON;

UPDATE forms
SET short_link_slug = 'curso-serforeduca1-original',
    status = 'inactive',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'form_c62643e4';

UPDATE forms
SET short_link_slug = 'curso-serforeduca1',
    status = 'active',
    name = 'Formulario de asistencia - Lanzamiento oficial del curso virtual de Organización Participativa Territorial de Bosques Comunales, a través de SERFOR Educa',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'form_clone_f4c2cbe9';

UPDATE events
SET short_link_slug = 'curso-serforeduca1',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'evt_c62643e4';
