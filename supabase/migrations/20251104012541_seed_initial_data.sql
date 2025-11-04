/*
  # Seed Initial Data

  Populate the database with initial sample locations for testing.
  Note: User data and assets should be added through the application interface.
*/

INSERT INTO locations (id, name) VALUES
  (gen_random_uuid(), 'Ruang Guru'),
  (gen_random_uuid(), 'Perpustakaan'),
  (gen_random_uuid(), 'Kelas 10A'),
  (gen_random_uuid(), 'Gudang ATK')
ON CONFLICT DO NOTHING;
