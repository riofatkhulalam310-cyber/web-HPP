<?php
// ============================================
// MODEL: HPP Calculator
// ============================================

require_once __DIR__ . '/Produk.php';
require_once __DIR__ . '/Karyawan.php';
require_once __DIR__ . '/BiayaTempat.php';
require_once __DIR__ . '/PengeluaranHarian.php';

class HppCalculator {
    private $conn;
    private $produkModel;
    private $karyawanModel;
    private $biayaTempatModel;
    private $pengeluaranModel;

    public function __construct($db) {
        $this->conn = $db;
        $this->produkModel = new Produk($db);
        $this->karyawanModel = new Karyawan($db);
        $this->biayaTempatModel = new BiayaTempat($db);
        $this->pengeluaranModel = new PengeluaranHarian($db);
    }

    /**
     * Calculate HPP for a specific product
     * 
     * HPP = (Total Biaya Bahan + Biaya Karyawan Harian + Biaya Tempat Harian + Pengeluaran Lain) / Jumlah Produksi
     */
    public function calculate($produkId, $jumlahProduksi = null, $tanggal = null) {
        $tanggal = $tanggal ?? date('Y-m-d');

        // 1. Get product with recipe costs
        $produk = $this->produkModel->getWithResep($produkId);
        if (!$produk) {
            return ['error' => 'Produk tidak ditemukan'];
        }

        $jumlahProduksi = $jumlahProduksi ?? $produk['jumlah_produksi_default'] ?? 1;
        if ($jumlahProduksi <= 0) $jumlahProduksi = 1;

        // 2. Total biaya bahan baku (from recipe)
        $biayaBahan = $produk['total_biaya_bahan'] ?? 0;

        // 3. Biaya karyawan harian (all employees)
        $biayaKaryawan = $this->karyawanModel->getTotalBiayaHarian();

        // 4. Biaya tempat harian
        $biayaTempat = $this->biayaTempatModel->getBiayaHarian($tanggal);

        // 5. Pengeluaran harian lainnya
        $biayaLainnya = $this->pengeluaranModel->getTotalByDate($tanggal);

        // 6. Calculate HPP
        $totalBiaya = $biayaBahan + $biayaKaryawan + $biayaTempat + $biayaLainnya;
        $hppPerUnit = round($totalBiaya / $jumlahProduksi, 2);

        $result = [
            'produk' => [
                'id' => $produk['id'],
                'nama' => $produk['nama_produk'],
                'deskripsi' => $produk['deskripsi']
            ],
            'tanggal' => $tanggal,
            'jumlah_produksi' => (int)$jumlahProduksi,
            'breakdown' => [
                'biaya_bahan_baku' => round($biayaBahan, 2),
                'biaya_karyawan' => round($biayaKaryawan, 2),
                'biaya_tempat' => round($biayaTempat, 2),
                'biaya_lainnya' => round($biayaLainnya, 2),
                'total_biaya' => round($totalBiaya, 2)
            ],
            'hpp_per_unit' => $hppPerUnit,
            'detail_bahan' => $produk['resep'] ?? [],
            'proporsi' => [
                ['label' => 'Bahan Baku', 'value' => round($biayaBahan, 2), 'color' => '#8B4513'],
                ['label' => 'Karyawan', 'value' => round($biayaKaryawan, 2), 'color' => '#C41E3A'],
                ['label' => 'Tempat', 'value' => round($biayaTempat, 2), 'color' => '#D4AF37'],
                ['label' => 'Lainnya', 'value' => round($biayaLainnya, 2), 'color' => '#D4A574']
            ]
        ];

        // Save to HPP log
        $this->saveLog($produkId, $tanggal, $biayaBahan, $biayaKaryawan, $biayaTempat, $biayaLainnya, $jumlahProduksi, $hppPerUnit);

        return $result;
    }

    private function saveLog($produkId, $tanggal, $biayaBahan, $biayaKaryawan, $biayaTempat, $biayaLainnya, $jumlahProduksi, $hppPerUnit) {
        $stmt = $this->conn->prepare(
            "INSERT INTO hpp_log (produk_id, tanggal_hitung, biaya_bahan, biaya_karyawan, biaya_tempat, biaya_lainnya, jumlah_produksi, hpp_per_unit) 
             VALUES (:produk_id, :tanggal, :biaya_bahan, :biaya_karyawan, :biaya_tempat, :biaya_lainnya, :jumlah_produksi, :hpp_per_unit)"
        );
        $stmt->bindParam(':produk_id', $produkId);
        $stmt->bindParam(':tanggal', $tanggal);
        $stmt->bindParam(':biaya_bahan', $biayaBahan);
        $stmt->bindParam(':biaya_karyawan', $biayaKaryawan);
        $stmt->bindParam(':biaya_tempat', $biayaTempat);
        $stmt->bindParam(':biaya_lainnya', $biayaLainnya);
        $stmt->bindParam(':jumlah_produksi', $jumlahProduksi);
        $stmt->bindParam(':hpp_per_unit', $hppPerUnit);
        $stmt->execute();
    }

    public function getLog($filters = []) {
        $sql = "SELECT h.*, p.nama_produk 
                FROM hpp_log h 
                JOIN produk p ON h.produk_id = p.id 
                WHERE 1=1";
        $params = [];

        if (!empty($filters['produk_id'])) {
            $sql .= " AND h.produk_id = :produk_id";
            $params[':produk_id'] = $filters['produk_id'];
        }

        $sql .= " ORDER BY h.tanggal_hitung DESC, h.id DESC LIMIT 100";

        $stmt = $this->conn->prepare($sql);
        foreach ($params as $key => $val) {
            $stmt->bindValue($key, $val);
        }
        $stmt->execute();
        return $stmt->fetchAll();
    }

    /**
     * Calculate HPP for all products
     */
    public function calculateAll($tanggal = null) {
        $tanggal = $tanggal ?? date('Y-m-d');
        $produkModel = new Produk($this->conn);
        $allProduk = $produkModel->getAll();

        $results = [];
        foreach ($allProduk as $p) {
            $results[] = $this->calculate($p['id'], $p['jumlah_produksi_default'], $tanggal);
        }

        // Sort by HPP
        usort($results, function($a, $b) {
            return ($b['hpp_per_unit'] ?? 0) - ($a['hpp_per_unit'] ?? 0);
        });

        return $results;
    }
}
