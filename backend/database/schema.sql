-- ============================================
-- DATABASE SCHEMA: Martabak Jepang UMKM App
-- ============================================

CREATE DATABASE IF NOT EXISTS martabak_jepang_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE martabak_jepang_db;

-- ============================================
-- 1. USERS (Autentikasi)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'owner') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 2. SATUAN (Unit of Measurement)
-- ============================================
CREATE TABLE IF NOT EXISTS satuan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_satuan VARCHAR(50) NOT NULL UNIQUE,
    kategori ENUM('berat', 'volume', 'satuan') NOT NULL,
    nilai_konversi_ke_dasar DECIMAL(15,6) NOT NULL DEFAULT 1,
    -- nilai_konversi_ke_dasar: konversi ke satuan terkecil
    -- berat: ke gram (kg=1000, gram=1)
    -- volume: ke ml (liter=1000, ml=1)
    -- satuan: ke pcs (lusin=12, sisir=4, pcs=1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 3. BAHAN BAKU (Raw Materials / Ingredients)
-- ============================================
CREATE TABLE IF NOT EXISTS bahan_baku (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_bahan VARCHAR(150) NOT NULL,
    harga_beli DECIMAL(15,2) NOT NULL DEFAULT 0,
    jumlah_beli DECIMAL(15,4) NOT NULL DEFAULT 1,
    satuan_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (satuan_id) REFERENCES satuan(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- 4. PRODUK (Products)
-- ============================================
CREATE TABLE IF NOT EXISTS produk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    jumlah_produksi_default INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 5. RESEP DETAIL (Recipe Details)
-- ============================================
CREATE TABLE IF NOT EXISTS resep_detail (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    bahan_baku_id INT NOT NULL,
    jumlah_pakai DECIMAL(15,4) NOT NULL,
    satuan_id INT NOT NULL,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE,
    FOREIGN KEY (bahan_baku_id) REFERENCES bahan_baku(id) ON DELETE RESTRICT,
    FOREIGN KEY (satuan_id) REFERENCES satuan(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- 6. PENGELUARAN HARIAN (Daily Expenses)
-- ============================================
CREATE TABLE IF NOT EXISTS pengeluaran_harian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    jenis_pengeluaran VARCHAR(150) NOT NULL,
    nominal DECIMAL(15,2) NOT NULL DEFAULT 0,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 7. BIAYA TEMPAT (Venue Costs)
-- ============================================
CREATE TABLE IF NOT EXISTS biaya_tempat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_tempat VARCHAR(150) DEFAULT 'Sewa Tempat Usaha',
    nominal_bulanan DECIMAL(15,2) NOT NULL DEFAULT 0,
    tanggal_berlaku DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 8. KARYAWAN (Employees)
-- ============================================
CREATE TABLE IF NOT EXISTS karyawan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(150) NOT NULL,
    gaji DECIMAL(15,2) NOT NULL DEFAULT 0,
    periode_gaji ENUM('harian', 'mingguan', 'bulanan') NOT NULL DEFAULT 'bulanan',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- 9. TRANSAKSI PENJUALAN (Sales Transactions)
-- ============================================
CREATE TABLE IF NOT EXISTS transaksi_penjualan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    jumlah_terjual INT NOT NULL DEFAULT 1,
    harga_jual DECIMAL(15,2) NOT NULL DEFAULT 0,
    tanggal DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================
-- 10. HPP LOG (HPP Calculation History)
-- ============================================
CREATE TABLE IF NOT EXISTS hpp_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produk_id INT NOT NULL,
    tanggal_hitung DATE NOT NULL,
    biaya_bahan DECIMAL(15,2) NOT NULL DEFAULT 0,
    biaya_karyawan DECIMAL(15,2) NOT NULL DEFAULT 0,
    biaya_tempat DECIMAL(15,2) NOT NULL DEFAULT 0,
    biaya_lainnya DECIMAL(15,2) NOT NULL DEFAULT 0,
    jumlah_produksi INT NOT NULL DEFAULT 1,
    hpp_per_unit DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_pengeluaran_tanggal ON pengeluaran_harian(tanggal);
CREATE INDEX idx_transaksi_tanggal ON transaksi_penjualan(tanggal);
CREATE INDEX idx_transaksi_produk ON transaksi_penjualan(produk_id);
CREATE INDEX idx_hpp_produk ON hpp_log(produk_id);
CREATE INDEX idx_hpp_tanggal ON hpp_log(tanggal_hitung);
CREATE INDEX idx_resep_produk ON resep_detail(produk_id);
