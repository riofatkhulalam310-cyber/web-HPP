<?php
// ============================================
// MODEL: Satuan (Unit of Measurement)
// ============================================

class Satuan {
    private $conn;
    private $table = 'satuan';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY kategori, nama_satuan");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (nama_satuan, kategori, nilai_konversi_ke_dasar) 
             VALUES (:nama_satuan, :kategori, :nilai_konversi)"
        );
        $stmt->bindParam(':nama_satuan', $data['nama_satuan']);
        $stmt->bindParam(':kategori', $data['kategori']);
        $stmt->bindParam(':nilai_konversi', $data['nilai_konversi_ke_dasar']);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET nama_satuan = :nama_satuan, kategori = :kategori, 
             nilai_konversi_ke_dasar = :nilai_konversi WHERE id = :id"
        );
        $stmt->bindParam(':nama_satuan', $data['nama_satuan']);
        $stmt->bindParam(':kategori', $data['kategori']);
        $stmt->bindParam(':nilai_konversi', $data['nilai_konversi_ke_dasar']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Convert value from one unit to another within the same category
     * Returns the converted value or false if incompatible categories
     */
    public function convert($fromSatuanId, $toSatuanId, $value) {
        $from = $this->getById($fromSatuanId);
        $to = $this->getById($toSatuanId);

        if (!$from || !$to) return false;
        if ($from['kategori'] !== $to['kategori']) return false;

        // Convert: value in 'from' unit -> base unit -> 'to' unit
        $baseValue = $value * $from['nilai_konversi_ke_dasar'];
        $convertedValue = $baseValue / $to['nilai_konversi_ke_dasar'];

        return $convertedValue;
    }

    /**
     * Get price per unit after conversion
     * Example: harga 15000/kg, convert to per gram = 15
     */
    public function getPricePerUnit($hargaBeli, $jumlahBeli, $satuanBeliId, $satuanPakaiId) {
        $satuanBeli = $this->getById($satuanBeliId);
        $satuanPakai = $this->getById($satuanPakaiId);

        if (!$satuanBeli || !$satuanPakai) return false;
        if ($satuanBeli['kategori'] !== $satuanPakai['kategori']) return false;

        // Price per base unit = harga / (jumlah * konversi_ke_dasar)
        $totalBaseUnits = $jumlahBeli * $satuanBeli['nilai_konversi_ke_dasar'];
        $pricePerBaseUnit = $hargaBeli / $totalBaseUnits;

        // Price per target unit = pricePerBase * konversi_target
        $pricePerTargetUnit = $pricePerBaseUnit * $satuanPakai['nilai_konversi_ke_dasar'];

        return $pricePerTargetUnit;
    }
}
