<?php
// ============================================
// CONTROLLER: Satuan
// ============================================

require_once __DIR__ . '/../models/Satuan.php';

class SatuanController {
    private $model;

    public function __construct($db) {
        $this->model = new Satuan($db);
    }

    public function index() {
        $data = $this->model->getAll();
        return ['success' => true, 'data' => $data];
    }

    public function show($id) {
        $data = $this->model->getById($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Satuan tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama_satuan']) || empty($data['kategori'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama satuan dan kategori wajib diisi'];
        }

        $validKategori = ['berat', 'volume', 'satuan'];
        if (!in_array($data['kategori'], $validKategori)) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Kategori harus: berat, volume, atau satuan'];
        }

        try {
            $id = $this->model->create($data);
            $satuan = $this->model->getById($id);
            http_response_code(201);
            return ['success' => true, 'message' => 'Satuan berhasil ditambahkan', 'data' => $satuan];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['success' => false, 'message' => 'Gagal menambahkan satuan'];
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama_satuan']) || empty($data['kategori'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama satuan dan kategori wajib diisi'];
        }

        $this->model->update($id, $data);
        $satuan = $this->model->getById($id);
        return ['success' => true, 'message' => 'Satuan berhasil diperbarui', 'data' => $satuan];
    }

    public function destroy($id) {
        try {
            $this->model->delete($id);
            return ['success' => true, 'message' => 'Satuan berhasil dihapus'];
        } catch (PDOException $e) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Satuan masih digunakan, tidak bisa dihapus'];
        }
    }

    public function convert() {
        $data = json_decode(file_get_contents('php://input'), true);
        $result = $this->model->convert($data['from_satuan_id'], $data['to_satuan_id'], $data['value']);
        if ($result === false) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Tidak bisa mengonversi antar kategori yang berbeda'];
        }
        return ['success' => true, 'data' => ['converted_value' => $result]];
    }
}
