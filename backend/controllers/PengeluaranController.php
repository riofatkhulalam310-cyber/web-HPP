<?php
// ============================================
// CONTROLLER: Pengeluaran Harian
// ============================================

require_once __DIR__ . '/../models/PengeluaranHarian.php';

class PengeluaranController {
    private $model;

    public function __construct($db) {
        $this->model = new PengeluaranHarian($db);
    }

    public function index() {
        $filters = [
            'tanggal_dari' => $_GET['tanggal_dari'] ?? null,
            'tanggal_sampai' => $_GET['tanggal_sampai'] ?? null,
            'jenis' => $_GET['jenis'] ?? null
        ];
        $data = $this->model->getAll($filters);
        return ['success' => true, 'data' => $data];
    }

    public function show($id) {
        $data = $this->model->getById($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Pengeluaran tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['tanggal']) || empty($data['jenis_pengeluaran']) || !isset($data['nominal'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Tanggal, jenis pengeluaran, dan nominal wajib diisi'];
        }

        if ($data['nominal'] < 0) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nominal tidak boleh negatif'];
        }

        $id = $this->model->create($data);
        $pengeluaran = $this->model->getById($id);
        http_response_code(201);
        return ['success' => true, 'message' => 'Pengeluaran berhasil ditambahkan', 'data' => $pengeluaran];
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['tanggal']) || empty($data['jenis_pengeluaran']) || !isset($data['nominal'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Tanggal, jenis pengeluaran, dan nominal wajib diisi'];
        }

        $this->model->update($id, $data);
        $pengeluaran = $this->model->getById($id);
        return ['success' => true, 'message' => 'Pengeluaran berhasil diperbarui', 'data' => $pengeluaran];
    }

    public function destroy($id) {
        $this->model->delete($id);
        return ['success' => true, 'message' => 'Pengeluaran berhasil dihapus'];
    }

    public function rekap() {
        $periode = $_GET['periode'] ?? 'harian';
        $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
        $data = $this->model->getRekap($periode, $tanggal);
        $total = $this->model->getTotalByDate($tanggal);
        return [
            'success' => true, 
            'data' => $data,
            'total_hari_ini' => $total
        ];
    }
}
