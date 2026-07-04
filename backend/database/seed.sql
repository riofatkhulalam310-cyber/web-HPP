-- ============================================
-- SEED DATA: Martabak Jepang UMKM App
-- ============================================

USE martabak_jepang_db;

-- ============================================
-- 1. Default Admin User
-- Password: admin123 (bcrypt hash)
-- ============================================
INSERT INTO users (nama, email, password_hash, role) VALUES
('Admin Martabak', 'admin@martabakjepang.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner');

-- ============================================
-- 2. Satuan (Unit of Measurement)
-- ============================================
INSERT INTO satuan (nama_satuan, kategori, nilai_konversi_ke_dasar) VALUES
-- Berat (base: gram)
('kilogram', 'berat', 1000.000000),
('gram', 'berat', 1.000000),
('ons', 'berat', 100.000000),
-- Volume (base: ml)
('liter', 'volume', 1000.000000),
('mililiter', 'volume', 1.000000),
-- Satuan (base: pcs)
('pcs', 'satuan', 1.000000),
('lusin', 'satuan', 12.000000),
('sisir', 'satuan', 4.000000),
('butir', 'satuan', 1.000000),
('sachet', 'satuan', 1.000000),
('bungkus', 'satuan', 1.000000);

-- ============================================
-- 3. Bahan Baku (Sample Ingredients)
-- ============================================
INSERT INTO bahan_baku (nama_bahan, harga_beli, jumlah_beli, satuan_id) VALUES
('Tepung Terigu Protein Tinggi', 15000.00, 1, 1),    -- 1 kg = Rp15.000
('Telur Ayam', 28000.00, 1, 1),                       -- 1 kg = Rp28.000
('Gula Pasir', 14000.00, 1, 1),                        -- 1 kg = Rp14.000
('Susu Cair', 18000.00, 1, 4),                         -- 1 liter = Rp18.000
('Mentega', 25000.00, 250, 2),                          -- 250 gram = Rp25.000
('Coklat Meses', 35000.00, 500, 2),                     -- 500 gram = Rp35.000
('Keju Cheddar', 30000.00, 200, 2),                     -- 200 gram = Rp30.000
('Kacang Tanah', 20000.00, 500, 2),                     -- 500 gram = Rp20.000
('Vanili', 5000.00, 10, 10),                             -- 10 sachet = Rp5.000
('Baking Powder', 8000.00, 100, 2),                     -- 100 gram = Rp8.000
('Minyak Goreng', 16000.00, 1, 4),                      -- 1 liter = Rp16.000
('Kemasan Box', 50000.00, 100, 6);                       -- 100 pcs = Rp50.000

-- ============================================
-- 4. Produk (Sample Products)
-- ============================================
INSERT INTO produk (nama_produk, deskripsi, jumlah_produksi_default) VALUES
('Martabak Jepang Original', 'Martabak manis Jepang klasik dengan topping butter', 10),
('Martabak Jepang Coklat Keju', 'Martabak manis Jepang dengan coklat meses dan keju', 10),
('Martabak Jepang Kacang', 'Martabak manis Jepang dengan kacang tanah', 10),
('Martabak Jepang Full Topping', 'Martabak manis Jepang dengan semua topping premium', 8);

-- ============================================
-- 5. Resep Detail (Sample Recipes)
-- ============================================
-- Martabak Jepang Original (produk_id=1)
INSERT INTO resep_detail (produk_id, bahan_baku_id, jumlah_pakai, satuan_id) VALUES
(1, 1, 500, 2),    -- Tepung 500 gram
(1, 2, 300, 2),    -- Telur 300 gram (~6 butir)
(1, 3, 150, 2),    -- Gula 150 gram
(1, 4, 200, 5),    -- Susu 200 ml
(1, 5, 100, 2),    -- Mentega 100 gram
(1, 9, 2, 10),     -- Vanili 2 sachet
(1, 10, 10, 2);    -- Baking powder 10 gram

-- Martabak Jepang Coklat Keju (produk_id=2)
INSERT INTO resep_detail (produk_id, bahan_baku_id, jumlah_pakai, satuan_id) VALUES
(2, 1, 500, 2),    -- Tepung 500 gram
(2, 2, 300, 2),    -- Telur 300 gram
(2, 3, 150, 2),    -- Gula 150 gram
(2, 4, 200, 5),    -- Susu 200 ml
(2, 5, 100, 2),    -- Mentega 100 gram
(2, 6, 200, 2),    -- Coklat meses 200 gram
(2, 7, 100, 2),    -- Keju 100 gram
(2, 9, 2, 10),     -- Vanili 2 sachet
(2, 10, 10, 2);    -- Baking powder 10 gram

-- Martabak Jepang Kacang (produk_id=3)
INSERT INTO resep_detail (produk_id, bahan_baku_id, jumlah_pakai, satuan_id) VALUES
(3, 1, 500, 2),    -- Tepung 500 gram
(3, 2, 300, 2),    -- Telur 300 gram
(3, 3, 150, 2),    -- Gula 150 gram
(3, 4, 200, 5),    -- Susu 200 ml
(3, 5, 100, 2),    -- Mentega 100 gram
(3, 8, 200, 2),    -- Kacang 200 gram
(3, 9, 2, 10),     -- Vanili 2 sachet
(3, 10, 10, 2);    -- Baking powder 10 gram

-- ============================================
-- 6. Sample Data: Pengeluaran Harian
-- ============================================
INSERT INTO pengeluaran_harian (tanggal, jenis_pengeluaran, nominal, keterangan) VALUES
(CURDATE(), 'Gas LPG', 22000.00, 'Gas 3kg untuk masak'),
(CURDATE(), 'Listrik', 15000.00, 'Estimasi listrik harian'),
(CURDATE(), 'Air', 5000.00, 'Estimasi air harian'),
(CURDATE(), 'Kemasan', 25000.00, 'Box dan plastik'),
(CURDATE(), 'Transportasi', 20000.00, 'Belanja bahan baku');

-- ============================================
-- 7. Sample Data: Biaya Tempat
-- ============================================
INSERT INTO biaya_tempat (nama_tempat, nominal_bulanan, tanggal_berlaku) VALUES
('Sewa Ruko Jl. Raya Utama', 3000000.00, '2026-01-01');

-- ============================================
-- 8. Sample Data: Karyawan
-- ============================================
INSERT INTO karyawan (nama, gaji, periode_gaji) VALUES
('Budi Santoso', 2500000.00, 'bulanan'),
('Siti Aminah', 100000.00, 'harian'),
('Riko Pratama', 600000.00, 'mingguan');
