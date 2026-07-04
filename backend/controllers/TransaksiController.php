<?php
// ============================================
// CONTROLLER: Transaksi Penjualan
// ============================================

require_once __DIR__ . '/../models/TransaksiPenjualan.php';

class TransaksiController {
    private $model;

    public function __construct($db) {
        $this->model = new TransaksiPenjualan($db);
    }

    public function index() {
        $filters = [
            'tanggal_dari' => $_GET['tanggal_dari'] ?? null,
            'tanggal_sampai' => $_GET['tanggal_sampai'] ?? null,
            'produk_id' => $_GET['produk_id'] ?? null
        ];
        $data = $this->model->getAll($filters);
        return ['success' => true, 'data' => $data];
    }

    public function show($id) {
        $data = $this->model->getById($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Transaksi tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['produk_id']) || !isset($data['jumlah_terjual']) || 
            !isset($data['harga_jual']) || empty($data['tanggal'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Produk, jumlah, harga jual, dan tanggal wajib diisi'];
        }

        if ($data['jumlah_terjual'] <= 0) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Jumlah terjual harus lebih dari 0'];
        }

        $id = $this->model->create($data);
        $transaksi = $this->model->getById($id);
        http_response_code(201);
        return ['success' => true, 'message' => 'Transaksi berhasil ditambahkan', 'data' => $transaksi];
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->update($id, $data);
        $transaksi = $this->model->getById($id);
        return ['success' => true, 'message' => 'Transaksi berhasil diperbarui', 'data' => $transaksi];
    }

    public function destroy($id) {
        $this->model->delete($id);
        return ['success' => true, 'message' => 'Transaksi berhasil dihapus'];
    }
}
