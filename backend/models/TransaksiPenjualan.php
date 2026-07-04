<?php
// ============================================
// MODEL: Transaksi Penjualan (Sales Transactions)
// ============================================

class TransaksiPenjualan {
    private $conn;
    private $table = 'transaksi_penjualan';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($filters = []) {
        $sql = "SELECT t.*, p.nama_produk 
                FROM {$this->table} t 
                JOIN produk p ON t.produk_id = p.id 
                WHERE 1=1";
        $params = [];

        if (!empty($filters['tanggal_dari'])) {
            $sql .= " AND t.tanggal >= :tanggal_dari";
            $params[':tanggal_dari'] = $filters['tanggal_dari'];
        }
        if (!empty($filters['tanggal_sampai'])) {
            $sql .= " AND t.tanggal <= :tanggal_sampai";
            $params[':tanggal_sampai'] = $filters['tanggal_sampai'];
        }
        if (!empty($filters['produk_id'])) {
            $sql .= " AND t.produk_id = :produk_id";
            $params[':produk_id'] = $filters['produk_id'];
        }

        $sql .= " ORDER BY t.tanggal DESC, t.id DESC";

        $stmt = $this->conn->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare(
            "SELECT t.*, p.nama_produk 
             FROM {$this->table} t 
             JOIN produk p ON t.produk_id = p.id 
             WHERE t.id = :id"
        );
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (produk_id, jumlah_terjual, harga_jual, tanggal) 
             VALUES (:produk_id, :jumlah_terjual, :harga_jual, :tanggal)"
        );
        $stmt->bindParam(':produk_id', $data['produk_id']);
        $stmt->bindParam(':jumlah_terjual', $data['jumlah_terjual']);
        $stmt->bindParam(':harga_jual', $data['harga_jual']);
        $stmt->bindParam(':tanggal', $data['tanggal']);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET produk_id = :produk_id, jumlah_terjual = :jumlah_terjual,
             harga_jual = :harga_jual, tanggal = :tanggal WHERE id = :id"
        );
        $stmt->bindParam(':produk_id', $data['produk_id']);
        $stmt->bindParam(':jumlah_terjual', $data['jumlah_terjual']);
        $stmt->bindParam(':harga_jual', $data['harga_jual']);
        $stmt->bindParam(':tanggal', $data['tanggal']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function getTotalByDate($tanggal) {
        $stmt = $this->conn->prepare(
            "SELECT COALESCE(SUM(jumlah_terjual * harga_jual), 0) as total_penjualan,
                    COALESCE(SUM(jumlah_terjual), 0) as total_unit
             FROM {$this->table} WHERE tanggal = :tanggal"
        );
        $stmt->bindParam(':tanggal', $tanggal);
        $stmt->execute();
        return $stmt->fetch();
    }
}
