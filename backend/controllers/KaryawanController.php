<?php
// ============================================
// CONTROLLER: Karyawan
// ============================================

require_once __DIR__ . '/../models/Karyawan.php';

class KaryawanController {
    private $model;

    public function __construct($db) {
        $this->model = new Karyawan($db);
    }

    public function index() {
        $data = $this->model->getAll();
        $totalHarian = $this->model->getTotalBiayaHarian();
        return ['success' => true, 'data' => $data, 'total_biaya_harian' => $totalHarian];
    }

    public function show($id) {
        $data = $this->model->getById($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Karyawan tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama']) || !isset($data['gaji']) || empty($data['periode_gaji'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama, gaji, dan periode gaji wajib diisi'];
        }

        $validPeriode = ['harian', 'mingguan', 'bulanan'];
        if (!in_array($data['periode_gaji'], $validPeriode)) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Periode gaji harus: harian, mingguan, atau bulanan'];
        }

        $id = $this->model->create($data);
        $karyawan = $this->model->getById($id);
        http_response_code(201);
        return ['success' => true, 'message' => 'Karyawan berhasil ditambahkan', 'data' => $karyawan];
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->model->update($id, $data);
        $karyawan = $this->model->getById($id);
        return ['success' => true, 'message' => 'Karyawan berhasil diperbarui', 'data' => $karyawan];
    }

    public function destroy($id) {
        $this->model->delete($id);
        return ['success' => true, 'message' => 'Karyawan berhasil dihapus'];
    }
}
