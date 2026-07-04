<?php
// ============================================
// MODEL: Pengeluaran Harian (Daily Expenses)
// ============================================

class PengeluaranHarian {
    private $conn;
    private $table = 'pengeluaran_harian';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($filters = []) {
        $sql = "SELECT * FROM {$this->table} WHERE 1=1";
        $params = [];

        if (!empty($filters['tanggal_dari'])) {
            $sql .= " AND tanggal >= :tanggal_dari";
            $params[':tanggal_dari'] = $filters['tanggal_dari'];
        }
        if (!empty($filters['tanggal_sampai'])) {
            $sql .= " AND tanggal <= :tanggal_sampai";
            $params[':tanggal_sampai'] = $filters['tanggal_sampai'];
        }
        if (!empty($filters['jenis'])) {
            $sql .= " AND jenis_pengeluaran LIKE :jenis";
            $params[':jenis'] = '%' . $filters['jenis'] . '%';
        }

        $sql .= " ORDER BY tanggal DESC, id DESC";

        $stmt = $this->conn->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
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
            "INSERT INTO {$this->table} (tanggal, jenis_pengeluaran, nominal, keterangan) 
             VALUES (:tanggal, :jenis, :nominal, :keterangan)"
        );
        $stmt->bindParam(':tanggal', $data['tanggal']);
        $stmt->bindParam(':jenis', $data['jenis_pengeluaran']);
        $stmt->bindParam(':nominal', $data['nominal']);
        $keterangan = $data['keterangan'] ?? '';
        $stmt->bindParam(':keterangan', $keterangan);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET tanggal = :tanggal, jenis_pengeluaran = :jenis,
             nominal = :nominal, keterangan = :keterangan WHERE id = :id"
        );
        $stmt->bindParam(':tanggal', $data['tanggal']);
        $stmt->bindParam(':jenis', $data['jenis_pengeluaran']);
        $stmt->bindParam(':nominal', $data['nominal']);
        $keterangan = $data['keterangan'] ?? '';
        $stmt->bindParam(':keterangan', $keterangan);
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
            "SELECT COALESCE(SUM(nominal), 0) as total FROM {$this->table} WHERE tanggal = :tanggal"
        );
        $stmt->bindParam(':tanggal', $tanggal);
        $stmt->execute();
        return $stmt->fetch()['total'];
    }

    public function getRekap($periode = 'harian', $tanggal = null) {
        $tanggal = $tanggal ?? date('Y-m-d');

        switch ($periode) {
            case 'mingguan':
                $stmt = $this->conn->prepare(
                    "SELECT DATE(tanggal) as tgl, SUM(nominal) as total 
                     FROM {$this->table} 
                     WHERE tanggal >= DATE_SUB(:tanggal, INTERVAL 7 DAY) AND tanggal <= :tanggal2
                     GROUP BY DATE(tanggal) ORDER BY tgl"
                );
                $stmt->bindParam(':tanggal', $tanggal);
                $stmt->bindParam(':tanggal2', $tanggal);
                break;
            case 'bulanan':
                $stmt = $this->conn->prepare(
                    "SELECT DATE(tanggal) as tgl, SUM(nominal) as total 
                     FROM {$this->table} 
                     WHERE YEAR(tanggal) = YEAR(:tanggal) AND MONTH(tanggal) = MONTH(:tanggal2)
                     GROUP BY DATE(tanggal) ORDER BY tgl"
                );
                $stmt->bindParam(':tanggal', $tanggal);
                $stmt->bindParam(':tanggal2', $tanggal);
                break;
            default: // harian
                $stmt = $this->conn->prepare(
                    "SELECT jenis_pengeluaran, nominal FROM {$this->table} WHERE tanggal = :tanggal"
                );
                $stmt->bindParam(':tanggal', $tanggal);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
