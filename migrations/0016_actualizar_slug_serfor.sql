-- Migration: enlace corto para evento SERFOR Educa.

UPDATE events
SET short_link_slug = 'curso-serforeduca1',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'evt_c62643e4';

UPDATE forms
SET short_link_slug = 'curso-serforeduca1',
  updated_at = CURRENT_TIMESTAMP
WHERE event_id = 'evt_c62643e4';
