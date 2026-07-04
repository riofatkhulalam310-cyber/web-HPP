<?php
// ============================================
// CONTROLLER: HPP
// ============================================

require_once __DIR__ . '/../models/HppCalculator.php';

class HppController {
    private $calculator;

    public function __construct($db) {
        $this->calculator = new HppCalculator($db);
    }

    public function hitung() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['produk_id'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Produk ID wajib diisi'];
        }

        $result = $this->calculator->calculate(
            $data['produk_id'],
            $data['jumlah_produksi'] ?? null,
            $data['tanggal'] ?? null
        );

        if (isset($result['error'])) {
            http_response_code(400);
            return ['success' => false, 'message' => $result['error']];
        }

        return ['success' => true, 'data' => $result];
    }

    public function hitungSemua() {
        $tanggal = $_GET['tanggal'] ?? date('Y-m-d');
        $results = $this->calculator->calculateAll($tanggal);
        return ['success' => true, 'data' => $results];
    }

    public function log() {
        $filters = [
            'produk_id' => $_GET['produk_id'] ?? null
        ];
        $data = $this->calculator->getLog($filters);
        return ['success' => true, 'data' => $data];
    }
}
