<?php
// ============================================
// CONTROLLER: Bahan Baku
// ============================================

require_once __DIR__ . '/../models/BahanBaku.php';

class BahanBakuController {
    private $model;

    public function __construct($db) {
        $this->model = new BahanBaku($db);
    }

    public function index() {
        $data = $this->model->getAll();
        return ['success' => true, 'data' => $data];
    }

    public function show($id) {
        $data = $this->model->getById($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Bahan baku tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama_bahan']) || !isset($data['harga_beli']) || !isset($data['satuan_id'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama bahan, harga beli, dan satuan wajib diisi'];
        }

        if ($data['harga_beli'] < 0) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Harga beli tidak boleh negatif'];
        }

        try {
            $id = $this->model->create($data);
            $bahan = $this->model->getById($id);
            http_response_code(201);
            return ['success' => true, 'message' => 'Bahan baku berhasil ditambahkan', 'data' => $bahan];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['success' => false, 'message' => 'Gagal menambahkan bahan baku'];
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama_bahan']) || !isset($data['harga_beli']) || !isset($data['satuan_id'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama bahan, harga beli, dan satuan wajib diisi'];
        }

        $this->model->update($id, $data);
        $bahan = $this->model->getById($id);
        return ['success' => true, 'message' => 'Bahan baku berhasil diperbarui', 'data' => $bahan];
    }

    public function destroy($id) {
        $result = $this->model->delete($id);
        if (is_array($result) && isset($result['error'])) {
            http_response_code(400);
            return ['success' => false, 'message' => $result['error']];
        }
        return ['success' => true, 'message' => 'Bahan baku berhasil dihapus'];
    }
}
