<?php
// ============================================
// MODEL: Resep Detail (Recipe Details)
// ============================================

class ResepDetail {
    private $conn;
    private $table = 'resep_detail';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getByProdukId($produkId) {
        $stmt = $this->conn->prepare(
            "SELECT rd.*, bb.nama_bahan, bb.harga_beli, bb.jumlah_beli,
                    bb.satuan_id as satuan_beli_id,
                    s.nama_satuan, s.kategori
             FROM {$this->table} rd
             JOIN bahan_baku bb ON rd.bahan_baku_id = bb.id
             JOIN satuan s ON rd.satuan_id = s.id
             WHERE rd.produk_id = :produk_id"
        );
        $stmt->bindParam(':produk_id', $produkId);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (produk_id, bahan_baku_id, jumlah_pakai, satuan_id) 
             VALUES (:produk_id, :bahan_baku_id, :jumlah_pakai, :satuan_id)"
        );
        $stmt->bindParam(':produk_id', $data['produk_id']);
        $stmt->bindParam(':bahan_baku_id', $data['bahan_baku_id']);
        $stmt->bindParam(':jumlah_pakai', $data['jumlah_pakai']);
        $stmt->bindParam(':satuan_id', $data['satuan_id']);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET bahan_baku_id = :bahan_baku_id, 
             jumlah_pakai = :jumlah_pakai, satuan_id = :satuan_id WHERE id = :id"
        );
        $stmt->bindParam(':bahan_baku_id', $data['bahan_baku_id']);
        $stmt->bindParam(':jumlah_pakai', $data['jumlah_pakai']);
        $stmt->bindParam(':satuan_id', $data['satuan_id']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function deleteByProdukId($produkId) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE produk_id = :produk_id");
        $stmt->bindParam(':produk_id', $produkId);
        return $stmt->execute();
    }
}
