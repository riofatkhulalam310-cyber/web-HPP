<?php
// ============================================
// CONTROLLER: Dashboard
// ============================================

require_once __DIR__ . '/../models/PengeluaranHarian.php';
require_once __DIR__ . '/../models/BiayaTempat.php';
require_once __DIR__ . '/../models/Karyawan.php';
require_once __DIR__ . '/../models/TransaksiPenjualan.php';
require_once __DIR__ . '/../models/HppCalculator.php';
require_once __DIR__ . '/../models/Produk.php';

class DashboardController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function summary() {
        $tanggal = $_GET['tanggal'] ?? date('Y-m-d');

        $pengeluaranModel = new PengeluaranHarian($this->db);
        $biayaTempatModel = new BiayaTempat($this->db);
        $karyawanModel = new Karyawan($this->db);
        $transaksiModel = new TransaksiPenjualan($this->db);
        $produkModel = new Produk($this->db);
        $hppCalc = new HppCalculator($this->db);

        // Daily stats
        $pengeluaranHarian = $pengeluaranModel->getTotalByDate($tanggal);
        $biayaTempatHarian = $biayaTempatModel->getBiayaHarian($tanggal);
        $biayaKaryawanHarian = $karyawanModel->getTotalBiayaHarian();
        $penjualanHarian = $transaksiModel->getTotalByDate($tanggal);

        // Monthly totals
        $monthStart = date('Y-m-01', strtotime($tanggal));
        $monthEnd = date('Y-m-t', strtotime($tanggal));
        $pengeluaranBulanan = $pengeluaranModel->getAll([
            'tanggal_dari' => $monthStart,
            'tanggal_sampai' => $monthEnd
        ]);
        $totalPengeluaranBulanan = array_sum(array_column($pengeluaranBulanan, 'nominal'));

        $transaksisBulanan = $transaksiModel->getAll([
            'tanggal_dari' => $monthStart,
            'tanggal_sampai' => $monthEnd
        ]);
        $totalPenjualanBulanan = 0;
        foreach ($transaksisBulanan as $t) {
            $totalPenjualanBulanan += $t['jumlah_terjual'] * $t['harga_jual'];
        }

        // Weekly totals
        $weekStart = date('Y-m-d', strtotime('-6 days', strtotime($tanggal)));
        $pengeluaranMingguan = $pengeluaranModel->getAll([
            'tanggal_dari' => $weekStart,
            'tanggal_sampai' => $tanggal
        ]);
        $totalPengeluaranMingguan = array_sum(array_column($pengeluaranMingguan, 'nominal'));

        // Expense trend (last 30 days)
        $trendStart = date('Y-m-d', strtotime('-29 days', strtotime($tanggal)));
        $stmt = $this->db->prepare(
            "SELECT DATE(tanggal) as tgl, SUM(nominal) as total 
             FROM pengeluaran_harian 
             WHERE tanggal >= :start AND tanggal <= :end 
             GROUP BY DATE(tanggal) ORDER BY tgl"
        );
        $stmt->bindParam(':start', $trendStart);
        $stmt->bindParam(':end', $tanggal);
        $stmt->execute();
        $trendPengeluaran = $stmt->fetchAll();

        // Sales trend (last 30 days)
        $stmt2 = $this->db->prepare(
            "SELECT DATE(tanggal) as tgl, SUM(jumlah_terjual * harga_jual) as total 
             FROM transaksi_penjualan 
             WHERE tanggal >= :start AND tanggal <= :end 
             GROUP BY DATE(tanggal) ORDER BY tgl"
        );
        $stmt2->bindParam(':start', $trendStart);
        $stmt2->bindParam(':end', $tanggal);
        $stmt2->execute();
        $trendPenjualan = $stmt2->fetchAll();

        // HPP per product
        $allProduk = $produkModel->getAll();
        $hppList = [];
        foreach ($allProduk as $p) {
            $produkDetail = $produkModel->getWithResep($p['id']);
            if ($produkDetail) {
                $biayaBahan = $produkDetail['total_biaya_bahan'] ?? 0;
                $totalBiaya = $biayaBahan + $biayaKaryawanHarian + $biayaTempatHarian + $pengeluaranHarian;
                $jumlahProduksi = $p['jumlah_produksi_default'] ?? 1;
                $hppList[] = [
                    'id' => $p['id'],
                    'nama_produk' => $p['nama_produk'],
                    'hpp_per_unit' => round($totalBiaya / $jumlahProduksi, 2),
                    'biaya_bahan' => round($biayaBahan, 2)
                ];
            }
        }

        // Sort by HPP
        usort($hppList, function($a, $b) {
            return $b['hpp_per_unit'] - $a['hpp_per_unit'];
        });

        // Biaya tempat info
        $biayaTempatInfo = $biayaTempatModel->getActive();

        return [
            'success' => true,
            'data' => [
                'tanggal' => $tanggal,
                'harian' => [
                    'pengeluaran' => round($pengeluaranHarian, 2),
                    'biaya_tempat' => round($biayaTempatHarian, 2),
                    'biaya_karyawan' => round($biayaKaryawanHarian, 2),
                    'total_biaya' => round($pengeluaranHarian + $biayaTempatHarian + $biayaKaryawanHarian, 2),
                    'penjualan' => round($penjualanHarian['total_penjualan'] ?? 0, 2),
                    'unit_terjual' => (int)($penjualanHarian['total_unit'] ?? 0)
                ],
                'mingguan' => [
                    'pengeluaran' => round($totalPengeluaranMingguan, 2)
                ],
                'bulanan' => [
                    'pengeluaran' => round($totalPengeluaranBulanan, 2),
                    'penjualan' => round($totalPenjualanBulanan, 2),
                    'biaya_tempat' => round($biayaTempatInfo['nominal_bulanan'] ?? 0, 2)
                ],
                'trend_pengeluaran' => $trendPengeluaran,
                'trend_penjualan' => $trendPenjualan,
                'hpp_produk' => $hppList,
                'jumlah_produk' => count($allProduk),
                'jumlah_karyawan' => count($karyawanModel->getAll())
            ]
        ];
    }
}
