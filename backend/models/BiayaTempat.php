<?php
// ============================================
// MODEL: Biaya Tempat (Venue Costs)
// ============================================

class BiayaTempat {
    private $conn;
    private $table = 'biaya_tempat';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY tanggal_berlaku DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getActive() {
        $stmt = $this->conn->prepare(
            "SELECT * FROM {$this->table} WHERE tanggal_berlaku <= CURDATE() 
             ORDER BY tanggal_berlaku DESC LIMIT 1"
        );
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (nama_tempat, nominal_bulanan, tanggal_berlaku) 
             VALUES (:nama_tempat, :nominal, :tanggal)"
        );
        $nama = $data['nama_tempat'] ?? 'Sewa Tempat Usaha';
        $stmt->bindParam(':nama_tempat', $nama);
        $stmt->bindParam(':nominal', $data['nominal_bulanan']);
        $stmt->bindParam(':tanggal', $data['tanggal_berlaku']);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET nama_tempat = :nama_tempat, nominal_bulanan = :nominal,
             tanggal_berlaku = :tanggal WHERE id = :id"
        );
        $nama = $data['nama_tempat'] ?? 'Sewa Tempat Usaha';
        $stmt->bindParam(':nama_tempat', $nama);
        $stmt->bindParam(':nominal', $data['nominal_bulanan']);
        $stmt->bindParam(':tanggal', $data['tanggal_berlaku']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Get daily venue cost
     * Biaya per hari = nominal_bulanan / jumlah hari dalam bulan
     */
    public function getBiayaHarian($tanggal = null) {
        $active = $this->getActive();
        if (!$active) return 0;

        $tanggal = $tanggal ?? date('Y-m-d');
        $daysInMonth = date('t', strtotime($tanggal));
        return round($active['nominal_bulanan'] / $daysInMonth, 2);
    }
}
