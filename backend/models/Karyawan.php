<?php
// ============================================
// MODEL: Karyawan (Employees)
// ============================================

class Karyawan {
    private $conn;
    private $table = 'karyawan';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY nama");
        $stmt->execute();
        $karyawanList = $stmt->fetchAll();

        // Add daily cost for each employee
        foreach ($karyawanList as &$k) {
            $k['gaji_harian'] = $this->getGajiHarian($k);
        }
        return $karyawanList;
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        $k = $stmt->fetch();
        if ($k) {
            $k['gaji_harian'] = $this->getGajiHarian($k);
        }
        return $k;
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (nama, gaji, periode_gaji) 
             VALUES (:nama, :gaji, :periode_gaji)"
        );
        $stmt->bindParam(':nama', $data['nama']);
        $stmt->bindParam(':gaji', $data['gaji']);
        $stmt->bindParam(':periode_gaji', $data['periode_gaji']);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET nama = :nama, gaji = :gaji, 
             periode_gaji = :periode_gaji WHERE id = :id"
        );
        $stmt->bindParam(':nama', $data['nama']);
        $stmt->bindParam(':gaji', $data['gaji']);
        $stmt->bindParam(':periode_gaji', $data['periode_gaji']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    /**
     * Convert salary to daily rate
     */
    private function getGajiHarian($karyawan) {
        switch ($karyawan['periode_gaji']) {
            case 'harian':
                return round($karyawan['gaji'], 2);
            case 'mingguan':
                return round($karyawan['gaji'] / 7, 2);
            case 'bulanan':
                return round($karyawan['gaji'] / 30, 2);
            default:
                return 0;
        }
    }

    /**
     * Get total daily employee cost (all employees combined)
     */
    public function getTotalBiayaHarian() {
        $all = $this->getAll();
        $total = 0;
        foreach ($all as $k) {
            $total += $k['gaji_harian'];
        }
        return round($total, 2);
    }
}
