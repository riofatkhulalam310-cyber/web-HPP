<?php
// ============================================
// MODEL: Produk (Products)
// ============================================

class Produk {
    private $conn;
    private $table = 'produk';

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY nama_produk");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function getWithResep($id) {
        $produk = $this->getById($id);
        if (!$produk) return false;

        $stmt = $this->conn->prepare(
            "SELECT rd.*, bb.nama_bahan, bb.harga_beli, bb.jumlah_beli, 
                    bb.satuan_id as satuan_beli_id,
                    s_pakai.nama_satuan as satuan_pakai,
                    s_pakai.kategori as kategori_pakai,
                    s_pakai.nilai_konversi_ke_dasar as konversi_pakai,
                    s_beli.nama_satuan as satuan_beli,
                    s_beli.kategori as kategori_beli,
                    s_beli.nilai_konversi_ke_dasar as konversi_beli
             FROM resep_detail rd
             JOIN bahan_baku bb ON rd.bahan_baku_id = bb.id
             JOIN satuan s_pakai ON rd.satuan_id = s_pakai.id
             JOIN satuan s_beli ON bb.satuan_id = s_beli.id
             WHERE rd.produk_id = :produk_id"
        );
        $stmt->bindParam(':produk_id', $id);
        $stmt->execute();
        $produk['resep'] = $stmt->fetchAll();

        // Calculate cost per ingredient
        $totalBiayaBahan = 0;
        foreach ($produk['resep'] as &$item) {
            if ($item['kategori_pakai'] === $item['kategori_beli']) {
                // Price per base unit
                $totalBaseUnits = $item['jumlah_beli'] * $item['konversi_beli'];
                $pricePerBaseUnit = $item['harga_beli'] / $totalBaseUnits;
                // Cost = jumlah_pakai * konversi_pakai * pricePerBaseUnit
                $biaya = $item['jumlah_pakai'] * $item['konversi_pakai'] * $pricePerBaseUnit;
                $item['biaya'] = round($biaya, 2);
            } else {
                $item['biaya'] = 0;
                $item['error'] = 'Satuan tidak kompatibel';
            }
            $totalBiayaBahan += $item['biaya'];
        }
        $produk['total_biaya_bahan'] = round($totalBiayaBahan, 2);

        return $produk;
    }

    public function create($data) {
        $stmt = $this->conn->prepare(
            "INSERT INTO {$this->table} (nama_produk, deskripsi, jumlah_produksi_default) 
             VALUES (:nama_produk, :deskripsi, :jumlah_produksi)"
        );
        $stmt->bindParam(':nama_produk', $data['nama_produk']);
        $deskripsi = $data['deskripsi'] ?? '';
        $stmt->bindParam(':deskripsi', $deskripsi);
        $jumlah = $data['jumlah_produksi_default'] ?? 1;
        $stmt->bindParam(':jumlah_produksi', $jumlah);
        $stmt->execute();
        return $this->conn->lastInsertId();
    }

    public function update($id, $data) {
        $stmt = $this->conn->prepare(
            "UPDATE {$this->table} SET nama_produk = :nama_produk, deskripsi = :deskripsi,
             jumlah_produksi_default = :jumlah_produksi WHERE id = :id"
        );
        $stmt->bindParam(':nama_produk', $data['nama_produk']);
        $deskripsi = $data['deskripsi'] ?? '';
        $stmt->bindParam(':deskripsi', $deskripsi);
        $jumlah = $data['jumlah_produksi_default'] ?? 1;
        $stmt->bindParam(':jumlah_produksi', $jumlah);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }

    public function delete($id) {
        // Check if product is used in transactions
        $check = $this->conn->prepare("SELECT COUNT(*) as cnt FROM transaksi_penjualan WHERE produk_id = :id");
        $check->bindParam(':id', $id);
        $check->execute();
        $result = $check->fetch();

        if ($result['cnt'] > 0) {
            return ['error' => 'Produk ini memiliki riwayat transaksi. Tidak bisa dihapus.'];
        }

        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
