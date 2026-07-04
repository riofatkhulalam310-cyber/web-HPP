<?php
// ============================================
// MODEL: Bahan Baku (Raw Materials)
// ============================================

class BahanBaku {
    private $conn;
    private $table = 'bahan_baku';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $stmt = $this->conn->prepare(
            "SELECT bb.*, s.nama_satuan, s.kategori, s.nilai_konversi_ke_dasar 
             FROM {$this->table} bb 
             JOIN satuan s ON bb.satuan_id = s.id 
             ORDER BY bb.nama_bahan"
        );
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare(
            "SELECT bb.*, s.nama_satuan, s.kategori, s.nilai_konversi_ke_dasar 
             FROM {$this->table} bb 
             JOIN satuan s ON bb.satuan_id = s.id 
             WHERE bb.id = :id"
        );
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (nama_bahan, harga_beli, jumlah_beli, satuan_id) 
             VALUES (:nama_bahan, :harga_beli, :jumlah_beli, :satuan_id)"
        );
        $stmt->bindParam(':nama_bahan', $data['nama_bahan']);
        $stmt->bindParam(':harga_beli', $data['harga_beli']);
        $stmt->bindParam(':jumlah_beli', $data['jumlah_beli']);
        $stmt->bindParam(':satuan_id', $data['satuan_id']);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET nama_bahan = :nama_bahan, harga_beli = :harga_beli, 
             jumlah_beli = :jumlah_beli, satuan_id = :satuan_id WHERE id = :id"
        );
        $stmt->bindParam(':nama_bahan', $data['nama_bahan']);
        $stmt->bindParam(':harga_beli', $data['harga_beli']);
        $stmt->bindParam(':jumlah_beli', $data['jumlah_beli']);
        $stmt->bindParam(':satuan_id', $data['satuan_id']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        // Check if ingredient is used in any recipe
        $check = $this->conn->prepare("SELECT COUNT(*) as cnt FROM resep_detail WHERE bahan_baku_id = :id");
        $check->bindParam(':id', $id);
        $check->execute();
        $result = $check->fetch();

        if ($result['cnt'] > 0) {
            return ['error' => 'Bahan baku ini masih digunakan di resep. Hapus dari resep terlebih dahulu.'];
        }

        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
