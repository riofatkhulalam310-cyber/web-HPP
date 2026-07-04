<?php
// ============================================
// MAIN ROUTER: Martabak Jepang API
// ============================================

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load config and dependencies
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/middleware/AuthMiddleware.php';

// Initialize database
$database = new Database();
$db = $database->getConnection();

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Remove query string and base path
$uri = parse_url($uri, PHP_URL_PATH);
$uri = rtrim($uri, '/');

// Remove /api prefix if present
$uri = preg_replace('#^/api#', '', $uri);
if (empty($uri)) $uri = '/';

// Extract ID from URI (e.g., /bahan-baku/5 => id=5)
$segments = explode('/', trim($uri, '/'));
$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;
$subResource = $segments[2] ?? null;
$subId = $segments[3] ?? null;

// Public routes (no auth required)
$publicRoutes = ['login', 'register'];

try {
    // ============================================
    // AUTH ROUTES
    // ============================================
    if ($resource === 'login' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        $controller = new AuthController($db);
        $response = $controller->login();
        echo json_encode($response);
        exit;
    }

    if ($resource === 'register' && $method === 'POST') {
        require_once __DIR__ . '/controllers/AuthController.php';
        $controller = new AuthController($db);
        $response = $controller->register();
        echo json_encode($response);
        exit;
    }

    // ============================================
    // PROTECTED ROUTES (require auth)
    // ============================================
    $userData = AuthMiddleware::authenticate();

    // ---- Auth Profile ----
    if ($resource === 'me' && $method === 'GET') {
        require_once __DIR__ . '/controllers/AuthController.php';
        $controller = new AuthController($db);
        echo json_encode($controller->me($userData));
        exit;
    }

    // ---- Satuan ----
    if ($resource === 'satuan') {
        require_once __DIR__ . '/controllers/SatuanController.php';
        $controller = new SatuanController($db);

        if ($id === 'convert' && $method === 'POST') {
            echo json_encode($controller->convert());
        } elseif ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- Bahan Baku ----
    if ($resource === 'bahan-baku') {
        require_once __DIR__ . '/controllers/BahanBakuController.php';
        $controller = new BahanBakuController($db);

        if ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- Produk & Resep ----
    if ($resource === 'produk') {
        require_once __DIR__ . '/controllers/ProdukController.php';
        $controller = new ProdukController($db);

        // Sub-resource: /produk/{id}/resep
        if ($id && $subResource === 'resep') {
            if ($method === 'GET') {
                echo json_encode($controller->getResep($id));
            } elseif ($method === 'POST') {
                echo json_encode($controller->addResep($id));
            } elseif ($method === 'PUT' && $subId) {
                echo json_encode($controller->updateResep($subId));
            } elseif ($method === 'DELETE' && $subId) {
                echo json_encode($controller->deleteResep($subId));
            }
            exit;
        }

        if ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- Pengeluaran Harian ----
    if ($resource === 'pengeluaran-harian') {
        require_once __DIR__ . '/controllers/PengeluaranController.php';
        $controller = new PengeluaranController($db);

        if ($id === 'rekap' && $method === 'GET') {
            echo json_encode($controller->rekap());
        } elseif ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- Biaya Tempat ----
    if ($resource === 'biaya-tempat') {
        require_once __DIR__ . '/controllers/BiayaTempatController.php';
        $controller = new BiayaTempatController($db);

        if ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- Karyawan ----
    if ($resource === 'karyawan') {
        require_once __DIR__ . '/controllers/KaryawanController.php';
        $controller = new KaryawanController($db);

        if ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- HPP ----
    if ($resource === 'hpp') {
        require_once __DIR__ . '/controllers/HppController.php';
        $controller = new HppController($db);

        if ($id === 'hitung' && $method === 'POST') {
            echo json_encode($controller->hitung());
        } elseif ($id === 'hitung-semua' && $method === 'GET') {
            echo json_encode($controller->hitungSemua());
        } elseif ($id === 'log' && $method === 'GET') {
            echo json_encode($controller->log());
        }
        exit;
    }

    // ---- Transaksi ----
    if ($resource === 'transaksi') {
        require_once __DIR__ . '/controllers/TransaksiController.php';
        $controller = new TransaksiController($db);

        if ($method === 'GET' && $id) {
            echo json_encode($controller->show($id));
        } elseif ($method === 'GET') {
            echo json_encode($controller->index());
        } elseif ($method === 'POST') {
            echo json_encode($controller->store());
        } elseif ($method === 'PUT' && $id) {
            echo json_encode($controller->update($id));
        } elseif ($method === 'DELETE' && $id) {
            echo json_encode($controller->destroy($id));
        }
        exit;
    }

    // ---- Dashboard ----
    if ($resource === 'dashboard') {
        require_once __DIR__ . '/controllers/DashboardController.php';
        $controller = new DashboardController($db);

        if ($id === 'summary' && $method === 'GET') {
            echo json_encode($controller->summary());
        }
        exit;
    }

    // ---- 404 ----
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint tidak ditemukan']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Internal server error',
        'error' => $e->getMessage()
    ]);
}
