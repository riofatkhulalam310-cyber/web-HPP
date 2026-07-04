<?php
// ============================================
// CONTROLLER: Produk & Resep
// ============================================

require_once __DIR__ . '/../models/Produk.php';
require_once __DIR__ . '/../models/ResepDetail.php';

class ProdukController {
    private $model;
    private $resepModel;

    public function __construct($db) {
        $this->model = new Produk($db);
        $this->resepModel = new ResepDetail($db);
    }

    public function index() {
        $data = $this->model->getAll();
        return ['success' => true, 'data' => $data];
    }

    public function show($id) {
        $data = $this->model->getWithResep($id);
        if (!$data) {
            http_response_code(404);
            return ['success' => false, 'message' => 'Produk tidak ditemukan'];
        }
        return ['success' => true, 'data' => $data];
    }

    public function store() {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama_produk'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama produk wajib diisi'];
        }

        try {
            $id = $this->model->create($data);

            // If resep data is provided, save it
            if (!empty($data['resep']) && is_array($data['resep'])) {
                foreach ($data['resep'] as $item) {
                    $item['produk_id'] = $id;
                    $this->resepModel->create($item);
                }
            }

            $produk = $this->model->getWithResep($id);
            http_response_code(201);
            return ['success' => true, 'message' => 'Produk berhasil ditambahkan', 'data' => $produk];
        } catch (PDOException $e) {
            http_response_code(500);
            return ['success' => false, 'message' => 'Gagal menambahkan produk: ' . $e->getMessage()];
        }
    }

    public function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);

        if (empty($data['nama_produk'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Nama produk wajib diisi'];
        }

        $this->model->update($id, $data);

        // If resep data is provided, replace all
        if (isset($data['resep']) && is_array($data['resep'])) {
            $this->resepModel->deleteByProdukId($id);
            foreach ($data['resep'] as $item) {
                $item['produk_id'] = $id;
                $this->resepModel->create($item);
            }
        }

        $produk = $this->model->getWithResep($id);
        return ['success' => true, 'message' => 'Produk berhasil diperbarui', 'data' => $produk];
    }

    public function destroy($id) {
        $result = $this->model->delete($id);
        if (is_array($result) && isset($result['error'])) {
            http_response_code(400);
            return ['success' => false, 'message' => $result['error']];
        }
        return ['success' => true, 'message' => 'Produk berhasil dihapus'];
    }

    // Resep sub-resource
    public function getResep($produkId) {
        $data = $this->resepModel->getByProdukId($produkId);
        return ['success' => true, 'data' => $data];
    }

    public function addResep($produkId) {
        $data = json_decode(file_get_contents('php://input'), true);
        $data['produk_id'] = $produkId;

        if (empty($data['bahan_baku_id']) || empty($data['jumlah_pakai']) || empty($data['satuan_id'])) {
            http_response_code(400);
            return ['success' => false, 'message' => 'Bahan baku, jumlah pakai, dan satuan wajib diisi'];
        }

        $id = $this->resepModel->create($data);
        http_response_code(201);
        return ['success' => true, 'message' => 'Bahan resep berhasil ditambahkan', 'data' => ['id' => $id]];
    }

    public function updateResep($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $this->resepModel->update($id, $data);
        return ['success' => true, 'message' => 'Bahan resep berhasil diperbarui'];
    }

    public function deleteResep($id) {
        $this->resepModel->delete($id);
        return ['success' => true, 'message' => 'Bahan resep berhasil dihapus'];
    }
}
