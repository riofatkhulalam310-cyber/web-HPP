<?php
// ============================================
// CONTROLLER: Biaya Tempat
// ============================================

require_once __DIR__ . '/../models/BiayaTempat.php';

class BiayaTempatController {
    private $model;

    public function __construct($db) {
        $this->model = new BiayaTempat($db);
    }

    public function index() {
        $data = $this->model->getAll();
        $biayaHarian = $this->model->getBiayaHarian();
        return ['success' => true, 'data' => $data, 'biaya_harian' => $biayaHarian];
    }

    public function show($id) {
        $data = $this->model->getById($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Biaya tempat tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['nominal_bulanan']) || empty($data['tanggal_berlaku'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nominal bulanan dan tanggal berlaku wajib diisi'];
        }

        $id = $this->model->create($data);
        $biaya = $this->model->getById($id);
        http_response_code(201);
        return ['success' => true, 'message' => 'Biaya tempat berhasil ditambahkan', 'data' => $biaya];
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->update($id, $data);
        $biaya = $this->model->getById($id);
        return ['success' => true, 'message' => 'Biaya tempat berhasil diperbarui', 'data' => $biaya];
    }

    public function destroy($id) {
        $this->model->delete($id);
        return ['success' => true, 'message' => 'Biaya tempat berhasil dihapus'];
    }
}
